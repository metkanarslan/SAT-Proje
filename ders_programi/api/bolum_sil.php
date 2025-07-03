<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


require_once "db.php"; // PDO bağlantısı $conn olarak tanımlanmış olmalı

$data = json_decode(file_get_contents("php://input"), true);
$bolum_id = $data["bolum_id"] ?? null;

if (!$bolum_id) {
    echo json_encode(["success" => false, "message" => "Bölüm ID eksik."]);
    exit;
}

try {
    $conn->beginTransaction();

    // İlişkili tablolardan sil
    $conn->prepare("DELETE FROM ders_programi WHERE bolum_id = :id")
         ->execute([':id' => $bolum_id]);

    $conn->prepare("DELETE FROM ogr_bolum WHERE bolum_id = :id")
         ->execute([':id' => $bolum_id]);

    $conn->prepare("DELETE FROM ders_bolum WHERE bolum_id = :id")
         ->execute([':id' => $bolum_id]);

    $conn->prepare("DELETE FROM sinif_bolum WHERE bolum_id = :id")
         ->execute([':id' => $bolum_id]);

    // Son olarak bolum tablosundan sil
    $conn->prepare("DELETE FROM bolum WHERE id = :id")
         ->execute([':id' => $bolum_id]);

    $conn->commit();

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Silme işlemi sırasında hata oluştu: " . $e->getMessage()
    ]);
}
?>
