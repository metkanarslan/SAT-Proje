import React, { useEffect, useState } from "react";
import styles from "./AddTeacher.module.css"; // Aynı CSS dosyası kullanılabilir
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

function AddCourse() {
  const [courseName, setCourseName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    if (selectedDepartments.length > 0) {
      axios
        .post("http://localhost/ders_programi/api/kurs_ogretmen_getir.php", {
          bolum_ids: selectedDepartments,
        })
        .then((res) => {
          const newTeachers = res.data;
          const combined = [
            ...new Map(
              [...teachers, ...newTeachers].map((item) => [item.id, item])
            ).values(),
          ];
          setTeachers(combined);
        });
    } else {
      setTeachers([]);
    }
  }, [selectedDepartments]);

  const validate = () => {
    const errs = {};
    if (!courseName.trim()) errs.courseName = "Ders ismi boş bırakılamaz";
    if (selectedDepartments.length === 0)
      errs.departments = "En az bir bölüm seçilmeli";
    if (selectedTeachers.length === 0)
      errs.teachers = "En az bir öğretmen seçilmeli";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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
        "http://localhost/ders_programi/api/ders_ekle.php",
        {
          isim: courseName,
          bolumler: selectedDepartments,
          ogretmenler: selectedTeachers, // boş olabilir, sorun yok
        }
      );

      alert(response.data.message);
      navigate("/admin");
      // İstersen burada sayfayı sıfırlayabilirsin
      setCourseName("");
      setSelectedDepartments([]);
      setSelectedTeachers([]);
      setTeachers([]);
    } catch (err) {
      if (err.response?.data?.error) {
        alert("Hata: " + err.response.data.error);
      } else {
        alert("Bilinmeyen bir hata oluştu");
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
          <p className={styles.error}>{errors.courseName}</p>
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
            <p className={styles.error}>{errors.departments}</p>
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
          {errors.teachers && <p className={styles.error}>{errors.teachers}</p>}
        </div>

        <button type="submit">Dersi Ekle</button>
      </form>
    </>
  );
}

export default AddCourse;
