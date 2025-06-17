<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Hazır test verisi
echo json_encode([
  ["id" => 1, "isim" => "Bilgisayar Programcılığı"],
  ["id" => 2, "isim" => "Elektrik-Elektronik Mühendisliği"]
]);
?>
