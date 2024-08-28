// FetchMetadata.js
import metadata from './data/temp_metadata.json' // Import the JSON data

export const FetchMetadataTMP = () => {
    try {
        return metadata // Directly return the imported JSON data
    } catch (error) {
        console.error('Error fetching metadata:', error)
        return []
    }
}
