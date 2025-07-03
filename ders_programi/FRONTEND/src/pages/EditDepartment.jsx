import React, { useEffect, useState } from "react";
import styles from "./AddDepartment.module.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

function EditDepartment() {
  const { id } = useParams(); // bölüm ID
  const navigate = useNavigate();

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

  useEffect(() => {
    // Seçili verileri ve isimleri getir
    axios
      .post("http://localhost/ders_programi/api/bolum_detay_getir.php", { id })
      .then((res) => {
        const data = res.data;
        setDepartmentName(data.isim);
        setSelectedTeachers(data.ogretmenler.map((o) => o.ogr_id));
        setSelectedCourses(data.dersler.map((d) => d.ders_id));
        setSelectedClasses(data.siniflar.map((s) => s.sinif_id));
      });

    axios
      .get("http://localhost/ders_programi/api/ogretmen_list.php")
      .then((res) => setTeachers(res.data));
    axios
      .get("http://localhost/ders_programi/api/ders_listesi.php")
      .then((res) => setCourses(res.data));
    axios
      .get("http://localhost/ders_programi/api/sinif_listesi.php")
      .then((res) => setClasses(res.data));
  }, [id]);

  const toggleItem = (id, selected, setSelected) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredTeachers = teachers.filter((t) =>
    `${t.isim} ${t.soyisim}`.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredCourses = courses.filter((d) =>
    d.isim.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredClasses = classes.filter((s) =>
    s.isim.toLowerCase().includes(classSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!departmentName.trim()) {
      setError("Bölüm ismi boş bırakılamaz.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/ders_programi/api/bolum_guncelle.php",
        {
          id,
          isim: departmentName,
          ogretmenler: selectedTeachers,
          dersler: selectedCourses,
          siniflar: selectedClasses,
        }
      );

      if (res.data.success) {
        alert(res.data.message);
        navigate("/admin");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      setError("Sunucu hatası.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Bölüm Düzenle</h2>

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
            placeholder="Öğretmen ara"
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
            placeholder="Ders ara"
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
            placeholder="Sınıf ara"
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
            Kaydet
          </button>
        </div>
      </div>
    </>
  );
}

export default EditDepartment;
