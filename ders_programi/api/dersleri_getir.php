<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once "db.php";

$bolum_id = $_GET['bolum_id'] ?? null;

if (!$bolum_id) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT d.id, d.isim 
        FROM ders d
        JOIN ders_bolum db ON d.id = db.ders_id
        WHERE db.bolum_id = ?
    ");
    $stmt->execute([$bolum_id]);
    $dersler = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($dersler);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Dersler alınamadı", "details" => $e->getMessage()]);
}
?>
