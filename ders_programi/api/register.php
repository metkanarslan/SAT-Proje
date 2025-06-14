<?php
// api/register.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$password = $data['password'];

// Email kontrolü
$check = pg_query_params($conn, "SELECT * FROM users WHERE email = $1", [$email]);
if (pg_num_rows($check) > 0) {
    echo json_encode(["success" => false, "message" => "Email zaten kayıtlı."]);
    exit;
}

// Şifreyi hashle
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Kayıt
$result = pg_query_params($conn, "INSERT INTO users (email, password) VALUES ($1, $2)", [$email, $hashedPassword]);

if ($result) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Kayıt başarısız."]);
}
?>
