// SongCarouselTMP.js
import React from 'react'
import { Carousel } from 'antd' // Ant Design Carousel component
import 'antd/dist/reset.css' // Ant Design CSS
import './SongCarouselTMP.css' // Custom CSS for styling
import SongCardTMP from './SongCardTMP' // Import the SongCardTMP component

const SongCarouselTMP = ({ metadata }) => {
    console.log('Metadata:', metadata) // Check data here

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true, // Ensure arrows are enabled
    }

    return (
        <div className="carousel-container">
            <Carousel {...settings}>
                {metadata.map((item) => (
                    <div
                        key={item.tokenId}
                        className="carousel-item" // Use a class for custom styling
                    >
                        <SongCardTMP song={item} />
                    </div>
                ))}
            </Carousel>
        </div>
    )
}

export default SongCarouselTMP
