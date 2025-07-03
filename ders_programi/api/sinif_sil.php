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
$sinif_id = $data['sinif_id'] ?? null;

if (!$sinif_id) {
    echo json_encode(["success" => false, "message" => "Geçersiz sınıf ID."]);
    exit;
}

// Bu sınıfın programlarda kullanıldığı bölümleri bul
$sql = "SELECT DISTINCT b.isim 
        FROM ders_programi dp
        JOIN bolum b ON dp.bolum_id = b.id
        WHERE dp.sinif_id = :sinif_id";
$stmt = $conn->prepare($sql);
$stmt->execute(['sinif_id' => $sinif_id]);
$rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (count($rows) > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Bu sınıf şu bölümlerde kullanılmaktadır: " . implode(", ", $rows) . ". Lütfen önce programı güncelleyiniz."
    ]);
    exit;
}

// Programda kullanılmıyorsa silme işlemleri
try {
    $conn->beginTransaction();

    $stmt1 = $conn->prepare("DELETE FROM sinif_bolum WHERE sinif_id = :id");
    $stmt1->execute(['id' => $sinif_id]);

    $stmt2 = $conn->prepare("DELETE FROM sinif WHERE id = :id");
    $stmt2->execute(['id' => $sinif_id]);

    $conn->commit();

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Hata: " . $e->getMessage()]);
}
?>