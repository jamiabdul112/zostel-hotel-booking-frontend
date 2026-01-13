import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import "../css/orderDetails.css"
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";

function OrderDetails() {
  const { id } = useParams(); // get orderId from URL
  const queryClient = useQueryClient();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Fetch function
  const fetchOrder = async () => {
    const res = await fetch(`${baseURL}/api/order/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to fetch order");
    }
    return data;
  };

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: fetchOrder,
  });

  const handlePay = async () => {
    try {
      // Step 1: Open the external payment/UPI link
      if (order.paymentLink) {
        window.open(order.paymentLink, "_blank");
      }

      // Step 2: Call backend to mark as Paid and generate the receipt
      const res = await fetch(`${baseURL}/api/order/${order._id}/pay`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment update failed");
      }

      // Step 3: Handle successful UI update
      if (data.order.status === "Paid") {
        alert("Payment marked as successful!");

        // Refetch order data so the UI (status badges, etc.) updates instantly
        queryClient.invalidateQueries(["order", id]);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert(error.message || "An error occurred while processing payment.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <SvgSpinner size={36} color="#5D4017" stroke={4} />
      </div>
    );
  }

  if (isError) {
    return <p style={{ color: "red", textAlign: "center" }}>{error.message}</p>;
  }

  if (!order) {
    return <p style={{ textAlign: "center" }}>Order not found.</p>;
  }

  const { roomId, checkInDate, checkOutDate, totalPrice, status, adults, kids } = order;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Difference in milliseconds
    const diffTime = checkOut - checkIn; 

    // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
    // We use Math.max(1, ...) to ensure at least 1 night is counted
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const bgImageUrl = roomId?.images?.[0]?.url || roomId?.images?.[0];


    
  return (
    <div className="order-details-wrapper">
        <div className="order-details-container">
            
      

      <div className="order-info-with-bg-image" style={{
          // Use double quotes inside the url() and ensure the variable is a string
          backgroundImage: bgImageUrl ? `url("${bgImageUrl}")` : 'none',
          backgroundColor: '#5a4025' // Fallback color
        }}>
        <h2>{roomId?.name}</h2>
        <p>({roomId?.type})</p>
        
      </div>

      <div className="order-info-section">
        <div className="left-order-info">
            
            <h3>Stay Details</h3>
            <div className="date-info-div">
                <div className="check-in-div">
                    <p>Check-In</p>
                    <span className="bold-date">{checkIn.toLocaleDateString()}</span>
                </div>
                <div className="check-out-div">
                    <p>Check-Out</p>
                    <span className="bold-date">{checkOut.toLocaleDateString()}</span>
                </div>
            </div>

            <div className="guest-info-div">
                <p className="guest-info-text">Guest Details</p>
                <div className="adult-div">
                    <p>{adults} Adults</p>
                    
                </div>
                <div className="child-div">
                    <p>{kids} Kids</p>

                    
                </div>
            </div>
        </div>

        <div className="order-price-summary">
            <h2>Price Summary</h2>
            {roomId?.offerPrice ? (
            <>
                <p>
                Original Price: <span className="original-price-details">₹{roomId.pricePerNight * nights}</span>
                </p>
                <p>
                Discounted Price: <span className="offer-price-details">₹{roomId.pricePerNight * nights - totalPrice}</span>
                </p>
            </>
            ) : (
            <p>Price per Night: ₹{roomId?.pricePerNight}</p>
            )}
            <p className="total-price-details"><strong>Total Price:</strong> ₹{totalPrice}</p>
        </div>
            

      </div>

      

      

      <div className="order-status-details">
        <h2>Status: <span className={`status-details ${status.toLowerCase()}`}>{status}</span></h2>

        {status === "Pending" && (
          <p className="pending-text-details">⏳ Please wait until your order is approved.</p>
        )}

        {status === "Approved" && (
          isMobile ? (
            <button className="pay-btn-details" onClick={handlePay}>
              Pay Now
            </button>
          ) : (
            <div className="qr-code-wrapper">
              <p>Scan to pay with Any UPI App</p>
              <QRCodeSVG value={order.paymentLink} size={180} onClick={handlePay} />
            </div>
          )
        )}

        {status === "Rejected" && (
          <p className="rejected-text-details">❌ Sorry, your order was rejected.</p>
        )}

        {status === "Paid" && (
          <div className="paid-section-details">
          <p className="paid-text-details">✅ Payment completed. Thank you!</p>
          <button onClick={()=> window.open(order.receiptUrl, "_blank")}>
            View Receipt
          </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default OrderDetails;
