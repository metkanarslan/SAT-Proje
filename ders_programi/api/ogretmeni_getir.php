<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

// POST verisini al
$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;

if (!$id) {
    echo json_encode(["error" => "ID eksik."]);
    exit;
}

$query1 = $conn->prepare("SELECT * FROM ogretmen WHERE id = ?");
$query1->execute([$id]);
$teacher = $query1->fetch(PDO::FETCH_ASSOC);

$query2 = $conn->prepare("SELECT bolum_id AS id FROM ogr_bolum WHERE ogr_id = ?");
$query2->execute([$id]);
$bolumler = $query2->fetchAll(PDO::FETCH_ASSOC);

$query3 = $conn->prepare("SELECT ders_id AS id FROM ogr_ders WHERE ogr_id = ?");
$query3->execute([$id]);
$dersler = $query3->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
  "ogretmen" => $teacher,
  "bolumler" => $bolumler,
  "dersler" => $dersler,
]);
?>
