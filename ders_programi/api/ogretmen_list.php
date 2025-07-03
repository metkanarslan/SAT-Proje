<?php
require_once "db.php";
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$query = "SELECT id, isim, soyisim, e_posta, tel_no FROM ogretmen ORDER BY isim ASC";
$stmt = $conn->prepare($query);
$stmt->execute();

$ogretmenler = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($ogretmenler);
?>
