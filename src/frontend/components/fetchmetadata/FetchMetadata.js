import axios from 'axios'
import metadata from './metadata.json'

export const FetchMetadata = async () => {
    try {
        // Extract CIDs from metadata
        const cids = metadata.items.map((item) => item.cid)

        // Base URL for fetching data from IPFS
        const baseUrl = 'https://gateway.pinata.cloud/ipfs/'

        // Array to store fetched data
        const fetchedData = []

        // Fetch data from IPFS for each CID
        for (const cid of cids) {
            try {
                const response = await axios.get(`${baseUrl}${cid}`)
                const data = response.data
                // Extract price from the fetched data
                const price = data.price
                console.log(`Price for ${data.songTitle}:`, price)
                // Add the data to the fetchedData array
                fetchedData.push(data)
            } catch (fetchError) {
                console.error(`Error fetching data for CID ${cid}:`, fetchError)
            }
        }
        return fetchedData
    } catch (error) {
        console.error('Error fetching metadata:', error)
        throw error
    }
}
