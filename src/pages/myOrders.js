import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import '../css/myOrders.css'
import { Link } from "react-router-dom";

function MyOrders() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch function
  const fetchOrders = async () => {
    const res = await fetch(`${baseURL}/api/order/my`, {
      method: "GET",
      credentials: "include", // include cookies/session
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to fetch orders");
    }
    return data; // backend returns array of orders
  };

  // React Query hook
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem", marginTop: "5rem" }}>
        <SvgSpinner size={36} color="#5D4017" stroke={4} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return <p style={{ color: "red", textAlign: "center" }}>{error.message}</p>;
  }

  // Empty state
  if (!data || data.length === 0) {
    return <p style={{ textAlign: "center", marginTop: "5rem" }}>You have not placed any orders yet.</p>;
  }

  // Reverse orders (newest first)
  const reversedOrders = [...data].reverse();

  // Filter by search term (room name or status)
  const filteredOrders = reversedOrders.filter((order) => {
    const roomName = order.roomId?.name?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";
    return (
      roomName.includes(searchTerm.toLowerCase()) ||
      status.includes(searchTerm.toLowerCase())
    );
  });

  // Render orders
  return (
    <div className="orders-wrapper">
      <div className="orders-container"> 
        <div className="order-top"> 
            <p className="order-top-p">User Dashboard</p>
            <h1 className="orders-title">My Orders</h1>
            <p className="order-top-p-2">View and manage your hotel bookings.</p>
        </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by room or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <table className="orders-table">
        <thead>
          <tr className="order-table-heading-name">
            <th>Room</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (

            <tr key={order._id} className="order-row-content">
              <td>{order.roomId?.name}</td>
              <td>{new Date(order.checkInDate).toLocaleDateString()}</td>
              <td className="check-out-my">{new Date(order.checkOutDate).toLocaleDateString()}</td>
              <td className="text-price-bold-order">₹{order.totalPrice}</td>
              <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>

              <td>
                <Link to={`/order/my-order/${order._id}`} style={{textDecoration:"none", color:"#1a1a1a", textDecoration:"underline"}} className="view-order-btn">
                  {order.status === "Approved"? "Pay Now" : "View Details"}
                  
                </Link>
              </td>
            </tr>
           
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default MyOrders;
