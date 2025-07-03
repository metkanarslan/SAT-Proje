import React, { useEffect, useState } from "react";
import styles from "./ClassList.module.css";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const ClassList = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setDepartments(res.data));

    axios
      .get("http://localhost/ders_programi/api/sinif_listele.php")
      .then((res) => {
        setClasses(res.data);
        setFilteredClasses(res.data);
      });
  }, []);

  useEffect(() => {
    let filtered = [...classes];

    if (selectedDepartment) {
      filtered = filtered.filter((sinif) =>
        sinif.bolum_idler.includes(parseInt(selectedDepartment))
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((sinif) =>
        sinif.sinif_isim.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  }, [selectedDepartment, searchTerm, classes]);

  const handleDelete = async (sinifId) => {
    const confirmDelete = window.confirm(
      "Bu sınıfı silmek istediğinizden emin misiniz?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.post(
        "http://localhost/ders_programi/api/sinif_sil.php",
        {
          sinif_id: sinifId,
        }
      );

      if (response.data.success) {
        alert("Sınıf başarıyla silindi.");
        setClasses((prev) => prev.filter((s) => s.sinif_id !== sinifId));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className={styles.container}>
        <h2>Sınıf Listesi</h2>

        <div className={styles.filters}>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Tüm Bölümler</option>
            {departments.map((b) => (
              <option key={b.id} value={b.id}>
                {b.isim}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Sınıf ismine göre ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.list}>
          {filteredClasses.map((item, index) => (
            <div key={index} className={styles.listItem}>
              <span>{item.sinif_isim}</span>
              <div className={styles.buttons}>
                <button
                  className={styles.iconButton}
                  onClick={() => navigate(`/edit-class/${item.sinif_id}`)}
                >
                  <Pencil size={18} />
                </button>
                <button
                  className={styles.iconButtonn}
                  onClick={() => handleDelete(item.sinif_id)}
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredClasses.length === 0 && (
            <p className={styles.noResult}>Hiçbir sınıf bulunamadı.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ClassList;
