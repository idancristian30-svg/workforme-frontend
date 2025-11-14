import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import PostJob from "./PostJob";
import Applications from "./Applications";

const apiBase = "https://workforme-api.onrender.com/api";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("workforme_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem("workforme_user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("workforme_user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const apiRequest = async (endpoint, method = "GET", body = null) => {
    try {
      const token = localStorage.getItem("token");

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (token) {
        options.headers["x-auth-token"] = token;
      }

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(apiBase + endpoint, options);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      return await res.json();
    } catch (err) {
      console.error("API error:", err);
      throw err;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={<Dashboard user={user} onLogout={handleLogout} apiRequest={apiRequest} />}
      />

      <Route
        path="/post-job"
        element={<PostJob user={user} onLogout={handleLogout} apiRequest={apiRequest} />}
      />

      <Route
        path="/applications/:jobId"
        element={<Applications user={user} onLogout={handleLogout} apiRequest={apiRequest} />}
      />
    </Routes>
  );
}

export default App;
