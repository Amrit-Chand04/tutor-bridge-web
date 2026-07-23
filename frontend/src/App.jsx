import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import TutorDashboard from "./pages/TutorDashboard";
import BrowseTuitions from "./pages/BrowseTuitions";
import SupportTickets from "./pages/SupportTickets";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import SupportTicketDetail from "./pages/SupportTicketDetail";
import TutorProfile from "./pages/TutorProfile";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/browse-tuitions" element={<BrowseTuitions />} />
        <Route path="/tutor/profile" element={<TutorProfile />} />
        <Route path="/support" element={<SupportTickets />} />
        <Route path="/support/:id" element={<SupportTicketDetail />} />
        <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
