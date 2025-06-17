<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

$bolum_id = $_GET['bolum_id'] ?? null;

if (!$bolum_id) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT sinif_id AS id, sinif_isim FROM sinif_bolum WHERE bolum_id = ?");
    $stmt->execute([$bolum_id]);
    $siniflar = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($siniflar);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Sınıflar alınamadı", "details" => $e->getMessage()]);
}
?>
