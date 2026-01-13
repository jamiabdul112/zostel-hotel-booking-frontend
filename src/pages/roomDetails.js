import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import "../css/roomDetails.css"
import Rooms from "./rooms";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

function RoomDetails() {
    const { id } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const queryClient = useQueryClient();


    const { data: room, isLoading, isError, error } = useQuery({
        queryKey: ["room", id],
        queryFn: async () => {
            const res = await fetch(`${baseURL}/api/room/${id}`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || "Failed to fetch room");
            }
            return data;
        },
    });

      const { data: authUser } = useQuery({
            queryKey: ["authUser"],
        });


       
    // inside RoomDetails component
    const navigate = useNavigate();

    // mutation for delete
    const { mutate: deleteRoomMutation, isLoading: deleting } = useMutation({
    mutationFn: async () => {
        const res = await fetch(`${baseURL}/api/room/${id}`, {
        method: "DELETE",
        credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete room");
        return data;
    },
    onSuccess: () => {
        toast.success("Room Deleted")
        queryClient.invalidateQueries({ 
                queryKey: ["rooms"] 
            });
        // redirect to rooms list after deletion
        navigate("/");
    },
    });

    const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this room?")) {
        deleteRoomMutation();
    }
    };

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

    if (!room) {
        return <p style={{ textAlign: "center", marginTop: "5rem" }}>Room not found</p>;
    }

    // Handle image navigation
    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? room.images.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev === room.images.length - 1 ? 0 : prev + 1
        );
    };

    

    return (
        <>
        <div className="room-details-wrapper">
        <div className="room-details">
            <div className="room-details-top">
                <h2 className="room-title-dtn">{room.name}</h2>
                <p className="room-type-dtn">Type: {room.type}</p>
                <div className="room-details-top-info-row">
                    <p>Capacity: {room.capacity} guests</p>
                    <p>Beds: {room.beds} ({room.bedType})</p>
                    {authUser?.role === "admin" && (
                        <Link to={`/admin/rooms/edit/${id}`}><button className="edit-room-btn">Edit</button></Link>
                    )}
                    {authUser?.role === "admin" && (
                    <button className="delete-room-btn" onClick={handleDelete} disabled={deleting} >
                    {deleting ? "Deleting..." : "Delete"}
                    </button>
                    )}
                </div>
            </div>
            {/* Image Carousel */}

                {room.images && room.images.length > 0 && (

                    <div className="room-carousel">
                        <img
                            src={room.images[currentIndex].url}
                            alt={room.name}
                            className="room-detail-image"
                        />

                        {room.images.length > 1 && (<div className="image-s-button-space-between-row">
                            <button className="carousel-btn left" onClick={handlePrev}>
                                ◀
                            </button>
                            <div className="right-btn-div-column">
                            <button className="carousel-btn right" onClick={handleNext}>
                                ▶
                            </button>
                            {/* <div className="carousel-indicator">
                                {currentIndex + 1} / {room.images.length}
                            </div> */}
                            </div>
                            </div>)
                        }
                        
                    </div>
                ) }


            {/* Room Info */}
            <div className="room-content">
                <div className="room-content-left">
                    <div className="room-description">
                        <h4>About this room </h4>
                        <p>{room.description || "No description available"}</p>
                    </div>
                    <div className="room-amenities">
                        <h4>Amenities</h4>
                        {room.amenities && room.amenities.length > 0 ? (
                            <ul>
                                {room.amenities.map((amenity, index) => (
                                    <li key={index}>{amenity}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No amenities listed</p>
                        )}
                    </div>
                        <h4 className="things-h4">Things to know</h4>
                    <div className="things-to-know-grid-2fr">
                        
                        <p>Check-in: 3:00PM - 10:00pm</p>
                        <p>Checkout: 11:00AM</p>
                        <p>No smoking</p>
                        <p>No pets allowed</p>
                    </div>
                            <p className="room-availability" style={{marginTop:"35px"}}>
                                {room.isAvailable ? "• Available" : "• Currently not available"}
                            </p>
                            <h4 className="things-h4">Explore Rooms</h4>
                </div>
                <div className="room-content-right">
                    <p className="starting-from-p">Starting from</p>
                    {room.offerPrice ? (
                        <p className="room-price">
                            <span className="original-price-cnt">₹{room.pricePerNight} </span>
                            <span className="offer-price-cnt">₹{room.offerPrice} </span>
                            <span className="discount-badge-cnt">{room.discountPercentage}% OFF </span>
                            <span className="night-dtn">/night</span>
                        </p>
                    ) : (
                        <p className="room-price">
                        <span className="room-price">₹{room.pricePerNight}</span>
                        <span className="discount-badge-cnt">{room.discountPercentage}% OFF </span>
                        <span className="night-dtn">/night</span>
                        </p>
                    )}

                    <Link to={`/order/create/${room._id}`} style={{ textDecoration: "none" }}>
                    {room.isAvailable ? (
                    <button className="room-dt-btn">Book Now</button>
                    ) : (
                    <button className="room-dt-btn" style={{opacity:"0.7"}} disabled>Unavailable</button>
                    )}
                    </Link>
                </div>



                

               
            </div>
        </div>
                
                <Rooms activeRoomId={room._id}/>
        </div>
           
        </>
    );
}

export default RoomDetails;
