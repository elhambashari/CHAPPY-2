
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import type { Message } from "../models/Message";
import "./Messages.css";

const Messages = () => {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { username, token, isGuest } = useUserStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const isDM = location.pathname.startsWith("/dm/");
  const chatTitle = isDM ? `@${name}` : `#${name}`;

  // Redirect guests without token
  useEffect(() => {
    if (!token && !isGuest) navigate("/");
  }, [token, isGuest, navigate]);

  // Fetch messages (both channel and DM)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        let res;
        if (isDM) {
          
          res = await fetch(`/api/messages/dm/${name}?user=${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          res = await fetch(`/api/messages/${name}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = data.sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sorted);
        } else {
          console.error("Invalid messages response:", data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (name) fetchMessages();
  }, [name, username, isDM, token]);

  // Send message (channel or DM)
  const handleSend = async () => {
    if (!newMessage.trim() || !username || !name) return;

    if (isGuest && isDM) return;
    if (isGuest && (name === "group1" || name === "group2")) return;

    try {
      const endpoint = isDM
        ? `/api/messages/dm/${name}`
        : `/api/messages/${name}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          sender: username,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.item]);
        setNewMessage("");
      } else {
        console.error("❌ Error sending message:", data.error);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate("/channels")}>
          ←
        </button>
        <h2>{chatTitle}</h2>
      </div>

      <div className="messages-box">
        {loading ? (
          <p className="loading">Loading chat...</p>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <p>
              <strong>{chatTitle}</strong> 💬
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`message-item ${
                msg.sender === username ? "own-message" : ""
              }`}
            >
              <span className="sender">{msg.sender}</span>
              <p className="content">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder={
            isGuest
              ? isDM || name === "group1" || name === "group2"
                ? "Guests cannot send messages in locked or private chats ❌"
                : `Message in ${chatTitle}...`
              : isDM
              ? `Send a message to @${name}...`
              : `Message in ${chatTitle}...`
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isGuest && (isDM || name === "group1" || name === "group2")}
        />
        <button
          onClick={handleSend}
          disabled={isGuest && (isDM || name === "group1" || name === "group2")}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Messages;
