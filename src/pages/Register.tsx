
import React, { useState } from "react";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("✅ Account created successfully!");
    } else {
      alert(`❌ ${data.error}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome to Chappy</h2>
      <div className="auth-box">
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn-primary">Sign up</button>
        </form>
        <p>or</p>
        <button className="btn-secondary" onClick={() => window.location.href="/login"}>
          Log in
        </button>
      </div>
      <p className="guest-link" onClick={() => window.location.href="/guest"}>
        continue as a guest
      </p>
    </div>
  );
};

export default Register;
