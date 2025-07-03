// TeacherList.jsx
import React, { useEffect, useState } from "react";
import styles from "./TeacherList.module.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Pencil, Trash2, Menu, User } from "lucide-react";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/ogretmen_list.php")
      .then((res) => setTeachers(res.data))
      .catch((err) => console.error("Veri çekilemedi", err));
  }, []);

  const filteredTeachers = teachers.filter((t) =>
    (t.isim + " " + t.soyisim).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bu öğretmeni silmek istediğinizden emin misiniz?"))
      return;

    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/ogretmen_sil.php",
        { id }
      );
      const result = response.data;

      if (result.success) {
        alert(result.message);
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Öğretmen Listesi</h2>
        <input
          type="text"
          placeholder="İsim veya Soyisim ile Ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>İsim</th>
                <th>Soyisim</th>
                <th>E-Posta</th>
                <th>Telefon</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.isim}</td>
                  <td>{t.soyisim}</td>
                  <td>{t.e_posta}</td>
                  <td>{t.tel_no}</td>
                  <td>
                    <Pencil
                      className={styles.icon}
                      onClick={() => navigate(`/edit-teacher/${t.id}`)}
                    />
                    <Trash2
                      className={styles.icon}
                      onClick={() => handleDelete(t.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TeacherList;
