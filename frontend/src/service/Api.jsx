import axios from "axios";

const Api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => {
  return Api.post("/api/users/register", data);
};

export const verifyOtp = (data) => {
  return Api.post("/api/users/verify-otp", data);
};

export const loginUser = (data) => {
  return Api.post("/api/users/login", data);
};

export const forgotPassword = (data) => {
  return Api.post("/api/users/forgot-password", data);
};

export const resetPassword = (data) => {
  return Api.post("/api/users/reset-password", data);
};

export const changePassword = (data) => {
  return Api.post("/api/users/change-password", data);
};

export const createTuitionRequest = (data) => {
  return Api.post("/api/tuition-requests", data);
};

export const getAllUsers = () => {
  return Api.get("/api/users");
};

export const deleteUser = (id) => {
  return Api.delete(`/api/users/${id}`);
};
