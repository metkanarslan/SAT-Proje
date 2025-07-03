<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once "db.php"; // PDO bağlantısı: $conn

try {
    $stmt = $conn->query("SELECT id, isim FROM bolum ORDER BY isim");
    $bolumler = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($bolumler);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri çekme hatası: " . $e->getMessage()]);
}
?>
