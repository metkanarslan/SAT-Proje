<?php
require_once "db.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 🔄 Preflight isteği (OPTIONS) geldiğinde durdur
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;

if (!$id) {
    echo json_encode(["error" => "Geçersiz ID."]);
    exit;
}

// Bölüm ismi
$stmt1 = $conn->prepare("SELECT isim FROM bolum WHERE id = ?");
$stmt1->execute([$id]);
$bolum = $stmt1->fetch(PDO::FETCH_ASSOC);

// Öğretmenler
$stmt2 = $conn->prepare("SELECT ogr_id FROM ogr_bolum WHERE bolum_id = ?");
$stmt2->execute([$id]);
$ogretmenler = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// Dersler
$stmt3 = $conn->prepare("SELECT ders_id FROM ders_bolum WHERE bolum_id = ?");
$stmt3->execute([$id]);
$dersler = $stmt3->fetchAll(PDO::FETCH_ASSOC);

$stmt4 = $conn->prepare("SELECT sinif_id FROM sinif_bolum WHERE bolum_id = ?");
$stmt4->execute([$id]);
$siniflar = $stmt4->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "isim" => $bolum["isim"] ?? "",
    "ogretmenler" => $ogretmenler,
    "dersler" => $dersler,
    "siniflar" => $siniflar
]);
