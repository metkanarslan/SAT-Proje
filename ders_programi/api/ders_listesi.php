<?php
require_once "db.php";
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$query = "SELECT id, isim FROM ders ORDER BY isim ASC";
$stmt = $conn->prepare($query);
$stmt->execute();

$dersler = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($dersler);
?>
