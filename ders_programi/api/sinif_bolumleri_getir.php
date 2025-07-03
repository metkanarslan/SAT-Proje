<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php"; // PDO bağlantısı

try {
    $stmt = $conn->prepare("SELECT id, isim FROM bolum");
    $stmt->execute();
    $bolumler = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($bolumler);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri çekilirken hata oluştu.", "detay" => $e->getMessage()]);
}
?>
