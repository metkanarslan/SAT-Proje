<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

if (!isset($_GET["id"])) {
    http_response_code(400);
    echo json_encode(["error" => "ID gerekli."]);
    exit;
}

$ders_id = $_GET["id"];

try {
    // Dersi getir
    $stmt = $conn->prepare("SELECT id, isim, ders_kodu FROM ders WHERE id = :id");
    $stmt->execute([":id" => $ders_id]);
    $ders = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ders) {
        http_response_code(404);
        echo json_encode(["error" => "Ders bulunamadı."]);
        exit;
    }

    // Bölüm ID'lerini getir (ders_bolum tablosundan)
    $stmt2 = $conn->prepare("SELECT bolum_id FROM ders_bolum WHERE ders_id = :id");
    $stmt2->execute([":id" => $ders_id]);
    $bolumler = $stmt2->fetchAll(PDO::FETCH_COLUMN);

    // Öğretmenleri getir (ogr_ders tablosundan)
    $stmt3 = $conn->prepare("SELECT ogr_id FROM ogr_ders WHERE ders_id = :id");
    $stmt3->execute([":id" => $ders_id]);
    $ogretmenler = $stmt3->fetchAll(PDO::FETCH_COLUMN);

    // Sonuçları birleştir
    $ders["bolumler"] = $bolumler;
    $ders["ogretmenler"] = $ogretmenler;

    echo json_encode($ders);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri alınırken hata oluştu."]);
}
