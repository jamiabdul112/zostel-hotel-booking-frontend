import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import { Link } from "react-router-dom";
import '../css/room.css'

function Rooms({ activeRoomId }) {
    const [feedType, setFeedType] = useState("All");

    // Decide endpoint based on feedType
    const endpoint =
        feedType === "All"
            ? `${baseURL}/api/room`
            : `${baseURL}/api/room/type/${feedType}`;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["rooms", feedType],
        queryFn: async () => {
            const res = await fetch(endpoint, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || "Failed to fetch rooms");
            }
            // For /api/room/type/:type, backend returns { count, rooms }
            return data.rooms || data;
        },
    });

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem", marginTop: "5rem" }}>
                <SvgSpinner size={36} color="#5D4017" stroke={4} />
            </div>
        );
    }

    if (isError) {
        return <p style={{ color: "red", textAlign: "center" }}>{error.message}</p>;
    }

    if (!data || data.length === 0) { 
        return (
        <p style={{ textAlign: "center", marginTop: "5rem" }}> Currently not available: {feedType} rooms </p>
    ); 
}

    return (
        <div className="room-wrapper">
            {/* Category Tabs */}
            <div className="home-category">
                <div
                    className={`tab-item ${feedType === "All" ? "active" : ""}`}
                    onClick={() => setFeedType("All")}
                >
                    All
                    {feedType === "All" && <div className="tab-indicator"></div>}
                </div>
                <div
                    className={`tab-item ${feedType === "Deluxe" ? "active" : ""}`}
                    onClick={() => setFeedType("Deluxe")}
                >
                    Deluxe
                    {feedType === "Deluxe" && <div className="tab-indicator"></div>}
                </div>
                <div
                    className={`tab-item ${feedType === "Suite" ? "active" : ""}`}
                    onClick={() => setFeedType("Suite")}
                >
                    Suite
                    {feedType === "Suite" && <div className="tab-indicator"></div>}
                </div>
                <div
                    className={`tab-item ${feedType === "Standard" ? "active" : ""}`}
                    onClick={() => setFeedType("Standard")}
                >
                    Standard
                    {feedType === "Standard" && <div className="tab-indicator"></div>}
                </div>
            </div>

            {/* Room Grid */}
            <div className="room-grid">

                {data.map((room) => (
                    <Link
                        to={`/room/${room._id}`}
                        key={room._id}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <div className={`room-card ${room._id === activeRoomId ? "active-room" : ""}`}>

                            {room.images && room.images.length > 0 && (
                                <img
                                    src={room.images[0]?.url || room.images[0]} // Checks if it's an object or a string
                                    alt={room.name}
                                    className="room-image"
                                />
                            )}
                            
                            <p className="room-type">{room.type}</p>
                            <h3 className="room-title">{room.name}</h3>
                            <div className="room-s-info">
                                <p className="room-s-info-p">{room.capacity} Guests</p>
                                <p className="room-s-info-p">{room.beds} Beds</p>
                            </div>
                            {room.offerPrice ? (
                                <div className="room-s-price-row">
                                    <div className="room-s-price-left-column">
                                    <p className="room-price">
                                        <span className="original-price">₹{room.pricePerNight}</span>{" "}
                                        <span className="offer-price">₹{room.offerPrice}</span>{" "}
                                        
                                    </p>
                                    <p className="room-night">/Night</p>
                                    </div>
                                    <button className="room-s-price-btn">DETAILS</button>
                                </div>
                            ) : (
                                    <div className="room-s-price-row">
                                        <div className="room-s-price-left-column">
                                            <p className="room-price">
                                                <span className="room-price">₹{room.pricePerNight}</span>{" "}
                                               

                                            </p>
                                            <p className="room-night">/Night</p>
                                        </div>
                                        <button className="room-s-price-btn">DETAILS</button>
                                    </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Rooms;
