<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once "db.php";

$bolum_id = $_GET['bolum_id'] ?? null;

if (!$bolum_id) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT gun_id, saat_id, ders_id, ogretmen_id, sinif_id
        FROM ders_programi
        WHERE bolum_id = ?
    ");
    $stmt->execute([$bolum_id]);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $key = $row['gun_id'] . '_' . $row['saat_id'];
        $result[$key] = [
            'ders_id' => $row['ders_id'],
            'ogretmen_id' => $row['ogretmen_id'],
            'sinif_id' => $row['sinif_id']
        ];
    }

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
