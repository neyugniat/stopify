import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './MyToken.css'

const MyToken = ({ contract }) => {
    const [tokens, setTokens] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchMyTokens = async () => {
            try {
                // Call getMyTokens function from the contract
                const tokens = await contract.getMyTokens()
                console.log('Tokens:', tokens)

                // Process and set tokens
                const processedTokens = tokens.map((token) => ({
                    tokenId: token.tokenId.toNumber(),
                    seller: token.seller,
                }))
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

    return (
        <div className="my-tokens-container">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : tokens.length === 0 ? (
                <p>You have no tokens.</p>
            ) : (
                <div className="tokens-list">
                    {tokens.map((token, index) => (
                        <div key={index} className="token-card">
                            <h3>Token ID: {token.tokenId}</h3>
                            <p>Seller: {token.seller}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyToken
