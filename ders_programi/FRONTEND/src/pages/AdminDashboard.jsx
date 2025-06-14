import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminDashboard.module.css";
import { Menu, User } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Verileri çek
  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => {
        console.log("Gelen veri:", res.data);
        setDepartments(res.data);
        setFiltered(res.data); // ilk yüklemede tümünü göster
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
      });
  }, []);

  // Arama kutusu değişince filtrele
  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (s === "") {
      setFiltered(departments); // boşsa tümünü göster
    } else {
      setFiltered(
        departments.filter(
          (b) => b?.isim?.toLowerCase().includes(s) // güvenli kontrol
        )
      );
    }
  }, [search, departments]);

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <div className={styles.navbar}>
        <Menu className={styles.icon} onClick={() => setMenuOpen(!menuOpen)} />
        <h1 className={styles.title}>Yönetici Paneli</h1>
        <User className={styles.icon} />
      </div>

      {/* Menü */}
      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className={styles.drawer}
          >
            <ul>
              <li>
                <a href="/ogretmen-ekle" onClick={() => setMenuOpen(false)}>
                  Öğretmen Ekle
                </a>
              </li>
              <li>
                <a href="/bolum-ekle" onClick={() => setMenuOpen(false)}>
                  Bölüm Ekle
                </a>
              </li>
              <li>
                <a href="/ders-ekle" onClick={() => setMenuOpen(false)}>
                  Ders Ekle
                </a>
              </li>
              <li>
                <a href="/program-olustur" onClick={() => setMenuOpen(false)}>
                  Program Oluştur
                </a>
              </li>
            </ul>
          </motion.div>
        </>
      )}

      {/* İçerik */}
      <div className={styles.content}>
        <input
          type="text"
          placeholder="Bölüm ismine göre ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        {/* <p>{filtered.length} bölüm bulundu</p> */}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Bölüm İsmi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bolum) => (
                <tr key={bolum.id}>
                  <td>{bolum.id}</td>
                  <td>{bolum.isim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
