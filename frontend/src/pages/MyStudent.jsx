import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TutorNavbar from "../component/TutorNavbar";
import ChatModal from "../component/ChatModal";
import ReviewSection from "../component/ReviewSection";
import { getMyTutorBookings } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./MyTutor.css";

const dedupeByStudent = (bookings) => {
  const map = new Map();
  for (const b of bookings) {
    if (!map.has(b.student_id)) {
      map.set(b.student_id, {
        student_id: b.student_id,
        student_name: b.student_name,
        student_email: b.student_email,
        subjects: [b.subject],
      });
    } else {
      map.get(b.student_id).subjects.push(b.subject);
    }
  }
  return [...map.values()];
};

function MyStudent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
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
    if (parsedUser.role !== "tutor") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setUser(parsedUser);
    fetchStudents();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getMyTutorBookings();
      setStudents(dedupeByStudent(res.data.bookings.filter((b) => b.status === "booked")));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your student");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <TutorNavbar user={user} minimal />

      <section className="mt-page">
        <h1 className="mt-heading">My Student</h1>

        {loading ? (
          <p className="mt-empty">Loading...</p>
        ) : students.length === 0 ? (
          <div className="mt-empty-box">
            <span className="mt-empty-icon">🧑‍🎓</span>
            <h2>No Student Yet</h2>
            <p>Once a student books you for a tuition, they'll show up here and you can chat with them.</p>
          </div>
        ) : (
          <div className="mt-list">
            {students.map((s) => (
              <div className="mt-card" key={s.student_id}>
                <div className="mt-card-row">
                  <div className="mt-card-info">
                    <p className="mt-name">{s.student_name}</p>
                    <p className="mt-email">{s.student_email}</p>
                    <div className="mt-subject-list">
                      {s.subjects.map((subj, i) => (
                        <span className="mt-subject" key={i}>
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="mt-message-btn" onClick={() => setChatTarget(s)}>
                    Message
                  </button>
                </div>
                <ReviewSection otherUserId={s.student_id} editable={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {chatTarget && (
        <ChatModal
          otherUserId={chatTarget.student_id}
          otherPartyName={chatTarget.student_name}
          currentUserId={user.user_id}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}

export default MyStudent;
