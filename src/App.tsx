
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Channels from "./pages/Channels";
import Messages from "./pages/Messages";
import { useUserStore } from "./store/userStore";

function App() {
  const { token, isGuest, hydrated } = useUserStore();

  
  if (!hydrated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!token && !isGuest) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/channels"
          element={
            <ProtectedRoute>
              <Channels />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:name"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dm/:name"
          element={token ? <Messages /> : <Navigate to="/channels" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
