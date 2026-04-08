// src/api/axiosClient.js
import axios from "axios";
import { appConfig } from "../config/appConfig";

const axiosClient = axios.create({
    baseURL: appConfig.baseURL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // Token is stored as 'authToken' in localStorage or sessionStorage
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Token added to request");
        } else {
            console.warn("⚠️ No token found for request");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response.data, // return only the data
    async (error) => {
        if (error.response?.status === 401) {
            // Optionally refresh token or redirect to login
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
