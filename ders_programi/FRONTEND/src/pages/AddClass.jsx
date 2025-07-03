import React, { useState, useEffect } from "react";
import styles from "./AddClass.module.css";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

const AddClass = () => {
  const [className, setClassName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [error, setError] = useState("");
  const [allDepartments, setAllDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/sinif_bolumleri_getir.php")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDepartments(res.data);
          setAllDepartments(res.data);
        } else {
          setDepartments([]);
          setAllDepartments([]);
        }
      })
      .catch(() => setError("Bölümler yüklenemedi."));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setDepartments(allDepartments); // boşsa hepsini göster
    } else {
      const filtered = allDepartments.filter((b) =>
        b.isim.toLowerCase().includes(value.toLowerCase())
      );
      setDepartments(filtered);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prev) =>
      prev.includes(id)
        ? prev.filter((bolumId) => bolumId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!className.trim()) {
      setError("Sınıf ismi boş bırakılamaz.");
      return;
    }

    if (selectedDepartments.length === 0) {
      setError("En az bir bölüm seçmelisiniz.");
      return;
    }

    try {
      const checkRes = await axios.post(
        "http://localhost/api/sinif_kontrol.php",
        { isim: className }
      );
      if (checkRes.data.exists) {
        setError("Bu isimde bir sınıf zaten var.");
        return;
      }

      const insertRes = await axios.post(
        "http://localhost/api/sinif_ekle.php",
        {
          isim: className,
          bolumler: selectedDepartments,
        }
      );

      if (insertRes.data.success) {
        alert("Sınıf başarıyla eklendi.");
        setClassName("");
        setSelectedDepartments([]);
        setError("");
        navigate("/admin");
      } else {
        setError("Sınıf eklenirken hata oluştu.");
      }
    } catch (err) {
      setError("Sunucu hatası.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Sınıf Ekle</h2>
        <input
          type="text"
          placeholder="Sınıf ismi girin"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className={styles.input}
        />

        <div className={styles.sectionBox}>
          <h3>Bölümler</h3>
          <input
            type="text"
            placeholder="Bölüm ismine göre filtrele"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchBox}
          />
          <div className={styles.checkboxGroup}>
            {departments.map((bolum) => (
              <label key={bolum.id} className={styles.checkboxItem}>
                <span className={styles.labelText}>{bolum.isim}</span>
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(bolum.id)}
                  onChange={() => handleCheckboxChange(bolum.id)}
                />
              </label>
            ))}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonWrapper}>
          <button onClick={handleSubmit} className={styles.button}>
            Ekle
          </button>
        </div>
      </div>
    </>
  );
};

export default AddClass;
