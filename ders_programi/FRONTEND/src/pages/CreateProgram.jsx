// CreateProgram.jsx
import React, { useEffect, useState } from "react";
import styles from "./CreateProgram.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateProgram = () => {
  const [bolumler, setBolumler] = useState([]);
  const [selectedBolum, setSelectedBolum] = useState("");
  const [gunler, setGunler] = useState([]);
  const [saatler, setSaatler] = useState([]);
  const [dersler, setDersler] = useState([]);
  const [ogretmenListesi, setOgretmenListesi] = useState({});
  const [siniflar, setSiniflar] = useState([]);
  const [program, setProgram] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedBolum) {
      axios
        .get(
          `http://localhost/ders_programi/api/siniflari_getir.php?bolum_id=${selectedBolum}`
        )
        .then((res) => setSiniflar(res.data));
    }
  }, [selectedBolum]);

  useEffect(() => {
    axios
      .get("http://localhost/ders_programi/api/bolumleri_getir.php")
      .then((res) => setBolumler(res.data));
    axios
      .get("http://localhost/ders_programi/api/gunleri_getir.php")
      .then((res) => setGunler(res.data));
    axios
      .get("http://localhost/ders_programi/api/saatleri_getir.php")
      .then((res) => setSaatler(res.data));
  }, []);

  useEffect(() => {
    if (selectedBolum) {
      axios
        .get(
          `http://localhost/ders_programi/api/dersleri_getir.php?bolum_id=${selectedBolum}`
        )
        .then((res) => setDersler(res.data));
    }
  }, [selectedBolum]);

  const handleSelectChange = (dayId, timeId, field, value) => {
    const cellKey = `${dayId}_${timeId}`;
    setProgram((prev) => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        [field]: value,
      },
    }));

    if (field === "ders_id") {
      axios
        .get(
          `http://localhost/ders_programi/api/ogretmenleri_getir.php?ders_id=${value}&bolum_id=${selectedBolum}`
        )
        .then((res) => {
          setOgretmenListesi((prev) => ({
            ...prev,
            [cellKey]: res.data,
          }));
        });
    }
  };

  const handleAutoFillProgram = () => {
    axios
      .post("http://localhost/ders_programi/api/otomatik_program.php", {
        bolum_id: selectedBolum,
      })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          setProgram(data.program);
          Object.entries(data.program).forEach(([key, val]) => {
            if (val.ders_id) {
              axios
                .get(
                  `http://localhost/ders_programi/api/ogretmenleri_getir.php?ders_id=${val.ders_id}&bolum_id=${selectedBolum}`
                )
                .then((res) => {
                  setOgretmenListesi((prev) => ({
                    ...prev,
                    [key]: res.data,
                  }));
                });
            }
          });
          alert("Otomatik program başarıyla oluşturuldu.");
        } else {
          if (data.missing && data.missing.length > 0) {
            alert(
              "Otomatik program oluşturulamadı. Yerleştirilemeyen ders ID'leri:\n" +
                data.missing.join(", ")
            );
          } else {
            alert("Otomatik program oluşturulamadı: " + data.message);
          }
        }
      })
      .catch((err) => {
        alert("Sunucu hatası oluştu.");
        console.error(err);
      });
  };

  const handleSubmit = () => {
    axios
      .post("http://localhost/ders_programi/api/createprogram.php", {
        bolum_id: selectedBolum,
        program: program,
      })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          if (data.errors && data.errors.length > 0) {
            alert(
              `Program kısmen oluşturuldu.\n\n- ${data.errors.join("\n- ")}`
            );
          } else {
            alert("Tüm program başarıyla oluşturuldu.");
            navigate("/admin");
          }
        } else {
          alert("İşlem başarısız: " + (data.message || "Bilinmeyen hata"));
        }
      })
      .catch((err) => {
        alert("Sunucu hatası oluştu.");
        console.error(err);
      });
  };

  return (
    <div className={styles.container}>
      <h2>Ders Programı Oluştur</h2>
      <select
        value={selectedBolum}
        onChange={(e) => setSelectedBolum(e.target.value)}
      >
        <option value="">Bölüm Seçiniz</option>
        {bolumler.map((b) => (
          <option key={b.id} value={b.id}>
            {b.isim}
          </option>
        ))}
      </select>

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
                {saat.baslangic.slice(0, 5)} - {saat.bitis.slice(0, 5)}
              </td>
              <td>--</td>
              {gunler.map((gun) => {
                const cellKey = `${gun.id}_${saat.id}`;
                const cellData = program[cellKey] || {};
                return (
                  <td key={cellKey}>
                    <select
                      value={cellData.ders_id || ""}
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
                      value={cellData.ogretmen_id || ""}
                      onChange={(e) =>
                        handleSelectChange(
                          gun.id,
                          saat.id,
                          "ogretmen_id",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Ogretmen Seç</option>
                      {(ogretmenListesi[cellKey] || []).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.ad_soyad}
                        </option>
                      ))}
                    </select>
                    <select
                      value={cellData.sinif_id || ""}
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

      <button
        onClick={handleAutoFillProgram}
        className={styles.autoFillBtn}
        disabled={!selectedBolum}
      >
        Otomatik Program Oluştur
      </button>
      <button onClick={handleSubmit} className={styles.submitBtn}>
        Oluştur
      </button>
    </div>
  );
};

export default CreateProgram;
