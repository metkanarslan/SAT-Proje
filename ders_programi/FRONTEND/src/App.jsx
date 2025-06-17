import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProgram from "./pages/CreateProgram";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/program-olustur" element={<CreateProgram />} />
      </Routes>
    </Router>
  );
}

export default App;
