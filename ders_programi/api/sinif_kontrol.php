<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php"; // PDO bağlantısı burada

$data = json_decode(file_get_contents("php://input"), true);
$isim = trim($data["isim"]);

try {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM sinif WHERE isim = :isim");
    $stmt->execute(['isim' => $isim]);
    $count = $stmt->fetchColumn();

    echo json_encode(["exists" => $count > 0]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri kontrol hatası", "detay" => $e->getMessage()]);
}
?>
