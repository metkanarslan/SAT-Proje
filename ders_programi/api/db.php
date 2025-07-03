<?php
$host = "localhost";
$dbname = "proje";
$user = "postgres";
$password = "12345678";

try {
    $conn = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Veritabanı bağlantı hatası",
        "details" => $e->getMessage()
    ]);
    exit;
}
?>
