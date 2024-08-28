// SongCardTMP.js
import React from 'react'
import './SongCardTMP.css' // Import the corresponding CSS file

const SongCardTMP = ({ song }) => {
    // Extract the track ID from the song URL
    const trackId = song.songUrl.split('/').pop().split('?')[0]

    return (
        <div className="song-card">
            <div className="song-card-image-container">
                <iframe
                    src={`https://open.spotify.com/embed/track/${trackId}`}
                    width="300"
                    height="300" // Adjusted to show the album cover
                    frameBorder="0"
                    allow="encrypted-media"
                    title={song.songTitle}
                    className="song-card-image"
                ></iframe>
            </div>
            <div className="song-card-details">
                <h3 className="song-card-title">{song.songTitle}</h3>
                <p className="song-card-price">Price: {song.price}</p>
                <button className="song-card-button">
                    Buy for {song.price}
                </button>
            </div>
        </div>
    )
}

export default SongCardTMP
