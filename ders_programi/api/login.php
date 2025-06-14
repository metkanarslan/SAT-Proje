<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("db.php");

$email = $_POST["email"] ?? null;
$password = $_POST["password"] ?? null;

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Eksik veri"]);
    exit;
}

$sql = "SELECT * FROM kullanici WHERE e_posta = $1 AND sifre = $2";
$result = pg_query_params($conn, $sql, [$email, $password]);

if ($result && pg_num_rows($result) > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Eşleşme bulunamadı"]);
}
