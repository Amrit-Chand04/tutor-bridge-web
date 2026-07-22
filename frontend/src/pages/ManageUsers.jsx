import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../component/AdminNavbar";
import { getAllUsers, deleteUser } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./ManageUsers.css";

const FILTERS = [
  { value: "all", label: "All Users" },
  { value: "student", label: "Students" },
  { value: "tutor", label: "Tutors" },
];

function ManageUsers() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setAdmin(parsedUser);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteUser(deleteTarget.user_id);
      toast.success(response.data.message);
      setUsers(users.filter((u) => u.user_id !== deleteTarget.user_id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  if (!admin) return null;

  return (
    <div>
      <AdminNavbar user={admin} active="manage-users" />

      <section className="mu-page">
        <div className="mu-toolbar">
          <div className="mu-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="mu-search-clear"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="mu-filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`mu-filter-btn ${filter === f.value ? "mu-filter-active" : ""}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mu-table-wrap">
          {loading ? (
            <p className="mu-empty">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="mu-empty">No users found.</p>
          ) : (
            <table className="mu-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.user_id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`mu-role-badge mu-role-${u.role}`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      {u.role === "admin" ? (
                        <span className="mu-action-none">—</span>
                      ) : (
                        <button className="mu-action-delete" onClick={() => setDeleteTarget(u)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete User?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.full_name}</strong>? This
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
