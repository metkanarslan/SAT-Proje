// Güncellenmiş CourseList.jsx
import React, { useEffect, useState } from "react";
import styles from "./CourseList.module.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const CourseList = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(
          `http://localhost/ders_programi/api/bolume_gore_ders_getir.php?bolum_id=${selectedDepartment}`
        )
        .then((res) => setCourses(res.data));
    } else {
      setCourses([]);
    }
  }, [selectedDepartment]);

  const handleDelete = async (dersId) => {
    const confirmed = window.confirm(
      "Bu dersi silmek istediğinize emin misiniz?"
    );
    if (!confirmed) return;

    try {
      const res = await axios.post(
        "http://localhost/ders_programi/api/ders_sil.php",
        { ders_id: dersId }
      );
      alert(res.data.message);
      // listeyi yenile
      setCourses(courses.filter((d) => d.id !== dersId));
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Silme işlemi sırasında bir hata oluştu.");
      }
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Ders Listesi</h2>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={styles.select}
        >
          <option value="">Bölüm Seçiniz</option>
          {departments.map((b) => (
            <option key={b.id} value={b.id}>
              {b.isim}
            </option>
          ))}
        </select>

        {courses.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ders İsmi</th>
                <th>Ders Kodu</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((ders) => (
                <tr key={ders.id}>
                  <td>{ders.isim}</td>
                  <td>{ders.ders_kodu}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/edit-course/${ders.id}`)}
                      className={styles.iconButton}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ders.id)}
                      className={styles.iconButtonn}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default CourseList;
