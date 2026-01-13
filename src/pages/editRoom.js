
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import { useEffect } from "react";
import toast from "react-hot-toast";

function EditRoom() {
  const { id } = useParams();

  const amenityOptions = ["WiFi", "AC", "TV", "Mini Bar", "Room Service", "Balcony"];

  const [formData, setFormData] = useState({
    name: "",
    type: "Standard",
    pricePerNight: "",
    offerPrice: "",
    capacity: "",
    beds: "",
    bedType: "Double",
    amenities: [],
    description: "",
    imagesToAdd: [],
    imagesToDelete: [],
  });

  const [previewImages, setPreviewImages] = useState([]);

  // Fetch existing room and prefill form
  const { data: room, isLoading: loadingRoom } = useQuery({
    queryKey: ["room", id],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/room/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch room");
      return data;
    },

  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || "",
        type: room.type || "Standard",
        pricePerNight: room.pricePerNight || "",
        offerPrice: room.offerPrice || "",
        capacity: room.capacity || "",
        beds: room.beds || "",
        bedType: room.bedType || "Double",
        amenities: room.amenities || [],
        description: room.description || "",
        imagesToAdd: [],
        imagesToDelete: [],
        isAvailable: room.isAvailable ?? true,
      });
      setPreviewImages(room.images || []);
    }
  }, [room]);
  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Amenity toggle
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

  // Upload new images
  // Upload new images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // 1. Add this line to show the preview immediately (using blob URLs)
    const newPreviews = files.map((file) => ({ url: URL.createObjectURL(file), isNew: true }));
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
      setFormData((prev) => ({
        ...prev,
        imagesToAdd: [...prev.imagesToAdd, ...base64Images],
      }));
    });
  };

  // Mark image for deletion
  const handleDeleteImage = (public_id) => {
    setFormData((prev) => ({
      ...prev,
      imagesToDelete: [...prev.imagesToDelete, { public_id }],
    }));
    setPreviewImages((prev) => prev.filter((img) => img.public_id !== public_id));
  };

  // Reset back to original room data
  const handleReset = () => {
    if (room) {
      setFormData({
        name: room.name,
        type: room.type,
        pricePerNight: room.pricePerNight,
        offerPrice: room.offerPrice || "",
        capacity: room.capacity,
        beds: room.beds,
        bedType: room.bedType,
        amenities: room.amenities || [],
        description: room.description || "",
        imagesToAdd: [],
        imagesToDelete: [],
        
      });
      setPreviewImages(room.images || []);
    }
  };

  // Mutation for update
  const { mutate,isPending: isUpdating, isError, error} = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/api/room/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update room");
      return data;
    },
    onSuccess(){
        toast.success("Room Updated")
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  if (loadingRoom) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <SvgSpinner size={36} color="#5D4017" stroke={4} />
      </div>
    );
  }

  return (
    <div className="create-room-wrapper">
      <div className="create-room-page">
        <div className="create-room-top">
          <h2 className="create-room-h2">Edit Room</h2>
          <Link to="/" style={{ textDecoration: "none" }}>
            <p className="go-back-p">Go Back</p>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form">
          {/* Same DOM structure as CreateRoom, but values prefilled from formData */}
          <div className="room-form-label-input-bar">
            <label>Room Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
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
              <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-2nd-line-row-flex">
            <div className="room-form-label-input-bar">
              <label>Offer Price</label>
              <input type="number" name="offerPrice" value={formData.offerPrice} onChange={handleChange} />
            </div>
            <div className="room-form-label-input-bar">
              <label>Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-2nd-line-row-flex">
            <div className="room-form-label-input-bar">
              <label>No of Beds</label>
              <input type="number" name="beds" value={formData.beds} onChange={handleChange} required />
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
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="room-form-label-input-bar">
            <label>Room Gallery</label>
            <input type="file" className="input-the-image"  multiple accept="image/*" onChange={handleImageUpload} />
            <div className="image-preview">
              {previewImages.map((img, idx) => (
                <div key={idx} className="preview-img-wrapper">
                  <img src={img.url} alt="preview" className="preview-img" />
                  <button type="button" className="remove-btn" 
                  onClick={() => {
                    if (img.public_id) {
                        handleDeleteImage(img.public_id); // Existing image
                    } else {
                        // New image: Just remove from preview and imagesToAdd array
                        setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                        setFormData(prev => ({
                        ...prev,
                        imagesToAdd: prev.imagesToAdd.filter((_, i) => i !== (idx - (room.images.length - formData.imagesToDelete.length)))
                        }));
                    }
                    }}>X</button>
                </div>
              ))}
            </div>
          </div>

          <div className="amenities-checkboxes">
            <h4>Select Amenities</h4>
            {amenityOptions.map((amenity) => (
              <div className="amenity-frid-4fr" key={amenity}>
                <label>
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

          <div className="room-form-label-input-bar" style={{marginTop:"3rem"}}>
            <label>Availability</label>
            <label className="switch" style={{marginTop:"1rem"}}>
                <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))
                }
                />
                <span className="slider round"></span>
            </label>
            <span style={{marginTop:"1rem"}} >
                {formData.isAvailable ? "Available" : "Not Available"}
            </span>
            </div>


          <div className="create-room-btn">
            <button type="button" className="reset-btn" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="publish-btn" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Room"}
            </button>
          </div>
        </form>

        {isError && <p style={{ color: "red" }}>{error.message}</p>}
{/*         {isSuccess && <p style={{ color: "green" }}>{data.message}</p>} */}
      </div>
    </div>
  );

}
export default EditRoom;