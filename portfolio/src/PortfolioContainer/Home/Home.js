import React from 'react'
import './Home.css'
import './Profile/Profile'
import Footer from './Footer/Footer'
import Profile from './Profile/Profile'
import Header from './Header/Header'

export default function Home() {
    return (
        <div className='home-container'>
            <Header />
            <Profile />
            <Footer />
        </div>
    )
}
