import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./pages/header";
import RoomDetails from "./pages/roomDetails";
import { baseURL } from "./constants/baseUrl";
import SvgSpinner from "./utils/svgSpinner";
import { useQuery } from "@tanstack/react-query";
import CreateRoom from "./pages/createRoom";
import EditRoom from "./pages/editRoom";
import CreateOrder from "./pages/createOrder";
import MyOrders from "./pages/myOrders";
import OrderDetails from "./pages/orderDetails";
import AdminOrders from "./pages/adminOrders";


function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseURL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        })
        const data = await res.json()
        if (data.error) {
          return null
        }
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
        console.log("authUser", data)
        return data
      } catch (error) {
        throw error
      }
    },
    retry: false
  })

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" }}>
        <SvgSpinner size={48} color="#5D4017" stroke={5} />
      </div>
    )
  }

  return (
    <div className="App">
      {authUser && <Header />}
      <Routes>
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/signup" />} />
        <Route path="/room/:id" element={authUser ? <RoomDetails /> : <Navigate to="/signup" />} />
        <Route path="/admin/add-room" element={authUser?.role === "admin" ? <CreateRoom /> : <Navigate to="/signup" />} />
        <Route path="/admin/rooms/edit/:id" element={authUser?.role === "admin" ? <EditRoom /> : <Navigate to="/signup" />} />
        <Route path="/order/create/:roomId" element={authUser ? <CreateOrder /> : <Navigate to="/signup" />} />
        <Route path="/order/my-order" element={authUser ? <MyOrders /> : <Navigate to="/signup" />} />
        <Route path="/order/my-order/:id" element={authUser ? <OrderDetails />: <Navigate to="/signup" />} />
        <Route path="/admin/orders" element={authUser?.role === "admin" ? <AdminOrders />: <Navigate to="/signup" />} />
      </Routes>
      <Toaster/>
    </div>
  );
}

export default App;
