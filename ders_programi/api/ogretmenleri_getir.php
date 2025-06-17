<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

$ders_id = $_GET['ders_id'] ?? null;
$bolum_id = $_GET['bolum_id'] ?? null;

if (!$ders_id || !$bolum_id) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT ob.id, CONCAT(ob.isim, ' ', ob.soyisim) AS ad_soyad
        FROM ogr_ders od
        INNER JOIN ogr_bolum ob ON od.ogr_id = ob.id
        WHERE od.ders_id = ? AND ob.bolum_id = ?
    ");
    $stmt->execute([$ders_id, $bolum_id]);
    $ogretmenler = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($ogretmenler);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Öğretmenler alınamadı", "details" => $e->getMessage()]);
}
?>
