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

export const getOpenTuitionRequests = () => {
  return Api.get("/api/tuition-requests");
};

export const getMyTuitionRequests = () => {
  return Api.get("/api/tuition-requests/my");
};

export const applyToTuitionRequest = (id) => {
  return Api.post(`/api/tuition-requests/${id}/apply`);
};

export const getMyApplications = () => {
  return Api.get("/api/tuition-requests/my-applications");
};

export const initiateBookingPayment = (applicationId) => {
  return Api.post("/api/payments/initiate", { applicationId });
};

export const verifyBookingPayment = (pidx) => {
  return Api.post("/api/payments/verify", { pidx });
};

export const getApplicationsForRequest = (id) => {
  return Api.get(`/api/tuition-requests/${id}/applications`);
};

export const acceptTutorApplication = (appId) => {
  return Api.put(`/api/tuition-requests/applications/${appId}/accept`);
};

export const rejectTutorApplication = (appId) => {
  return Api.put(`/api/tuition-requests/applications/${appId}/reject`);
};

export const getAllUsers = () => {
  return Api.get("/api/users");
};

export const deleteUser = (id) => {
  return Api.delete(`/api/users/${id}`);
};

export const updateProfile = (formData) => {
  return Api.put("/api/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const createSupportTicket = (data) => {
  return Api.post("/api/support-tickets", data);
};

export const getMySupportTickets = () => {
  return Api.get("/api/support-tickets/my");
};

export const getAllSupportTickets = () => {
  return Api.get("/api/support-tickets");
};

export const getSupportTicketDetail = (id) => {
  return Api.get(`/api/support-tickets/${id}`);
};

export const addTicketMessage = (id, message) => {
  return Api.post(`/api/support-tickets/${id}/messages`, { message });
};

export const getMyTutorProfile = () => {
  return Api.get("/api/tutor-profile/me");
};

export const saveTutorProfile = (formData) => {
  return Api.put("/api/tutor-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAllTutorProfiles = () => {
  return Api.get("/api/tutor-profile");
};

export const approveTutorProfile = (id) => {
  return Api.put(`/api/tutor-profile/${id}/approve`);
};

export const rejectTutorProfile = (id, reason) => {
  return Api.put(`/api/tutor-profile/${id}/reject`, { reason });
};

export const deleteTutorProfile = (id) => {
  return Api.delete(`/api/tutor-profile/${id}`);
};

export const getMyBookings = () => {
  return Api.get("/api/bookings/my");
};

export const getAllBookings = () => {
  return Api.get("/api/bookings");
};

export const acceptBooking = (id) => {
  return Api.put(`/api/bookings/${id}/accept`);
};

export const rejectBooking = (id, reason) => {
  return Api.put(`/api/bookings/${id}/reject`, { reason });
};
