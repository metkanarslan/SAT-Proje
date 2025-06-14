<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php"; // Veritabanı bağlantısı

$query = "SELECT id, isim FROM bolum";
$result = pg_query($conn, $query);

$bolumler = [];

if ($result) {
    while ($row = pg_fetch_assoc($result)) {
        $bolumler[] = $row;
    }
    echo json_encode($bolumler);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Veri çekilirken hata oluştu."]);
}

pg_close($conn);
?>
