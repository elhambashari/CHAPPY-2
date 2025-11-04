
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

  
  useEffect(() => {
    if (!hydrated) return; 
	
console.log("🧩 token:", token, "isGuest:", isGuest);

    if (!token && !isGuest) {
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [token, isGuest, hydrated, navigate]);

  // GET userslist
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

  
  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  
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

  // DM click
  const handleDmClick = (userName: string) => {
    if (isGuest) {
      toast.info("Guests cannot send private messages.");
      return;
    }

    setCurrentChannel(`DM#${userName}`);
    navigate(`/dm/${userName}`);
  };

  return (
    <div className="channels-wrapper">
      <div className="channels-box">
      
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

        {/* login user*/}
        {!isGuest && (
          <>
            <div className="section">
              <h3>Direct Messages</h3>
              <div className="list">
                <div className="item" onClick={() => handleDmClick("MalahatMo")}>
                  Mahalat Mo <span className="red-dot"></span>
                </div>
                <div className="item" onClick={() => handleDmClick("PariaTaba")}>
                  Paria Taba
                </div>
              </div>
            </div>

            <div className="section">
              <h3>All Users</h3>
              <div className="list">
                {users.map((user) => (
                  <div
                    key={user.username}
                    className="item user"
                    onClick={() => handleDmClick(user.username)}
                  >
                    {user.username}
                    <span className="status-dot">🟢</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />
    </div>
  );
};

export default Channels;
