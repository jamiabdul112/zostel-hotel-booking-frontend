import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import '../css/createRoom.css'

function CreateRoom() {
    const initialFormState ={
        name: "",
        type: "Standard",
        pricePerNight: "",
        offerPrice: "",
        capacity: "",
        beds: "",
        bedType: "Double",
        amenities: [],
        description: "",
        images: [],
    };


    const [formData, setFormData] = useState(initialFormState);
    const [previewImages, setPreviewImages] = useState([]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle amenity checkbox toggle
    const handleAmenityToggle = (amenity) => {
        setFormData((prev) => {
            const exists = prev.amenities.includes(amenity);
            return {
                ...prev,
                amenities: exists
                    ? prev.amenities.filter((a) => a !== amenity)
                    : [...prev.amenities, amenity],
            };
        });
    };

    // Handle image uploads (convert to base64)
    // Handle image uploads (convert to base64)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
        // 1. Generate blob URLs for immediate preview
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        
        // Use the functional update to APPEND to existing previews
        setPreviewImages((prev) => [...prev, ...newPreviews]);

        Promise.all(
        files.map(
            (file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            })
        )
        ).then((base64Images) => {
        // 2. Use functional update to APPEND to existing Base64 strings in formData
        setFormData((prev) => ({ 
            ...prev, 
            images: [...prev.images, ...base64Images] 
        }));
        });
    };

    // Mutation for creating room
    const { mutate, isPending: isUpdating, isError, error } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${baseURL}/api/room`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create room");
            return data;
        },
        onSuccess: () => {
            toast.success("Room added successfully");
            
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate();
    };

    const handleReset = () => { 
        setFormData(initialFormState); 
        setPreviewImages([]); 
    };

    // Amenity options
    const amenityOptions = ["WiFi", "AC", "TV", "Mini Bar", "Room Service", "Balcony"];

    return (
        <div className="create-room-wrapper">
        <div className="create-room-page">
            <div className="create-room-top">
            <h2 className="create-room-h2">Add New Room</h2>
            <Link to="/" style={{textDecoration:"none"}}><p className="go-back-p">Go Back</p></Link>
            </div>
            <form onSubmit={handleSubmit} className="create-room-form">
                <div className="room-form-label-input-bar">
                <label>Room Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Room Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                </div>
                <div className="form-2nd-line-row-flex">
                <div className="room-form-label-input-bar">
                <label>Room Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                </select>
                </div>
                <div className="room-form-label-input-bar">
                <label>Price Per Night</label>
                <input
                    type="number"
                    name="pricePerNight"
                    placeholder="Price per night"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    required
                />
                </div>
                </div>
                <div className="form-2nd-line-row-flex">
                <div className="room-form-label-input-bar">
                <label>Offer Price</label>
                <input
                    type="number"
                    name="offerPrice"
                    placeholder="Offer Price (optional)"
                    value={formData.offerPrice}
                    onChange={handleChange}
                />
                </div>
                <div className="room-form-label-input-bar">
                <label>Capacity</label>
                <input
                    type="number"
                    name="capacity"
                    placeholder="Capacity (guests)"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                />
                </div>
                </div>
                <div className="form-2nd-line-row-flex">
                <div className="room-form-label-input-bar">
                <label>No of Beds</label>
                <input
                    type="number"
                    name="beds"
                    placeholder="Number of beds"
                    value={formData.beds}
                    onChange={handleChange}
                    required
                />
                </div>
                <div className="room-form-label-input-bar">
                <label>Bed type</label>
                <select name="bedType" value={formData.bedType} onChange={handleChange}>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                </select>
                </div>
                </div>
                <div className="room-form-label-input-bar">
                <label>Description</label>
                <textarea
                    name="description"
                    placeholder="Room Description"
                    value={formData.description}
                    onChange={handleChange}
                />
                </div>

                <div className="room-form-label-input-bar">
                <label>Room Gallery</label>

                <input type="file" className="input-the-image" multiple accept="image/*" onChange={handleImageUpload} />

                {/* Preview uploaded images */}
                <div className="image-preview">
                    {previewImages.map((src, idx) => (
                        <img key={idx} src={src} alt="preview" className="preview-img" />
                    ))}
                </div>
                </div>

                
                {/* Amenity Checkboxes */}
                <div className="amenities-checkboxes">
                    <h4>Select Amenities</h4>
                    {amenityOptions.map((amenity) => (
                        <div className="amenity-frid-4fr">
                        <label key={amenity}>
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity)}
                                onChange={() => handleAmenityToggle(amenity)}
                            />
                            {amenity}
                        </label>
                        </div>
                    ))}
                </div>
                


                <div className="create-room-btn">
                    <button type="button" className="reset-btn" onClick={handleReset} >
                        Reset
                    </button>
                    <button type="submit" className="publish-btn" disabled={isUpdating}>
                        {isUpdating ? "Publishing..." : "Publish Room"}
                    </button>
                </div>
            </form>

            {isError && <p style={{ color: "red" }}>{error.message}</p>}
           {/*  {isSuccess && <p style={{ color: "green" }}>{data.message}</p>} */}
        </div>
        </div>
    );
}

export default CreateRoom;
