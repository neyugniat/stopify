import React, { useState, useEffect, useRef } from 'react'
import { FetchMetadata } from './fetchmetadata/FetchMetadata' // Import the function
import metadataCID from './fetchmetadata/metadata.json'
import { ethers } from 'ethers'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Carousel } from 'antd'
import './Home.css' // Import the CSS for carousel styling

const Home = ({ contract }) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Get the signer from the provider
    const signer = provider.getSigner()
    const baseURI = 'https://gateway.pinata.cloud/ipfs/'
    const [metadata, setMetadata] = useState([])
    const [marketItems, setMarketItems] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const carouselRef = useRef(null)

    const loadMetadata = async () => {
        try {
            const fetchdata = await FetchMetadata()
            setMetadata(fetchdata)
            console.log(fetchdata)
        } catch (error) {
            setError('Error fetching metadata')
        } finally {
            setLoading(false)
        }
    }

    const loadMarketplaceItems = async () => {
        try {
            // Get all unsold items/tokens
            const results = await contract.getAllUnsoldTokens()

            // Debug: Check the structure of the results
            console.log('Results:', results)

            if (!results || !Array.isArray(results)) {
                throw new Error('Unexpected response format from contract')
            }

            const cids = metadataCID.items.map((item) => item.cid)
            const urls = cids.map((cid) => `${baseURI}${cid}`)

            // Fetch metadata for each URL
            const fetchPromises = urls.map((url) =>
                fetch(url).then((response) => response.json())
            )
            const metadataList = await Promise.all(fetchPromises)
            console.log('Metadata:', metadataList)

            // Map metadata to a tokenId for easier lookup
            const metadataMap = metadataList.reduce((map, metadata) => {
                map[metadata.tokenId] = metadata
                return map
            }, {})

            const tokens = results.map((item) => {
                const tokenId = item.tokenId ? item.tokenId.toNumber() : null
                const metadata = metadataMap[tokenId] || {}

                // Debug: Check the item structure
                console.log('Item:', item)

                return {
                    tokenId,
                    seller: item.seller,
                    priceInWei: item.price ? item.price.toString() : '0', // Handle undefined price
                    name: metadata.songTitle || 'Unknown Title',
                    audio: metadata.songUrl || '',
                    image: metadata.songCover || '',
                }
            })

            // Convert price from Wei to Ether and format it
            const formattedTokens = tokens.map((token) => {
                const priceInEther = ethers.utils.formatEther(token.priceInWei)
                const priceInEtherRounded = parseFloat(priceInEther).toFixed(0) // Round to 0 decimal places
                return {
                    ...token,
                    price: priceInEtherRounded, // Convert Wei to Ether without decimals
                }
            })

            setMarketItems(formattedTokens)
        } catch (error) {
            console.error('Error loading marketplace items:', error)
            setError('Error loading marketplace items')
        } finally {
            setLoading(false)
        }
    }

    const handleBuyToken = async (item) => {
        console.log('tokenId: ', item.tokenId)
        console.log('price: ', item.price)

        try {
            const priceInEther = item.price
            const priceInWei = ethers.utils.parseEther(priceInEther)

            // Get the current nonce
            const nonce = await provider.getTransactionCount(
                signer.getAddress()
            )

            // Create a transaction object
            const tx = {
                nonce: nonce, // Set the nonce
                gasLimit: 100000, // Set gas limit
                gasPrice: ethers.utils.parseUnits('10', 'gwei'), // Set gas price
                to: contract.address,
                value: priceInWei,
                data: contract.interface.encodeFunctionData('buyToken', [
                    item.tokenId,
                ]),
            }

            // Send the transaction
            const txResponse = await signer.sendTransaction(tx)
            await txResponse.wait()
            console.log('Transaction successful')
        } catch (error) {
            console.error('Error buying token:', error)
        }
    }

    useEffect(() => {
        const loadItems = async () => {
            try {
                await loadMarketplaceItems()
            } catch (error) {
                console.error('Error in useEffect:', error)
                setError('Error loading marketplace items')
            }
        }

        loadItems()
    }, [])

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
    }

    const goToNext = () => {
        carouselRef.current.next()
    }

    const goToPrev = () => {
        carouselRef.current.prev()
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div>
            <h1>THE ONLY GOOD MUSIC IN THE ENTIRE WORLD</h1>
            {marketItems && marketItems.length > 0 ? (
                <div className="carousel-container">
                    <Carousel {...settings} ref={carouselRef}>
                        {marketItems.map((item) => (
                            <div key={item.tokenId} className="carousel-item">
                                <div className="song-card">
                                    <div className="song-card-image-container">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="song-card-image"
                                        />
                                    </div>
                                    <div className="song-card-details">
                                        <h3 className="song-card-title">
                                            {item.name}
                                        </h3>
                                        <audio
                                            className="song-card-audio"
                                            controls
                                        >
                                            <source
                                                src={item.audio}
                                                type="audio/mpeg"
                                            />
                                            Your browser does not support the
                                            audio element.
                                        </audio>
                                        <p className="song-card-price">
                                            Price: {item.price} ETH
                                        </p>
                                        <button
                                            className="song-card-buy-button"
                                            onClick={() => handleBuyToken(item)}
                                        >
                                            Buy for {item.price} ETH
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                    <div className="carousel-controls">
                        <button className="carousel-prev" onClick={goToPrev}>
                            <FaChevronLeft />
                        </button>
                        <button className="carousel-next" onClick={goToNext}>
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            ) : (
                <p>No items found</p>
            )}
        </div>
    )
}

export default Home
