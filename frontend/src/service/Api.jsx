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
