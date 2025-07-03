<?php
// CORS
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
$isim = trim($data["isim"]);
$bolumler = $data["bolumler"];

try {
    $conn->beginTransaction();

    // sinif tablosuna ekle
    $stmt = $conn->prepare("INSERT INTO sinif (isim) VALUES (:isim) RETURNING id");
    $stmt->execute(['isim' => $isim]);
    $sinifId = $stmt->fetchColumn();

    // bolum isimlerini almak için ID'leri sorgula
    $placeholders = implode(",", array_fill(0, count($bolumler), "?"));
    $bolumQuery = $conn->prepare("SELECT id, isim FROM bolum WHERE id IN ($placeholders)");
    $bolumQuery->execute($bolumler);
    $bolumData = $bolumQuery->fetchAll(PDO::FETCH_ASSOC);

    // id => isim eşlemesi oluştur
    $bolumMap = [];
    foreach ($bolumData as $b) {
        $bolumMap[$b['id']] = $b['isim'];
    }

    // sinif_bolum tablosuna ekle
    $stmt2 = $conn->prepare("INSERT INTO sinif_bolum (sinif_id, bolum_id, sinif_isim, bolum_isim)
                             VALUES (:sinif_id, :bolum_id, :sinif_isim, :bolum_isim)");

    foreach ($bolumler as $bolumId) {
        $stmt2->execute([
            'sinif_id' => $sinifId,
            'bolum_id' => $bolumId,
            'sinif_isim' => $isim,
            'bolum_isim' => $bolumMap[$bolumId] ?? ""
        ]);
    }

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
