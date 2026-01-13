import React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../css/header.css'
import { useQuery } from '@tanstack/react-query'
import { HashLink } from 'react-router-hash-link';
import { TbLogout2 } from "react-icons/tb";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
    });

    const handleLogout = async () => {
        try {
            // Use the full URL
            const res = await fetch(`${baseURL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
            });

            // Check if response is actually JSON
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || "Logout failed");

            toast.success("Logged out successfully");
            navigate("/login");
        } catch (err) {
            toast.error(err.message);
        }
        };


    return (
        <div className='header-fixed'>
            <div className='header-page'>
                <p className='header-p'>Zostel</p>
                {!isMobile ? (
                    <nav className="nav-links desktop">
                        <div className='nav-menuss'>
                            <HashLink smooth to="/#home">
                            <a>Home</a>
                            </HashLink>
                            <HashLink smooth to="/#rooms">
                            <a href="#solution">Rooms</a>
                            </HashLink>
                            <Link to="/">
                            <a href="#service">Services</a>
                            </Link>
                            <Link to="/">
                            <a href="#about">About Us</a>
                            </Link>
                            {authUser?.role === "admin" && (
                            <Link to="/admin/add-room">
                            <a>Create Room</a>
                            </Link> ) }
                            {authUser?.role === "admin" && (
                            <Link to="/admin/orders">
                            <a>Admin Orders</a>
                           
                            </Link> ) }
                                
                             <button className="logout-btn" onClick={handleLogout}>
                                <TbLogout2 size={20} />
                            </button>
                            <a href="#contact">Contact Us</a>

                        </div>
                        <Link to="/order/my-order">
                            <button className="book-table">My Bookings</button>
                        </Link>
                    </nav>
                ) : (
                    <>
                        {!isOpen ? (
                            <button className="hamburger" onClick={() => setIsOpen(true)}>
                                <div className="bar" />
                                <div className="bar" />
                                <div className="bar" />
                            </button>
                        ) : (
                            <div className="mobile-menu-overlay">
                                <button className="close-btn" onClick={() => setIsOpen(false)}>
                                    ✕
                                </button>
                                <nav className="nav-links mobile" onClick={() => setIsOpen(false)}>
                                            <HashLink smooth to="/#home">
                                            <a>Home</a>
                                            </HashLink>
                                            <HashLink smooth to="/#rooms">
                                            <a href="#solution">Rooms</a>
                                            </HashLink>
                                            <Link to="/">
                                            <a href="#service">Services</a>
                                            </Link>
                                            <Link to="/">
                                            <a href="#about">About Us</a>
                                            </Link>
                                            {authUser?.role === "admin" && (
                                            <Link to="/admin/add-room">
                                            <a>Create Room</a>
                                            </Link> ) }
                                            {authUser?.role === "admin" && (
                                            <Link to="/admin/orders">
                                            <a>Admin Orders</a>
                                            </Link> ) }

                                            <button className="logout-btn" onClick={handleLogout}>
                                                <TbLogout2 size={20} />
                                            </button>
                                            <a href="#contact">Contact Us</a>
                                    <Link to="/order/my-order">
                                            <button className="book-table">My Bookings</button>
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Header