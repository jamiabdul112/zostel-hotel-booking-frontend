import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import toast from "react-hot-toast";
import { MdEmail, MdPassword } from "react-icons/md";

import { Link } from "react-router-dom";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });

    const queryClient = useQueryClient()
    const { mutate: login, isPending, isError, error } = useMutation({
        mutationFn: async ({ email, password }) => {
            const res = await fetch(`${baseURL}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || "Login failed");
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Logged in successfully");
            queryClient.invalidateQueries({
                queryKey: ["authUser"]
            }) 
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        login(formData);
    };


    return (
        <div className="signup-wrapper">
            <div className="signup-page">
                <div className="signup-top">
                    <h1 className="signup-h1">Welcome Back</h1>
                    <p className="signup-p">Please login to your account</p>
                </div>

                <div className="signup-middle">
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <label>
                            <MdEmail />
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"

                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </label>


                        <label>
                            <MdPassword />
                            <input
                                type="password"
                                placeholder="Password"
                                name="password"

                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </label>


                        <button>{isPending ? "Loading..." : "Login"}</button>
                        {isError && <p style={{ color: "red" }}>{error.message}</p>}
                    </form>
                    <div className="or-line">
                        <p className="or-p">OR</p>
                    </div>
                    <div>
                        <p className="already-p">
                            Did'nt have any account?
                            <span className="login-click">
                                <Link to="/signup">Sign Up</Link>
                            </span>
                        </p>
                    </div>
                </div>


            </div>
        </div>

    );
}

export default Login;
