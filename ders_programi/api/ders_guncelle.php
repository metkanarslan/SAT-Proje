<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$ders_id = $data["id"] ?? null;
$isim = trim($data["isim"] ?? "");
$yeniBolumler = $data["bolumler"] ?? [];
$yeniOgretmenler = $data["ogretmenler"] ?? [];

if (!$ders_id || $isim === "") {
    http_response_code(400);
    echo json_encode(["error" => "Ders ismi ve ID zorunludur."]);
    exit;
}

if (!is_array($yeniBolumler) || count($yeniBolumler) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "En az bir bölüm seçilmelidir."]);
    exit;
}

try {
    $hatalar = [];

    // Aynı isimli başka ders var mı?
    $kontrol = $conn->prepare("SELECT COUNT(*) FROM ders WHERE isim = :isim AND id != :id");
    $kontrol->execute([":isim" => $isim, ":id" => $ders_id]);
    if ($kontrol->fetchColumn() > 0) {
        $hatalar[] = "Bu isimde başka bir ders zaten var.";
    }

    // Güncel bölümleri ve öğretmenleri çek
    $eskiBolumler = $conn->prepare("SELECT bolum_id FROM ders_bolum WHERE ders_id = :id");
    $eskiBolumler->execute([":id" => $ders_id]);
    $mevcutBolumler = $eskiBolumler->fetchAll(PDO::FETCH_COLUMN);

    $eskiOgretmenler = $conn->prepare("SELECT ogr_id FROM ogr_ders WHERE ders_id = :id");
    $eskiOgretmenler->execute([":id" => $ders_id]);
    $mevcutOgretmenler = $eskiOgretmenler->fetchAll(PDO::FETCH_COLUMN);

    // 🔍 Kaldırılan bölümleri bul ve kontrol et
    $kaldirilanBolumler = array_diff($mevcutBolumler, $yeniBolumler);
    foreach ($kaldirilanBolumler as $bolum_id) {
        $kontrol = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE ders_id = :ders_id AND bolum_id = :bolum_id");
        $kontrol->execute([":ders_id" => $ders_id, ":bolum_id" => $bolum_id]);
        if ($kontrol->fetchColumn() > 0) {
            $stmt = $conn->prepare("SELECT isim FROM bolum WHERE id = :id");
            $stmt->execute([":id" => $bolum_id]);
            $bolumIsim = $stmt->fetchColumn();
            $hatalar[] = "$isim dersi $bolumIsim bölümünde programda kullanılmakta. Lütfen önce programı düzenleyiniz.";
        }
    }

    // 🔍 Kaldırılan öğretmenleri bul ve kontrol et
    $kaldirilanOgretmenler = array_diff($mevcutOgretmenler, $yeniOgretmenler);
    foreach ($kaldirilanOgretmenler as $ogr_id) {
        $kontrol = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE ders_id = :ders_id AND ogretmen_id = :ogr_id");
        $kontrol->execute([":ders_id" => $ders_id, ":ogr_id" => $ogr_id]);
        if ($kontrol->fetchColumn() > 0) {
            $stmt = $conn->prepare("SELECT isim, soyisim FROM ogretmen WHERE id = :id");
            $stmt->execute([":id" => $ogr_id]);
            $hoca = $stmt->fetch(PDO::FETCH_ASSOC);
            $hatalar[] = "$isim dersi {$hoca['isim']} {$hoca['soyisim']} tarafından programda verilmekte. Lütfen önce programı düzenleyiniz.";
        }
    }

    // Hatalar varsa, hepsini birden döndür
    if (!empty($hatalar)) {
        http_response_code(400);
        echo json_encode(["error" => implode("\n", $hatalar)]);
        exit;
    }

    // 🔄 Güncelleme işlemleri
    $conn->beginTransaction();

    $conn->prepare("UPDATE ders SET isim = :isim WHERE id = :id")
         ->execute([":isim" => $isim, ":id" => $ders_id]);

    $conn->prepare("DELETE FROM ders_bolum WHERE ders_id = :id")
         ->execute([":id" => $ders_id]);

    $insertDersBolum = $conn->prepare("INSERT INTO ders_bolum (ders_id, bolum_id, ders_isim, bolum_isim) VALUES (:ders_id, :bolum_id, :ders_isim, :bolum_isim)");
    foreach ($yeniBolumler as $bolum_id) {
        $stmt = $conn->prepare("SELECT isim FROM bolum WHERE id = :id");
        $stmt->execute([":id" => $bolum_id]);
        $bolum = $stmt->fetch(PDO::FETCH_ASSOC);
        $insertDersBolum->execute([
            ":ders_id" => $ders_id,
            ":bolum_id" => $bolum_id,
            ":ders_isim" => $isim,
            ":bolum_isim" => $bolum["isim"]
        ]);
    }

    $conn->prepare("DELETE FROM ogr_ders WHERE ders_id = :id")
         ->execute([":id" => $ders_id]);

    $insertOgrDers = $conn->prepare("INSERT INTO ogr_ders (isim, soyisim, ders_isim, ogr_id, ders_id) VALUES (:isim, :soyisim, :ders_isim, :ogr_id, :ders_id)");
    foreach ($yeniOgretmenler as $ogr_id) {
        $getOgr = $conn->prepare("SELECT isim, soyisim FROM ogretmen WHERE id = :id");
        $getOgr->execute([":id" => $ogr_id]);
        $ogr = $getOgr->fetch(PDO::FETCH_ASSOC);
        $insertOgrDers->execute([
            ":isim" => $ogr["isim"],
            ":soyisim" => $ogr["soyisim"],
            ":ders_isim" => $isim,
            ":ogr_id" => $ogr_id,
            ":ders_id" => $ders_id
        ]);
    }

    $conn->commit();
    echo json_encode(["message" => "Ders başarıyla güncellendi."]);

} catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Veri tabanı hatası", "detay" => $e->getMessage()]);
}
