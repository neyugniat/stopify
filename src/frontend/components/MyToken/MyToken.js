import React, { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { FetchMetadata } from '../fetchmetadata/FetchMetadata' // Adjust the path if necessary
import './MyToken.css'

const MyToken = ({ contract }) => {
    const audioRefs = useRef([])
    const [isPlaying, setIsPlaying] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tokens, setTokens] = useState([])
    const [error, setError] = useState(null)
    const [selected, setSelected] = useState(0)
    const [previous, setPrevious] = useState(null)
    const [resellId, setResellId] = useState(null)
    const [resellPrice, setResellPrice] = useState('')

    useEffect(() => {
        const fetchMyTokens = async () => {
            try {
                // Fetch tokens owned by the user
                const tokens = await contract.getMyTokens()
                console.log('Tokens:', tokens)

                // Fetch metadata using FetchMetadata function
                const metadataList = await FetchMetadata()
                console.log('Metadata:', metadataList)

                // Create a map of metadata for easy lookup
                const metadataMap = metadataList.reduce((map, metadata) => {
                    map[metadata.tokenId] = metadata
                    return map
                }, {})

                // Process and set tokens
                const processedTokens = tokens.map((token) => {
                    const tokenId = token.tokenId.toNumber()
                    const metadata = metadataMap[tokenId] || {}
                    return {
                        tokenId,
                        seller: token.seller,
                        name: metadata.songTitle || 'Unknown Title',
                        image: metadata.songCover || 'default-image-url', // Default image URL if not provided
                        audio: metadata.songUrl || '', // URL for the audio file
                    }
                })
                setTokens(processedTokens)
            } catch (error) {
                console.error('Error fetching tokens:', error)
                setError('Error fetching tokens')
            } finally {
                setLoading(false)
            }
        }

        fetchMyTokens()
    }, [contract]) // Add contract as a dependency to refetch if it changes

    const resellItem = async (item) => {
        if (resellPrice === '0' || item.tokenId !== resellId || !resellPrice)
            return
        try {
            const signer = contract.signer // Get the signer from the contract

            // Convert the resell price to Wei
            const priceInWei = ethers.utils.parseEther(resellPrice.toString())

            // Get the nonce for the signer
            const nonce = await signer.getTransactionCount() // Use signer to get the nonce

            // Create a transaction object
            const tx = {
                nonce: nonce, // Set the nonce
                gasLimit: 100000, // Set gas limit
                gasPrice: ethers.utils.parseUnits('10', 'gwei'), // Set gas price
                to: contract.address,
                data: contract.interface.encodeFunctionData('resellToken', [
                    item.tokenId,
                    priceInWei, // Ensure you pass the correct type
                ]),
            }

            // Send the transaction directly
            const transactionResponse = await signer.sendTransaction(tx)

            // Wait for the transaction to be mined
            await transactionResponse.wait()

            // Remove the resold token from the user's tokens list
            const updatedTokens = tokens.filter(
                (token) => token.tokenId !== item.tokenId
            )
            setTokens(updatedTokens)
        } catch (error) {
            console.error('Error reselling token:', error)
            setError('Error reselling token')
        }
    }

    useEffect(() => {
        if (isPlaying) {
            audioRefs.current[selected].play()
            if (selected !== previous) audioRefs.current[previous].pause()
        } else if (isPlaying !== null) {
            audioRefs.current[selected].pause()
        }
    }, [isPlaying, selected, previous])

    if (loading)
        return (
            <main style={{ padding: '1rem 0' }}>
                <h2>Loading...</h2>
            </main>
        )

    return (
        <div className="my-tokens-container">
            {error ? (
                <p>{error}</p>
            ) : tokens.length === 0 ? (
                <p>You have no tokens.</p>
            ) : (
                <div className="tokens-list">
                    {tokens.map((token, index) => (
                        <div key={index} className="token-card">
                            <img
                                src={token.image}
                                alt={token.name}
                                className="token-image"
                            />
                            <div className="token-details">
                                <h3>Token ID: {token.tokenId}</h3>
                                <p>Name: {token.name}</p>
                                <p>Seller: {token.seller}</p>
                                {token.audio && (
                                    <div className="audio-player">
                                        <audio
                                            controls
                                            ref={(el) =>
                                                (audioRefs.current[index] = el)
                                            }
                                        >
                                            <source
                                                src={token.audio}
                                                type="audio/mpeg"
                                            />
                                            Your browser does not support the
                                            audio element.
                                        </audio>
                                    </div>
                                )}
                            </div>
                            <div className="resell-section">
                                <input
                                    type="number"
                                    value={
                                        resellId === token.tokenId
                                            ? resellPrice
                                            : ''
                                    }
                                    onChange={(e) => {
                                        setResellId(token.tokenId)
                                        setResellPrice(e.target.value)
                                    }}
                                    placeholder="Price in ETH"
                                    min="0"
                                />
                                <button
                                    onClick={() => resellItem(token)}
                                    disabled={
                                        resellId !== token.tokenId ||
                                        !resellPrice
                                    }
                                >
                                    Resell
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyToken
