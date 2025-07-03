<?php
require_once "db.php";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$query = "SELECT id, isim FROM sinif ORDER BY isim ASC";
$stmt = $conn->prepare($query);
$stmt->execute();

$siniflar = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($siniflar);
