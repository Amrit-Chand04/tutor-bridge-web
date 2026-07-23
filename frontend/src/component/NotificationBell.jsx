import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getMyNotifications, readAllNotifications } from "../service/Api";
import { getSocket } from "../service/socket";
import "./NotificationBell.css";

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    getMyNotifications()
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});

    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (data) => {
      setNotifications((prev) => [{ message: data.message, created_at: data.created_at, is_read: false }, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(data.message);
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      readAllNotifications().catch(() => {});
      setUnreadCount(0);
    }
  };

  return (
    <div className="notif-bell-wrap" ref={menuRef}>
      <button className="icon-btn notif-bell-btn" aria-label="Notifications" onClick={toggleOpen}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 6.5h15C18 13.5 18 12 18 8z" />
          <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">Notifications</div>
          {notifications.length === 0 ? (
            <p className="notif-empty">No notifications yet.</p>
          ) : (
            <div className="notif-list">
              {notifications.map((n) => (
                <div className="notif-item" key={n.notification_id ?? `${n.created_at}-${n.message}`}>
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
