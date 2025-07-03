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
$ogretmen_id = $data["id"];

try {
    // 1. Öğretmenin programda kullanılıp kullanılmadığını kontrol et
    $query = $conn->prepare("
        SELECT DISTINCT b.isim as bolum_adi
        FROM ders_programi dp
        JOIN bolum b ON dp.bolum_id = b.id
        WHERE dp.ogretmen_id = ?
    ");
    $query->execute([$ogretmen_id]);
    $kullanim = $query->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($kullanim)) {
        echo json_encode([
            "success" => false,
            "message" => "Bu öğretmen şu bölümlerde ders vermektedir: " . implode(", ", $kullanim) . ". Lütfen önce programı güncelleyiniz."
        ]);
        exit;
    }

    // 2. Kullanılmıyorsa ilişkili tüm verileri sil
    $conn->beginTransaction();

    $conn->prepare("DELETE FROM ogr_bolum WHERE ogr_id = ?")->execute([$ogretmen_id]);
    $conn->prepare("DELETE FROM ogr_ders WHERE ogr_id = ?")->execute([$ogretmen_id]);
    $conn->prepare("DELETE FROM ogretmen WHERE id = ?")->execute([$ogretmen_id]);

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Öğretmen başarıyla silindi."]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Bir hata oluştu: " . $e->getMessage()]);
}
?>
