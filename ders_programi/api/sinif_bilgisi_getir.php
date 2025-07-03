<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"];

try {
    // sınıf adı
    $stmt = $conn->prepare("SELECT isim FROM sinif WHERE id = :id");
    $stmt->execute(["id" => $id]);
    $isim = $stmt->fetchColumn();

    // ait olduğu bölümler
    $stmt2 = $conn->prepare("SELECT bolum_id FROM sinif_bolum WHERE sinif_id = :id");
    $stmt2->execute(["id" => $id]);
    $bolumler = $stmt2->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "sinif_isim" => $isim,
        "bolumler" => array_map("strval", $bolumler)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
