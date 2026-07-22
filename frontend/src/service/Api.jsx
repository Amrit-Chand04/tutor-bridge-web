import axios from "axios";

const Api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
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
