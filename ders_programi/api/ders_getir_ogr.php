<?php
require_once "db.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);
$bolum_ids = $data["bolum_ids"] ?? [];

if (count($bolum_ids) === 0) {
    echo json_encode([]);
    exit;
}

$placeholders = implode(',', array_fill(0, count($bolum_ids), '?'));

$query = "
    SELECT DISTINCT d.id, d.isim
    FROM ders d
    JOIN ders_bolum db ON d.id = db.ders_id
    WHERE db.bolum_id IN ($placeholders)
";

$stmt = $conn->prepare($query);
$stmt->execute($bolum_ids);
$dersler = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($dersler);
?>
