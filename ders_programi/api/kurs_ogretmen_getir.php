<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "db.php";

// POST verisini al
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["bolum_ids"]) || !is_array($data["bolum_ids"])) {
    http_response_code(400);
    echo json_encode(["error" => "Bölüm ID listesi gerekli."]);
    exit;
}

$bolumIds = $data["bolum_ids"];

// Sorguyu dinamik şekilde oluştur
$placeholders = implode(',', array_fill(0, count($bolumIds), '?'));

try {
    $stmt = $conn->prepare("
        SELECT DISTINCT ogretmen.id, ogretmen.isim, ogretmen.soyisim
        FROM ogretmen
        INNER JOIN ogr_bolum ON ogretmen.id = ogr_bolum.ogr_id
        WHERE ogr_bolum.bolum_id IN ($placeholders)
    ");
    $stmt->execute($bolumIds);
    $ogretmenler = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($ogretmenler);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri alınırken hata oluştu.", "detay" => $e->getMessage()]);
}