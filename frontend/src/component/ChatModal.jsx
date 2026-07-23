import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getChatMessages, sendChatMessage } from "../service/Api";
import "./ChatModal.css";

const POLL_INTERVAL_MS = 4000;

const formatTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

function ChatModal({ otherUserId, otherPartyName, currentUserId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await getChatMessages(otherUserId);
      setMessages(res.data.messages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setSending(true);
      const res = await sendChatMessage(otherUserId, text.trim());
      setMessages((prev) => [...prev, res.data.chatMessage]);
      setText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-box" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>{otherPartyName}</h3>
          <button className="chat-close" onClick={onClose} aria-label="Close chat">
            &times;
          </button>
        </div>

        <div className="chat-messages">
          {loading ? (
            <p className="chat-empty">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="chat-empty">No messages yet. Say hello!</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.chat_id}
                className={`chat-bubble-row ${m.sender_id === currentUserId ? "chat-own" : ""}`}
              >
                <div className="chat-bubble">
                  <p className="chat-text">{m.message}</p>
                  <span className="chat-time">{formatTime(m.sent_time)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={sending || !text.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;
