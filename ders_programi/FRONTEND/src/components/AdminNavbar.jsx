import React, { useState } from "react";
import { Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./AdminNavbar.module.css";

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <div className={styles.navbar}>
        <Menu className={styles.icon} onClick={() => setMenuOpen(!menuOpen)} />
        <h1 className={styles.title}> </h1>
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
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/add-teacher" onClick={() => setMenuOpen(false)}>
                  Öğretmen Ekle
                </Link>
              </li>
              <li>
                <Link to="/add-department" onClick={() => setMenuOpen(false)}>
                  Bölüm Ekle
                </Link>
              </li>
              <li>
                <Link to="/add-course" onClick={() => setMenuOpen(false)}>
                  Ders Ekle
                </Link>
              </li>
              <li>
                <Link to="/add-class" onClick={() => setMenuOpen(false)}>
                  Sınıf Ekle
                </Link>
              </li>
              <li>
                <Link to="/program-olustur" onClick={() => setMenuOpen(false)}>
                  Program Oluştur
                </Link>
              </li>
              <li>
                <Link to="/teacher-list" onClick={() => setMenuOpen(false)}>
                  Öğretmen Listesi
                </Link>
              </li>
              <li>
                <Link to="/course-list" onClick={() => setMenuOpen(false)}>
                  Ders Listesi
                </Link>
              </li>
              <li>
                <Link to="/class-list" onClick={() => setMenuOpen(false)}>
                  Sınıf Listesi
                </Link>
              </li>
            </ul>
          </motion.div>
        </>
      )}
    </>
  );
};

export default AdminNavbar;
