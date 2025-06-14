<?php
// db.php

$host = "localhost";
$port = "5432";
$dbname = "proje";          // veritabanı ismini değiştir
$user = "postgres";          // PostgreSQL kullanıcı adı
$password = "12345678"; // şifren

$conn = pg_connect("host=" . $host . " port=" . $port . " dbname=" . $dbname . " user=" . $user . " password=" . $password);


if (!$conn) {
    echo json_encode(["success" => false, "message" => "Veritabanına bağlanılamadı."]);
    exit;
}
?>
