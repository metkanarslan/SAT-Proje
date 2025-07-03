<?php
require_once "db.php";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$data = json_decode(file_get_contents("php://input"), true);

$isim = trim($data["isim"] ?? "");
$ogretmenler = $data["ogretmenler"] ?? [];
$dersler = $data["dersler"] ?? [];
$siniflar = $data["siniflar"] ?? [];

if ($isim === "") {
    echo json_encode(["success" => false, "message" => "Bölüm ismi boş bırakılamaz."]);
    exit;
}

try {
    $conn->beginTransaction();

    // Aynı isimde bölüm var mı
    $checkStmt = $conn->prepare("SELECT id FROM bolum WHERE isim = ?");
    $checkStmt->execute([$isim]);
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Bu isimde bir bölüm zaten var."]);
        exit;
    }

    // bolum tablosuna ekle
    $insertBolum = $conn->prepare("INSERT INTO bolum (isim) VALUES (?)");
    $insertBolum->execute([$isim]);
    $bolum_id = $conn->lastInsertId();

    // ogr_bolum
    if (!empty($ogretmenler)) {
        $stmt = $conn->prepare("SELECT id, isim, soyisim FROM ogretmen WHERE id IN (" . implode(",", array_fill(0, count($ogretmenler), "?")) . ")");
        $stmt->execute($ogretmenler);
        $ogrs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $insert = $conn->prepare("INSERT INTO ogr_bolum (isim, soyisim, ogr_id, bolum_isim, bolum_id) VALUES (?, ?, ?, ?, ?)");
        foreach ($ogrs as $o) {
            $insert->execute([$o["isim"], $o["soyisim"], $o["id"], $isim, $bolum_id]);
        }
    }

    // ders_bolum
    if (!empty($dersler)) {
        $stmt = $conn->prepare("SELECT id, isim FROM ders WHERE id IN (" . implode(",", array_fill(0, count($dersler), "?")) . ")");
        $stmt->execute($dersler);
        $dersList = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $insert = $conn->prepare("INSERT INTO ders_bolum (ders_isim, bolum_isim, ders_id, bolum_id) VALUES (?, ?, ?, ?)");
        foreach ($dersList as $d) {
            $insert->execute([$d["isim"], $isim, $d["id"], $bolum_id]);
        }
    }

    // sinif_bolum
    if (!empty($siniflar)) {
        $stmt = $conn->prepare("SELECT id, isim FROM sinif WHERE id IN (" . implode(",", array_fill(0, count($siniflar), "?")) . ")");
        $stmt->execute($siniflar);
        $sinifList = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $insert = $conn->prepare("INSERT INTO sinif_bolum (sinif_isim, bolum_isim, sinif_id, bolum_id) VALUES (?, ?, ?, ?)");
        foreach ($sinifList as $s) {
            $insert->execute([$s["isim"], $isim, $s["id"], $bolum_id]);
        }
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Bölüm başarıyla eklendi."]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Ekleme sırasında hata oluştu.", "error" => $e->getMessage()]);
}
