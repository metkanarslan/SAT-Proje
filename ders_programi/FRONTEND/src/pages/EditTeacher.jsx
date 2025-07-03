// EditTeacher.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddTeacher.module.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    axios
      .post("http://localhost/ders_programi/api/ogretmeni_getir.php", { id })
      .then((res) => {
        const data = res.data;
        setFormData({
          isim: data.ogretmen.isim,
          soyisim: data.ogretmen.soyisim,
          e_posta: data.ogretmen.e_posta,
          tel_no: data.ogretmen.tel_no,
        });
        setSelectedDepartments(data.bolumler.map((b) => b.id.toString()));
        setSelectedCourses(data.dersler.map((d) => d.id.toString()));
      });
  }, [id]);

  useEffect(() => {
    if (selectedDepartments.length > 0) {
      axios
        .post("http://localhost/ders_programi/api/ders_getir_ogr.php", {
          bolum_ids: selectedDepartments,
        })
        .then((res) => {
          setCourses(res.data); // Önceki derslerle birleştirme kaldırıldı
        });
    } else {
      setCourses([]);
    }
  }, [selectedDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/ogretmen_guncelle.php",
        {
          id,
          ...formData,
          bolumler: selectedDepartments,
          dersler: selectedCourses,
        }
      );
      alert(response.data.message);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Güncelleme sırasında hata oluştu");
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
        <input
          type="text"
          placeholder="Soyisim"
          value={formData.soyisim}
          onChange={(e) =>
            setFormData({ ...formData, soyisim: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="E-Posta"
          value={formData.e_posta}
          onChange={(e) =>
            setFormData({ ...formData, e_posta: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Telefon Numarası"
          value={formData.tel_no}
          onChange={(e) => setFormData({ ...formData, tel_no: e.target.value })}
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
        </div>

        <button type="submit">Öğretmeni Güncelle</button>
      </form>
    </>
  );
}

export default EditTeacher;
