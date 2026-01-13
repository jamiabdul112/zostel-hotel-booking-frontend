import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import toast from "react-hot-toast";
import "../css/createOrder.css";

function CreateOrder() {
  const { roomId } = useParams(); // roomId from route
  const navigate = useNavigate();

  // Fetch selected room
  const { data: room, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/room/${roomId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch room");
      return data;
    },
  });

  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate nights and total price whenever inputs change
  useEffect(() => {
    if (room && checkInDate && checkOutDate) {
      const ms = new Date(checkOutDate) - new Date(checkInDate);
      const nights = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));

      const pricePerNight =
        room.offerPrice && room.offerPrice < room.pricePerNight
          ? room.offerPrice
          : room.pricePerNight;

      setTotalPrice(pricePerNight * nights);
    }
  }, [room, checkInDate, checkOutDate]);

  // Mutation for creating order
  const { mutate, isLoading: booking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomId: roomId,
          adults,
          kids,
          checkInDate,
          checkOutDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      
      navigate(`/order/my-order`); // redirect to order details
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleBook = () => {
    mutate();
  };

  

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <SvgSpinner size={36} color="#5D4017" stroke={4} />
      </div>
    );
  }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = checkInDate && checkOutDate ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 1;

    // 2. Calculate Original Total (Always the high price)
    const originalTotal = room.pricePerNight * nights;

    // 3. Calculate Difference (How much they saved)
    const discountAmount = originalTotal - totalPrice;

  if (!room) return <p>Room not found</p>;

  return (
    <div className="create-order-wrapper">
      <div className="create-order-page">
        <h2 className="create-order-h2">Create Your Booking</h2>
        <p className="create-order-p">Fill in the details to book your stay</p>
        <div className="left-create-info">
            <div className="room-info">
                <div className="room-info-left">
                    {room.images && room.images.length > 0 && (
                    <img src={room.images[0].url} alt={room.name} className="room-order-image" />
                    )}
                </div>
                <div className="room-info-right">
                    <div className="room-info-right-left">
                    <h2>{room.name}</h2>
                    <p>Type: {room.type}</p>
                    <p>Capacity: {room.capacity} guests</p>
                    </div>
                    <div className="room-info-right-right">
                    <p>₹{room.offerPrice || room.pricePerNight}</p>
                    <p className="faded">/Night</p>
                    </div>
                </div>
            </div>

        <form className="order-form-grid-2fr">
           <div className="form-column">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </div>


          <div className="form-column">
            <label>Adults</label>
            <input
              type="number"
              min="1"
              max={room.capacity}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
            />
          </div>

          <div className="form-column">
            <label>Check-out Date</label>
            <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
            />
          </div>

          <div className="form-column">
            <label>Kids</label>
            <input
              type="number"
              min="0"
              max={room.capacity - adults}
              value={kids}
              onChange={(e) => setKids(Number(e.target.value))}
            />
          </div>

        </form>
        </div>
                   
        <div className="right-create-info">
            <div className="right-infp-top"> 
            <h2>Booking Summary</h2>
            <div className="date-info">
                <div className="left-date">
                    <p>Check-in:</p>
                    <h3>{checkInDate}</h3>
                </div>
                <div className="right-date">
                    <p>Check-out:</p>
                    <h3>{checkOutDate}</h3>
                </div>
            </div>
            <div className="price-info-1">
                <p>{room.name}</p>
                <p className="price-bold">₹{originalTotal}</p>
                
            </div>

            {room.offerPrice && (
            <div className="price-info-2">
                <p>Discounted Price:</p>
                <p className="price-offer">₹{discountAmount}</p>
            </div>
            )}

            <div className="total-amount-row">
                <h3>Total Amount:</h3>
                <h3 className="total-amount-price">₹{totalPrice}</h3>
            </div>
            
            
        <button
          className="book-btn"
          onClick={handleBook}
          disabled={booking || !checkInDate || !checkOutDate}
        >
          {booking ? "Booking..." : "Confirm Booking"}
        </button>

        </div>
            <div className="right-info-bottom">
                <p className="spl-t">Need Help Booking?</p>
                <p className="spl-t-faded">Call our customer services team 24/7</p>
                <p className="spl-t-no">+91 9876543210</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
