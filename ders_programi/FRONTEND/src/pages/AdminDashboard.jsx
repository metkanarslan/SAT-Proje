import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminDashboard.module.css";
import { Menu, User, Pencil, Trash2, ClipboardEdit } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => {
        setDepartments(res.data);
        setFiltered(res.data);
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
      });
  }, []);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (s === "") {
      setFiltered(departments);
    } else {
      setFiltered(
        departments.filter((b) => b?.isim?.toLowerCase().includes(s))
      );
    }
  }, [search, departments]);

  const handleDelete = (bolumId) => {
    if (window.confirm("Bu bölümü silmek istediğinize emin misiniz?")) {
      axios
        .post("http://localhost/ders_programi/api/bolum_sil.php", {
          bolum_id: bolumId,
        })
        .then((res) => {
          if (res.data.success) {
            alert("Bölüm başarıyla silindi.");
            setDepartments((prev) => prev.filter((b) => b.id !== bolumId));
          } else {
            alert("Silme işlemi başarısız: " + res.data.message);
          }
        })
        .catch((err) => {
          alert("Sunucu hatası: " + err.message);
        });
    }
  };

  return (
    <div className={styles.container}>
      <AdminNavbar />

      <div className={styles.content}>
        <input
          type="text"
          placeholder="Bölüm ismine göre ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Bölüm İsmi</th>
                <th className={styles.actionsHeader}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bolum) => (
                <tr key={bolum.id}>
                  <td>{bolum.id}</td>
                  <td>{bolum.isim}</td>
                  <td className={styles.actionsCell}>
                    <button
                      onClick={() => navigate(`/edit-department/${bolum.id}`)}
                      className={styles.iconButton}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => navigate(`/edit-program/${bolum.id}`)}
                      className={styles.iconButton}
                    >
                      <ClipboardEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(bolum.id)}
                      className={styles.iconButtonn}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
