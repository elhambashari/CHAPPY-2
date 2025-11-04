
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import "./Home.css";

const Home = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setUser, setGuest } = useUserStore();

  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token || "");
        setUser(username, data.token || "");
        navigate("/channels");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Server connection failed.");
    }
  };

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token || "");
        setUser(username, data.token || "");
        navigate("/channels");
      } else {
        setError(data.error || "Incorrect username or password.");
      }
    } catch {
      setError("Server connection failed.");
    }
  };

  
  const handleGuest = () => {
    setGuest(true); 
    navigate("/channels");
  };

  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to Chappy</h2>
      <div className="chat-icon">💬</div>

      <div className="auth-box">
        <form>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="button" className="btn-signup" onClick={handleRegister}>
            Sign up
          </button>

          <p className="or-text">or</p>

          <button type="button" className="btn-login" onClick={handleLogin}>
            Log in
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
      </div>

      <p className="guest-link" onClick={handleGuest}>
        continue as a guest
      </p>
    </div>
  );
};

export default Home;
