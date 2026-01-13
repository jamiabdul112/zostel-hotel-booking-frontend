import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import toast from "react-hot-toast";
import "../css/adminOrders.css";

function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInFilter, setCheckInFilter] = useState("");
  const [checkOutFilter, setCheckOutFilter] = useState("");


  const queryClient = useQueryClient();

  // Fetch all orders
  const fetchOrders = async () => {
    const res = await fetch(`${baseURL}/api/order`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
    return data;
  };

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: fetchOrders,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${baseURL}/api/order/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve order");
      return data;
    },
    onSuccess: () => {
        toast.success("Order approved successfully")
        queryClient.invalidateQueries(["adminOrders"])
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${baseURL}/api/order/${id}/reject`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject order");
      return data;
    },
     onSuccess: () => {
        toast.success("Order Rejected")
        queryClient.invalidateQueries(["adminOrders"])
    }
  });

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

  // Counts
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const approvedCount = orders.filter((o) => o.status === "Approved").length;
  const paidCount = orders.filter((o) => o.status === "Paid").length;
  const rejectedCount = orders.filter((o) => o.status === "Rejected").length;

   const reversedOrders = [...orders].reverse();
  // Filter by search term (username or room name)
  const filteredOrders = reversedOrders.filter((order) => {
    const username = order.userId?.name?.toLowerCase() || "";
    const roomName = order.roomId?.name?.toLowerCase() || "";
    
    // Date Filtering Logic
    const orderInDate = order.checkInDate.split("T")[0]; // "YYYY-MM-DD"
    const orderOutDate = order.checkOutDate.split("T")[0];

    const matchesSearch = username.includes(searchTerm.toLowerCase()) || 
                          roomName.includes(searchTerm.toLowerCase());
    
    const matchesCheckIn = checkInFilter ? orderInDate === checkInFilter : true;
    const matchesCheckOut = checkOutFilter ? orderOutDate === checkOutFilter : true;

    return matchesSearch && matchesCheckIn && matchesCheckOut;
  });

  return (
    <div className="admin-orders-wrapper">
        <div className="admin-orders-container">
            <div className="admin-orders-top">
                <div className="admin-op-left">
                    <h2>Admin Orders</h2>
                    <p>Manage all room booking orders</p>
                </div>
                <div className="admin-op-right">
                  <div className="filter-group">
                    {/* Text Search */}
                    <div className="order-search">
                      <input
                        type="text"
                        placeholder="Search user or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Date Searches */}
                    <div className="date-filters">
                      <div className="date-input-wrapper">
                        <label>Check-In:</label>
                        <input 
                          type="date" 
                          value={checkInFilter} 
                          onChange={(e) => setCheckInFilter(e.target.value)} 
                        />
                      </div>
                      <div className="date-input-wrapper">
                        <label>Check-Out:</label>
                        <input 
                          type="date" 
                          value={checkOutFilter} 
                          onChange={(e) => setCheckOutFilter(e.target.value)} 
                        />
                      </div>
                      
                      {/* Reset Button */}
                      {(checkInFilter || checkOutFilter || searchTerm) && (
                        <button 
                          className="reset-filters-btn"
                          onClick={() => {
                            setSearchTerm("");
                            setCheckInFilter("");
                            setCheckOutFilter("");
                          }}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
            </div>

      {/* Counts */}
            <div className="order-counts">
                <p>Pending: {pendingCount}</p>
                <p>Approved: {approvedCount}</p>
                <p>Paid: {paidCount}</p>
                <p>Rejected: {rejectedCount}</p>
            </div>

  
      

      {/* Table */}
      <table className="orders-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Room</th>
            <th>Amount</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id} className={`order-row-${order.status.toLowerCase()}`}>
              <td>{order.userId?.name}</td>
              <td>{order.roomId?.name}</td>
              <td>₹{order.totalPrice}</td>
              <td>{new Date(order.checkInDate).toLocaleDateString()}</td>
              <td>{new Date(order.checkOutDate).toLocaleDateString()}</td>
              <td className={`status-admin ${order.status.toLowerCase()}`}>{order.status}</td>
              <td>
                {order.status === "Pending" && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => approveMutation.mutate(order._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => rejectMutation.mutate(order._id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {order.status !== "Pending" && <span>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default AdminOrders;
