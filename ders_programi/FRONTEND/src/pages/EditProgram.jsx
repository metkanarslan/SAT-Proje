import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditProgram.module.css";
import axios from "axios";

const EditProgram = () => {
  const { bolumId } = useParams();
  const [gunler, setGunler] = useState([]);
  const [saatler, setSaatler] = useState([]);
  const [program, setProgram] = useState({});
  const [dersler, setDersler] = useState([]);
  const [siniflar, setSiniflar] = useState([]);
  const [ogretmenListesi, setOgretmenListesi] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/gunleri_getir.php")
      .then((res) => setGunler(res.data));
    axios
      .get("http://localhost/ders_programi/api/saatleri_getir.php")
      .then((res) => setSaatler(res.data));
    axios
      .get(
        `http://localhost/ders_programi/api/dersleri_getir.php?bolum_id=${bolumId}`
      )
      .then((res) => setDersler(res.data));
    axios
      .get(
        `http://localhost/ders_programi/api/siniflari_getir.php?bolum_id=${bolumId}`
      )
      .then((res) => setSiniflar(res.data));
    axios
      .get(
        `http://localhost/ders_programi/api/programi_getir.php?bolum_id=${bolumId}`
      )
      .then((res) => setProgram(res.data));
  }, [bolumId]);

  useEffect(() => {
    if (program && Object.keys(program).length > 0) {
      Object.entries(program).forEach(([key, value]) => {
        const { ders_id } = value;
        if (ders_id) {
          axios
            .get(
              `http://localhost/ders_programi/api/ogretmenleri_getir.php?ders_id=${ders_id}&bolum_id=${bolumId}`
            )
            .then((res) => {
              setOgretmenListesi((prev) => ({
                ...prev,
                [key]: res.data,
              }));
            });
        }
      });
    }
  }, [program, bolumId]);

  const handleSelectChange = (dayId, timeId, field, value) => {
    const key = `${dayId}_${timeId}`;
    setProgram((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));

    if (field === "ders_id") {
      axios
        .get(
          `http://localhost/ders_programi/api/ogretmenleri_getir.php?ders_id=${value}&bolum_id=${bolumId}`
        )
        .then((res) => {
          setOgretmenListesi((prev) => ({
            ...prev,
            [key]: res.data,
          }));
        });
    }
  };

  const handleSubmit = () => {
    axios
      .post("http://localhost/ders_programi/api/programi_guncelle.php", {
        bolum_id: bolumId,
        program: program,
      })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          alert("Ders programı başarıyla güncellendi.");
          navigate("/admin");
        } else if (data.errors && data.errors.length > 0) {
          alert("Program güncellenemedi:\n\n- " + data.errors.join("\n- "));
        } else {
          alert("Bir hata oluştu.");
        }
      })
      .catch((err) => {
        alert("Sunucu hatası oluştu.");
        console.error(err);
      });
  };

  const handleAutoFillProgram = () => {
    axios
      .post("http://localhost/ders_programi/api/otomatik_program.php", {
        bolum_id: bolumId,
      })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          if (!data.program || Object.keys(data.program).length === 0) {
            alert("Hiçbir ders otomatik olarak yerleştirilemedi.");
          } else {
            setProgram(data.program);
            alert("Otomatik program başarıyla oluşturuldu.");
            // Öğretmen listesini de güncelle
            Object.entries(data.program).forEach(([key, value]) => {
              const { ders_id } = value;
              if (ders_id) {
                axios
                  .get(
                    `http://localhost/ders_programi/api/ogretmenleri_getir.php?ders_id=${ders_id}&bolum_id=${bolumId}`
                  )
                  .then((res) => {
                    setOgretmenListesi((prev) => ({
                      ...prev,
                      [key]: res.data,
                    }));
                  });
              }
            });
          }
        } else {
          alert("Otomatik program oluşturulamadı: " + data.message);
        }
      })
      .catch((err) => {
        alert("Sunucu hatası oluştu.");
        console.error(err);
      });
  };

  return (
    <div className={styles.container}>
      <h2>Ders Programını Düzenle</h2>
      <table className={styles.programTable}>
        <thead>
          <tr>
            <th></th>
            <th></th>
            {gunler.map((gun) => (
              <th key={gun.id}>{gun.isim}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {saatler.map((saat) => (
            <tr key={saat.id}>
              <td>
                <select disabled value={saat.id} className={styles.saatSelect}>
                  <option value="">Saat Seç</option>
                  <option value={saat.id}>
                    {saat.baslangic.slice(0, 5)} - {saat.bitis.slice(0, 5)}
                  </option>
                </select>
              </td>
              <td>--</td>
              {gunler.map((gun) => {
                const cellKey = `${gun.id}_${saat.id}`;
                const current = program[cellKey] || {};
                return (
                  <td key={cellKey}>
                    <select
                      value={current.ders_id || ""}
                      onChange={(e) =>
                        handleSelectChange(
                          gun.id,
                          saat.id,
                          "ders_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Ders Seç</option>
                      {dersler.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.isim}
                        </option>
                      ))}
                    </select>

                    <select
                      value={current.ogretmen_id || ""}
                      onChange={(e) =>
                        handleSelectChange(
                          gun.id,
                          saat.id,
                          "ogretmen_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Öğretmen Seç</option>
                      {(ogretmenListesi[cellKey] || []).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.ad_soyad}
                        </option>
                      ))}
                    </select>

                    <select
                      value={current.sinif_id || ""}
                      onChange={(e) =>
                        handleSelectChange(
                          gun.id,
                          saat.id,
                          "sinif_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Sınıf Seç</option>
                      {siniflar.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.sinif_isim}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleAutoFillProgram} className={styles.autoFillBtn}>
        Otomatik Program Oluştur
      </button>
      <button onClick={handleSubmit} className={styles.submitBtn}>
        Kaydet
      </button>
    </div>
  );
};

export default EditProgram;
