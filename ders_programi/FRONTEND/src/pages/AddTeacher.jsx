// AddTeacher.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddTeacher.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar"; // yolunu dosya yapına göre ayarla

function AddTeacher() {
  const [formData, setFormData] = useState({
    isim: "",
    soyisim: "",
    e_posta: "",
    tel_no: "",
  });
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    if (selectedDepartments.length > 0) {
      axios
        .post("http://localhost/ders_programi/api/ders_getir_ogr.php", {
          bolum_ids: selectedDepartments,
        })
        .then((res) => {
          setCourses(res.data); // Eski derslerle birleştirme YOK
        });
    } else {
      setCourses([]); // Hiç bölüm yoksa tüm dersleri temizle
    }
  }, [selectedDepartments]);

  const validate = () => {
    const errs = {};
    if (!formData.isim.trim()) errs.isim = "İsim boş bırakılamaz";
    if (!formData.soyisim.trim()) errs.soyisim = "Soyisim boş bırakılamaz";
    if (!formData.e_posta.includes("@"))
      errs.e_posta = "Geçerli bir e-posta giriniz";
    if (!/^\d{11}$/.test(formData.tel_no))
      errs.tel_no = "Telefon numarası 11 haneli olmalıdır";
    if (selectedDepartments.length === 0)
      errs.departments = "En az bir bölüm seçilmeli";
    if (selectedCourses.length === 0) errs.courses = "En az bir ders seçilmeli";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/ogretmen_ekle.php",
        {
          ...formData,
          bolumler: selectedDepartments,
          dersler: selectedCourses,
        }
      );
      alert(response.data.message);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Ekleme sırasında hata oluştu");
    }
  };

  const filteredDepartments = departments.filter((b) =>
    b.isim.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="İsim"
          value={formData.isim}
          onChange={(e) => setFormData({ ...formData, isim: e.target.value })}
        />
        {errors.isim && <p className={styles.error}>{errors.isim}</p>}

        <input
          type="text"
          placeholder="Soyisim"
          value={formData.soyisim}
          onChange={(e) =>
            setFormData({ ...formData, soyisim: e.target.value })
          }
        />
        {errors.soyisim && <p className={styles.error}>{errors.soyisim}</p>}

        <input
          type="email"
          placeholder="E-Posta"
          value={formData.e_posta}
          onChange={(e) =>
            setFormData({ ...formData, e_posta: e.target.value })
          }
        />
        {errors.e_posta && <p className={styles.error}>{errors.e_posta}</p>}

        <input
          type="text"
          placeholder="Telefon Numarası"
          value={formData.tel_no}
          onChange={(e) => setFormData({ ...formData, tel_no: e.target.value })}
        />
        {errors.tel_no && <p className={styles.error}>{errors.tel_no}</p>}

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
            {filteredDepartments.map((b) => (
              <label key={b.id} className={styles.checkboxItem}>
                <div className={styles.tooltipWrapper}>
                  {b.isim}
                  <div className={styles.tooltipPopup}>{b.isim}</div>
                </div>
                <input
                  type="checkbox"
                  value={String(b.id)}
                  checked={selectedDepartments.includes(String(b.id))}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setSelectedDepartments([...selectedDepartments, value]);
                    } else {
                      setSelectedDepartments(
                        selectedDepartments.filter((id) => id !== value)
                      );
                    }
                  }}
                />
              </label>
            ))}
          </div>
          {errors.departments && (
            <p className={styles.error}>{errors.departments}</p>
          )}
        </div>

        <div className={styles.sectionBox}>
          <h3>Dersler</h3>
          <div className={styles.checkboxGroup}>
            {courses.map((d) => (
              <label key={d.id} className={styles.checkboxItem}>
                <div className={styles.tooltipWrapper}>
                  {d.isim}
                  <div className={styles.tooltipPopup}>{d.isim}</div>
                </div>
                <input
                  type="checkbox"
                  value={String(d.id)}
                  checked={selectedCourses.includes(String(d.id))}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setSelectedCourses([...selectedCourses, value]);
                    } else {
                      setSelectedCourses(
                        selectedCourses.filter((id) => id !== value)
                      );
                    }
                  }}
                />
              </label>
            ))}
          </div>
          {errors.courses && <p className={styles.error}>{errors.courses}</p>}
        </div>

        <button type="submit">Öğretmeni Ekle</button>
      </form>
    </>
  );
}

export default AddTeacher;
