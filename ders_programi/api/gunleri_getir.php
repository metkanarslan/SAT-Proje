<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
  ["id" => 1, "isim" => "Pazartesi"],
  ["id" => 2, "isim" => "Salı"],
  ["id" => 3, "isim" => "Çarşamba"],
  ["id" => 4, "isim" => "Perşembe"],
  ["id" => 5, "isim" => "Cuma"]
]);
?>
