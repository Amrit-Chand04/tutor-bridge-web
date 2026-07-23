import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardNavbar from "../component/DashboardNavbar";
import ChatModal from "../component/ChatModal";
import ReviewSection from "../component/ReviewSection";
import { getMyBookings } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./MyTutor.css";

const dedupeByTutor = (bookings) => {
  const map = new Map();
  for (const b of bookings) {
    if (!map.has(b.tutor_id)) {
      map.set(b.tutor_id, {
        tutor_id: b.tutor_id,
        tutor_name: b.tutor_name,
        tutor_email: b.tutor_email,
        subjects: [b.subject],
      });
    } else {
      map.get(b.tutor_id).subjects.push(b.subject);
    }
  }
  return [...map.values()];
};

function MyTutor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatTarget, setChatTarget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "student") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setUser(parsedUser);
    fetchTutors();
  }, [navigate]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      setTutors(dedupeByTutor(res.data.bookings.filter((b) => b.status === "booked")));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your tutor");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <DashboardNavbar user={user} minimal />

      <section className="mt-page">
        <h1 className="mt-heading">My Tutor</h1>

        {loading ? (
          <p className="mt-empty">Loading...</p>
        ) : tutors.length === 0 ? (
          <div className="mt-empty-box">
            <span className="mt-empty-icon">🎓</span>
            <h2>No Tutor Booked Yet</h2>
            <p>Once you book a tutor for one of your requests, they'll show up here and you can chat with them.</p>
          </div>
        ) : (
          <div className="mt-list">
            {tutors.map((t) => (
              <div className="mt-card" key={t.tutor_id}>
                <div className="mt-card-row">
                  <div className="mt-card-info">
                    <p className="mt-name">{t.tutor_name}</p>
                    <p className="mt-email">{t.tutor_email}</p>
                    <div className="mt-subject-list">
                      {t.subjects.map((s, i) => (
                        <span className="mt-subject" key={i}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="mt-message-btn" onClick={() => setChatTarget(t)}>
                    Message
                  </button>
                </div>
                <ReviewSection otherUserId={t.tutor_id} editable />
              </div>
            ))}
          </div>
        )}
      </section>

      {chatTarget && (
        <ChatModal
          otherUserId={chatTarget.tutor_id}
          otherPartyName={chatTarget.tutor_name}
          currentUserId={user.user_id}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}

export default MyTutor;
