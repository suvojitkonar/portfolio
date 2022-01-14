import React from 'react'
import Typical from 'react-typical'
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Profile.css";

export default function Profile() {
    return (
        <div className='profile-container'>
            <div className='profile-parent'>
                <div className='profile-details'>
                    <div className='colz'>
                        <div className='colz-icon'>
                            <a href="https://mail.google.com/mail/u/0/#inbox">
                                <i className="fa fa-google-plus-square" > </i>
                            </a>
                            <a href="https://www.instagram.com/suvojitkonar/">
                                <i className="fa fa-instagram" > </i>
                            </a>
                            <a href="https://www.linkedin.com/in/suvojit-konar-5168a6161/">
                                <i className="fa fa-linkedin" > </i>
                            </a>
                        </div>
                    </div>
                    <div className='profile-details-name'>
                        <span className='primary-text'>
                            {" "}
                            Hello World, I 'm <span className='highlighted-text'>Suvojit</span>
                        </span>
                    </div>
                    <div className='profile-details-role'>
                        <span className='primary-text'>
                            {" "}
                            <h1> {" "}
                                <Typical loop={Infinity}
                                    steps={
                                        [
                                            "Enthusiastic dev 👌",
                                            2000,
                                            "Full stack developer 😎",
                                            2000,
                                            "Software Engineer 💻",
                                            2000,
                                            "Spark & Hadoop Developer 📲",
                                            2000
                                        ]
                                    }
                                />
                            </h1>
                            <span className='profile-role-tagline'>
                                Knack of building applications with frontend and backend operations. </span>
                        </span>
                    </div>
                    <div className='profile-options'>
                        <button className='primary-btn'>
                            {""}
                            Hire me {" "}
                        </button>
                        <a href='Resume_BigData_Java.pdf'
                            download={'Resume Resume_BigData_Java.pdf'} >
                            <button className='highlighted-btn'> Get Resume </button>
                        </a>
                    </div>
                </div>
                <div className='profile-picture'>
                    <div className='profile-picture-background'>
                    </div>
                </div>
            </div>
        </div>
    )
}