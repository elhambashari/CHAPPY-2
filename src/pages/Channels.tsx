
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useChannelStore } from "../store/channelStore";
import { ToastContainer, toast } from "react-toastify";


import "react-toastify/dist/ReactToastify.css";
import "./Channels.css";

const Channels = () => {
  const navigate = useNavigate();
  const { username, token, isGuest, logout, hydrated } = useUserStore();
  const { channels, setCurrentChannel } = useChannelStore();

  const [users, setUsers] = useState<{ username: string }[]>([]);
  const [dms, setDMs] = useState<any[]>([]);

  // Load users & DMs
  useEffect(() => {
    if (!hydrated) return;

    if (!token && !isGuest) {
      navigate("/");
    } else {
      fetchUsers();
      if (!isGuest) fetchDMs();
    }
  }, [token, isGuest, hydrated, navigate, username]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      if (Array.isArray(data)) {
        const filtered = data.filter((u: any) => u.username !== username);
        setUsers(filtered);
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error("Failed to load users.");
    }
  };

  // Fetch direct messages (only for logged-in users)
  const fetchDMs = async () => {
    try {
      const res = await fetch(`/api/users/${username}/dms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setDMs(data);
      } else {
        console.warn("⚠️ Invalid DM data:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching DMs:", error);
      toast.error("Failed to load DMs.");
    }
  };

  // Logout or exit guest mode
  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  // Handle clicking on a channel
  const handleChannelClick = (name: string, locked: boolean) => {
    if (isGuest && locked) {
      toast.warning("🔒 This channel is locked for guests!", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setCurrentChannel(name);
    navigate(`/chat/${name.replace("#", "")}`);
  };

  // Handle clicking on a direct message
  const handleDmClick = (userName: string) => {
    if (isGuest) {
      toast.info("Guests cannot send private messages.", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setCurrentChannel(`DM#${userName}`);
    navigate(`/dm/${userName}`);
  };

  return (
    <div className="channels-wrapper">
      <div className="channels-box">
        {/* Header */}
        <div className="header">
          <h2 className="channels-title">
            {isGuest ? (
              <>
                Welcome <span className="username">Guest 👋</span>
              </>
            ) : (
              <>
                Welcome <span className="username">{username}</span> 🟢
              </>
            )}
          </h2>

          <button className="logout-btn" onClick={handleLogout}>
            {isGuest ? "Exit guest mode" : "Log out"}
          </button>
        </div>

        {/* Channels section */}
        <div className="section">
          <h3>Channels</h3>
          <div className="list">
            {channels.map((channel) => (
              <div
                key={channel.name}
                className={`item ${channel.locked ? "locked" : ""}`}
                onClick={() => handleChannelClick(channel.name, channel.locked)}
              >
                {channel.name}
                {channel.locked && <span className="nyckel">🗝️</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Direct Messages - only for logged-in users */}
        {!isGuest && (
          <div className="section">
            <h3>Direct Messages</h3>
            <div className="list">
              {dms.length === 0 ? (
                <p className="empty-text">No DMs yet</p>
              ) : (
                dms.map((dm, index) => (
                  <div
                    key={index}
                    className="item"
                    onClick={() => handleDmClick(dm.username)}
                  >
                    {dm.username || "Unknown"}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* All Users - visible for both guests and logged-in users */}
        <div className="section">
          <h3>All Users</h3>
          <div className="list">
            {users.map((user) => (
              <div
                key={user.username}
                className={`item user ${isGuest ? "disabled" : ""}`}
                onClick={() => {
                  if (isGuest) {
                    toast.info("Guests cannot start private chats.", {
                      position: "bottom-center",
                      autoClose: 3000,
                      theme: "dark",
                    });
                    return;
                  }
                  handleDmClick(user.username);
                }}
              >
                {user.username}
                <span className="status-dot">🟢</span>
              </div>
            ))}
          </div>


          {/* Guest warning message */}
          {isGuest && (
            <p className="guest-warning">
              ⚠️ Guests can view users but cannot send messages.
            </p>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />
    </div>
  );
};

export default Channels;
