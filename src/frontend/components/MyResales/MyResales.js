import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Row, Col, Card } from 'react-bootstrap'
import { FetchMetadata } from '../fetchmetadata/FetchMetadata' // Adjust the path as necessary

export default function MyResales({ contract, account }) {
    const [loading, setLoading] = useState(true)
    const [listedItems, setListedItems] = useState([])
    const [soldItems, setSoldItems] = useState([])
    const [metadataItems, setMetadataItems] = useState([])

    const loadMyResales = async () => {
        try {
            // Fetch metadata from IPFS
            const metadataItems = await FetchMetadata()
            setMetadataItems(metadataItems)

            // Fetch listed items
            const filterListed = contract.filters.MarketItemRelisted(
                null,
                account,
                null
            )
            const resultsListed = await contract.queryFilter(filterListed)

            // Map results to items
            const listedItemsData = await Promise.all(
                resultsListed.map(async (i) => {
                    const itemMetadata = metadataItems.find(
                        (item) =>
                            item.tokenId.toString() ===
                            i.args.tokenId.toString()
                    )
                    if (!itemMetadata) return null

                    return {
                        price: i.args.price,
                        itemId: i.args.tokenId,
                        name: itemMetadata.songTitle,
                        audio: itemMetadata.audio,
                        image: itemMetadata.songCover, // Add image URL
                    }
                })
            )

            // Filter out null values
            const filteredListedItems = listedItemsData.filter(
                (item) => item !== null
            )
            setListedItems(filteredListedItems)

            // Fetch sold items
            const filterBought = contract.filters.MarketItemBought(
                null,
                account,
                null,
                null
            )
            const resultsBought = await contract.queryFilter(filterBought)
            const soldItemsData = filteredListedItems.filter((item) =>
                resultsBought.some(
                    (j) => item.itemId.toString() === j.args.tokenId.toString()
                )
            )
            setSoldItems(soldItemsData)
        } catch (error) {
            console.error('Error loading resales:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMyResales()
    }, [contract, account])

    if (loading)
        return (
            <main style={{ padding: '1rem 0' }}>
                <h2>Loading...</h2>
            </main>
        )

    return (
        <div className="flex justify-center">
            <div className="container px-5 py-3">
                {listedItems.length > 0 ? (
                    <>
                        <h2>Listed</h2>
                        <Row xs={1} md={2} lg={4} className="g-4 py-3">
                            {listedItems.map((item, idx) => (
                                <Col key={idx} className="overflow-hidden">
                                    <Card>
                                        <Card.Img
                                            variant="top"
                                            src={item.image}
                                            alt={item.name}
                                            className="card-image"
                                        />
                                        <Card.Body>
                                            <Card.Title>{item.name}</Card.Title>
                                            <div className="d-grid px-4 mb-2">
                                                <audio controls>
                                                    <source
                                                        src={item.audio}
                                                        type="audio/mpeg"
                                                    />
                                                    Your browser does not
                                                    support the audio element.
                                                </audio>
                                            </div>
                                            <Card.Text className="mt-1">
                                                {ethers.utils.formatEther(
                                                    item.price
                                                )}{' '}
                                                ETH
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <h2>Sold</h2>
                        {soldItems.length > 0 ? (
                            <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                {soldItems.map((item, idx) => (
                                    <Col key={idx} className="overflow-hidden">
                                        <Card>
                                            <Card.Img
                                                variant="top"
                                                src={item.image}
                                                alt={item.name}
                                                className="card-image"
                                            />
                                            <Card.Body>
                                                <Card.Title>
                                                    {item.name}
                                                </Card.Title>
                                                <Card.Text className="mt-1">
                                                    {ethers.utils.formatEther(
                                                        item.price
                                                    )}{' '}
                                                    ETH
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <main style={{ padding: '1rem 0' }}>
                                <h2>No sold assets</h2>
                            </main>
                        )}
                    </>
                ) : (
                    <main style={{ padding: '1rem 0' }}>
                        <h2>No listed assets</h2>
                    </main>
                )}
            </div>
        </div>
    )
}
