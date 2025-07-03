import React, { useEffect, useState } from "react";
import styles from "./EditClass.module.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const EditClass = () => {
  const { id } = useParams(); // sınıf ID
  const navigate = useNavigate();

  const [className, setClassName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Bölümleri getir
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));

    // Sınıf bilgilerini getir
    axios
      .post("http://localhost/ders_programi/api/sinif_bilgisi_getir.php", {
        id,
      })
      .then((res) => {
        setClassName(res.data.sinif_isim);
        setSelectedDepartments(res.data.bolumler);
      });
  }, [id]);

  const handleCheckboxChange = (bolumId) => {
    setSelectedDepartments((prev) =>
      prev.includes(bolumId)
        ? prev.filter((id) => id !== bolumId)
        : [...prev, bolumId]
    );
  };

  const handleSubmit = async () => {
    const trimmedName = className.trim();

    // Ön kontroller
    if (!trimmedName) {
      setError("Sınıf ismi boş olamaz.");
      return;
    }

    if (selectedDepartments.length === 0) {
      setError("En az bir bölüm seçmelisiniz.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/sinif_guncelle.php",
        {
          id,
          isim: trimmedName,
          bolumler: selectedDepartments,
        }
      );

      if (response.data.success) {
        alert("Sınıf başarıyla güncellendi.");
        navigate("/admin"); // örnek rota
      } else {
        // ❗ Burada gelen özel mesajı alert ile gösteriyoruz
        if (response.data.message) {
          alert(response.data.message);
        } else {
          alert("Sınıf güncellenemedi.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Sunucu hatası oluştu.");
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.isim.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Sınıfı Düzenle</h2>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBox}
          />

          <div className={styles.checkboxGroup}>
            {filteredDepartments.map((bolum) => (
              <label key={bolum.id} className={styles.checkboxItem}>
                <span className={styles.labelText}>{bolum.isim}</span>
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(String(bolum.id))}
                  onChange={() => handleCheckboxChange(String(bolum.id))}
                />
              </label>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.buttonWrapper}>
          <button onClick={handleSubmit} className={styles.button}>
            Kaydet
          </button>
        </div>
      </div>
    </>
  );
};

export default EditClass;
