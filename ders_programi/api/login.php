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

try {
    $sql = "SELECT * FROM kullanici WHERE e_posta = :email";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $dbPassword = $user["sifre"];

        if (password_verify($password, $dbPassword)) {
            echo json_encode(["success" => true]);
            exit;
        }

        if ($password === $dbPassword) {
            echo json_encode(["success" => true]);
            exit;
        }

        echo json_encode(["success" => false, "message" => "Şifre yanlış"]);
    } else {
        echo json_encode(["success" => false, "message" => "Kullanıcı bulunamadı"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Veritabanı hatası: " . $e->getMessage()]);
}
