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
$ders_id = $data["ders_id"] ?? null;

if (!$ders_id) {
    http_response_code(400);
    echo json_encode(["error" => "Ders ID eksik."]);
    exit;
}

try {
    // 1. Bu dersin programda olup olmadığını kontrol et
    $kontrol = $conn->prepare("
        SELECT DISTINCT b.isim 
        FROM ders_programi dp
        JOIN bolum b ON dp.bolum_id = b.id
        WHERE dp.ders_id = :ders_id
    ");
    $kontrol->execute([":ders_id" => $ders_id]);
    $kullanilanBolumler = $kontrol->fetchAll(PDO::FETCH_COLUMN);

    if (count($kullanilanBolumler) > 0) {
        $bolumListesi = implode(", ", $kullanilanBolumler);
        http_response_code(400);
        echo json_encode([
            "error" => "Bu ders şu programlarda kullanılmaktadır: $bolumListesi. Lütfen önce programı güncelleyiniz."
        ]);
        exit;
    }

    // 2. İlişkili tüm verileri sil
    $conn->beginTransaction();

    $conn->prepare("DELETE FROM ogr_ders WHERE ders_id = :id")->execute([":id" => $ders_id]);
    $conn->prepare("DELETE FROM ders_bolum WHERE ders_id = :id")->execute([":id" => $ders_id]);
    $conn->prepare("DELETE FROM ders WHERE id = :id")->execute([":id" => $ders_id]);

    $conn->commit();

    echo json_encode(["message" => "Ders başarıyla silindi."]);
} catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Silme işlemi sırasında hata oluştu.", "detay" => $e->getMessage()]);
}
?>