import React, { useEffect, useState } from "react";
import styles from "./AddDepartment.module.css";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

function AddDepartment() {
  const [departmentName, setDepartmentName] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");

  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classSearch, setClassSearch] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/ogretmen_list.php")
      .then((res) => setTeachers(res.data));
    axios
      .get("http://localhost/ders_programi/api/ders_listesi.php")
      .then((res) => setCourses(res.data));
    axios
      .get("http://localhost/ders_programi/api/sinif_listesi.php")
      .then((res) => setClasses(res.data));
  }, []);

  const filteredTeachers = teachers.filter((t) =>
    `${t.isim} ${t.soyisim}`.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredCourses = courses.filter((d) =>
    d.isim.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredClasses = classes.filter((s) =>
    s.isim.toLowerCase().includes(classSearch.toLowerCase())
  );

  const toggleItem = (id, selected, setSelected) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) {
      setError("Bölüm ismi boş bırakılamaz.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/ders_programi/api/bolum_ekle.php",
        {
          isim: departmentName,
          ogretmenler: selectedTeachers,
          dersler: selectedCourses,
          siniflar: selectedClasses,
        }
      );

      if (res.data.success) {
        alert(res.data.message);
        setDepartmentName("");
        setSelectedTeachers([]);
        setSelectedCourses([]);
        setSelectedClasses([]);
        setError("");
        navigate("/admin");
      } else {
        setError(res.data.message || "Ekleme sırasında hata oluştu.");
      }
    } catch (err) {
      setError("Sunucu hatası.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Bölüm Ekle</h2>

        <input
          type="text"
          placeholder="Bölüm ismi girin"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          className={styles.input}
        />

        {/* Öğretmenler */}
        <div className={styles.sectionBox}>
          <h3>Öğretmenler</h3>
          <input
            type="text"
            placeholder="Öğretmen ismine göre filtrele"
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            className={styles.searchBox}
          />
          <div className={styles.checkboxGroup}>
            {filteredTeachers.map((t) => (
              <label key={t.id} className={styles.checkboxItem}>
                <span className={styles.labelText}>
                  {t.isim} {t.soyisim}
                </span>
                <input
                  type="checkbox"
                  checked={selectedTeachers.includes(t.id)}
                  onChange={() =>
                    toggleItem(t.id, selectedTeachers, setSelectedTeachers)
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* Dersler */}
        <div className={styles.sectionBox}>
          <h3>Dersler</h3>
          <input
            type="text"
            placeholder="Ders ismine göre filtrele"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className={styles.searchBox}
          />
          <div className={styles.checkboxGroup}>
            {filteredCourses.map((d) => (
              <label key={d.id} className={styles.checkboxItem}>
                <span className={styles.labelText}>{d.isim}</span>
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(d.id)}
                  onChange={() =>
                    toggleItem(d.id, selectedCourses, setSelectedCourses)
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* Sınıflar */}
        <div className={styles.sectionBox}>
          <h3>Sınıflar</h3>
          <input
            type="text"
            placeholder="Sınıf ismine göre filtrele"
            value={classSearch}
            onChange={(e) => setClassSearch(e.target.value)}
            className={styles.searchBox}
          />
          <div className={styles.checkboxGroup}>
            {filteredClasses.map((s) => (
              <label key={s.id} className={styles.checkboxItem}>
                <span className={styles.labelText}>{s.isim}</span>
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(s.id)}
                  onChange={() =>
                    toggleItem(s.id, selectedClasses, setSelectedClasses)
                  }
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
}

export default AddDepartment;
