<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

try {
    $stmt = $conn->query("SELECT id, baslangic, bitis FROM saat ORDER BY baslangic ASC");
    $saatler = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($saatler);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Saatler alınamadı", "details" => $e->getMessage()]);
}
?>
