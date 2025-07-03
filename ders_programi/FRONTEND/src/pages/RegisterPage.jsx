import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Ad boş bırakılamaz.";
    if (!formData.surname.trim()) newErrors.surname = "Soyad boş bırakılamaz.";
    if (!formData.username.trim())
      newErrors.username = "Kullanıcı adı boş bırakılamaz.";
    if (!formData.password.trim())
      newErrors.password = "Şifre boş bırakılamaz.";
    if (!formData.email.includes("@"))
      newErrors.email = "Geçerli bir e-posta giriniz.";
    if (!/^\d{11}$/.test(formData.phone)) {
      newErrors.phone = "Telefon numarası 11 haneli sayı olmalıdır.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/register.php",
        new URLSearchParams(formData),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("YANIT:", response.data);

      if (response.data.success) {
        alert("Kayıt başarılı!");
        navigate("/");
      } else {
        alert("Hata: " + response.data.message);
      }
    } catch (error) {
      console.error("Axios HATASI:", error);
      if (error.response) {
        console.log("Yanıt:", error.response.data);
      } else {
        console.log("Yanıt gelmedi, sunucuya ulaşamadı.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Kayıt Ol</h2>

        <input
          type="text"
          name="name"
          placeholder="Ad"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.name && <div className={styles.error}>{errors.name}</div>}

        <input
          type="text"
          name="surname"
          placeholder="Soyad"
          value={formData.surname}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.surname && <div className={styles.error}>{errors.surname}</div>}

        <input
          type="text"
          name="username"
          placeholder="Kullanıcı Adı"
          value={formData.username}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.username && (
          <div className={styles.error}>{errors.username}</div>
        )}

        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.password && (
          <div className={styles.error}>{errors.password}</div>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.email && <div className={styles.error}>{errors.email}</div>}

        <input
          type="text"
          name="phone"
          placeholder="Telefon Numarası"
          value={formData.phone}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.phone && <div className={styles.error}>{errors.phone}</div>}

        <button type="submit" className={styles.button}>
          Kayıt Ol
        </button>
        <p className={styles.loginText}>
          Zaten bir hesabınız var mı?{" "}
          <span className={styles.loginLink} onClick={() => navigate("/")}>
            Giriş Yap
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
