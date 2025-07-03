<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

if (!isset($_GET["bolum_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Bölüm ID gerekli."]);
    exit;
}

$bolum_id = $_GET["bolum_id"];

try {
    $stmt = $conn->prepare("
        SELECT d.id, d.isim, d.ders_kodu
        FROM ders d
        JOIN ders_bolum db ON d.id = db.ders_id
        WHERE db.bolum_id = :bolum_id
        ORDER BY d.isim ASC
    ");
    $stmt->execute([":bolum_id" => $bolum_id]);
    $dersler = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($dersler);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri çekilirken hata oluştu."]);
}
