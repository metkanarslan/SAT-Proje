<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php"; // PDO bağlantısı: $conn

try {
    $stmt = $conn->query("SELECT id, isim FROM bolum");
    $bolumler = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($bolumler);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri çekme hatası: " . $e->getMessage()]);
}
?>
