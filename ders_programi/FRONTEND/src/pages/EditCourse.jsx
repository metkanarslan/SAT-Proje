import React, { useEffect, useState } from "react";
import styles from "./AddTeacher.module.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

function EditCourse() {
  const { id } = useParams(); // URL'den gelen ders id
  const [courseName, setCourseName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // 1. Bölümleri çek
  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));
  }, []);

  // 2. Ders bilgilerini ve seçili öğretmenleri getir
  useEffect(() => {
    axios
      .get(`http://localhost/ders_programi/api/ders_detay_getir.php?id=${id}`)
      .then((res) => {
        const data = res.data;
        setCourseName(data.isim);
        setSelectedDepartments(data.bolumler.map((id) => String(id)));
        setSelectedTeachers(data.ogretmenler.map((id) => String(id)));
      });
  }, [id]);

  // 3. Seçilen bölümlere göre öğretmenleri getir
  useEffect(() => {
    if (selectedDepartments.length > 0) {
      axios
        .post(
          "http://localhost/ders_programi/api/ogretmenleri_getir_liste.php",
          {
            bolum_ids: selectedDepartments,
          }
        )
        .then((res) => setTeachers(res.data));
    } else {
      setTeachers([]);
    }
  }, [selectedDepartments]);

  // 🔁 Form gönderildiğinde
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!courseName.trim()) errs.courseName = "Ders ismi boş bırakılamaz";
    if (selectedDepartments.length === 0)
      errs.departments = "En az bir bölüm seçilmeli";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/ders_guncelle.php",
        {
          id,
          isim: courseName,
          bolumler: selectedDepartments,
          ogretmenler: selectedTeachers,
        }
      );

      alert(response.data.message);
      navigate("/course-list"); // veya ders listesine yönlendirme
    } catch (err) {
      if (err.response?.data?.error) {
        alert("Hata: " + err.response.data.error);
      } else {
        alert("Güncelleme sırasında hata oluştu.");
        console.error(err);
      }
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
          placeholder="Ders İsmi"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        {errors.courseName && (
          <div className={styles.error}>{errors.courseName}</div>
        )}

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
            <div className={styles.error}>{errors.departments}</div>
          )}
        </div>

        <div className={styles.sectionBox}>
          <h3>Öğretmenler</h3>
          <div className={styles.checkboxGroup}>
            {teachers.map((t) => (
              <label key={t.id} className={styles.checkboxItem}>
                <div className={styles.tooltipWrapper}>
                  {t.isim} {t.soyisim}
                  <div className={styles.tooltipPopup}>
                    {t.isim} {t.soyisim}
                  </div>
                </div>
                <input
                  type="checkbox"
                  value={String(t.id)}
                  checked={selectedTeachers.includes(String(t.id))}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setSelectedTeachers([...selectedTeachers, value]);
                    } else {
                      setSelectedTeachers(
                        selectedTeachers.filter((id) => id !== value)
                      );
                    }
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <button type="submit">Kaydet</button>
      </form>
    </>
  );
}

export default EditCourse;
