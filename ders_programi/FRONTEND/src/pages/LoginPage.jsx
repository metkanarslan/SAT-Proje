import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await axios.post(
        "http://localhost/ders_programi/api/login.php",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("YANIT:", res.data);

      if (res.data.success) {
        // ✅ Giriş başarılıysa yönlendir:
        navigate("/admin");
      } else {
        alert("Giriş başarısız: " + res.data.message);
      }
    } catch (err) {
      console.error("HATA:", err);
      alert("Sunucu hatası oluştu.");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

export default LoginPage;
