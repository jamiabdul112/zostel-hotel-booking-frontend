import React from 'react'
import '../css/home.css'
import Rooms from './rooms'

function Home() {
  
  return (
    <>
    <div id='home'></div>
    <div className='home-wrapper'>
      <div className='home-page' style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://i.pinimg.com/1200x/52/45/b2/5245b2ee497f6bf4405833324280468b.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }} >
            <div className='home-hero'>
                <p className='home-hero-p'>DISCOVER COMFORT</p>
                <h1 className='home-hero-h1'>Our Rooms & Suites</h1>
                <button className='home-hero-btn'>Explore Now</button>

            </div>
        </div>
    </div>
    <div id='rooms' ></div>

      <Rooms />
    </>
  )
}

export default Home