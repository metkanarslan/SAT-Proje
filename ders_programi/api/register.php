<?php
header("Access-Control-Allow-Origin: *"); // geçici, test için
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "db.php";

if (!isset($conn) || !($conn instanceof PDO)) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı bağlantısı başarısız.']);
    exit;
}

$isim          = $_POST['name'] ?? '';
$soyisim       = $_POST['surname'] ?? '';
$kullanici_adi = $_POST['username'] ?? '';
$sifre         = $_POST['password'] ?? '';
$eposta        = $_POST['email'] ?? '';
$telefon       = $_POST['phone'] ?? '';

if (
    empty($isim) || empty($soyisim) || empty($kullanici_adi) ||
    empty($sifre) || empty($eposta) || empty($telefon)
) {
    echo json_encode(['success' => false, 'message' => 'Tüm alanlar doldurulmalıdır.']);
    exit;
}

$hashedPassword = password_hash($sifre, PASSWORD_DEFAULT);

try {
    $sql = "INSERT INTO kullanici (kullanici_adi, sifre, e_posta, tel_no, isim, soyisim)
            VALUES (:kullanici_adi, :sifre, :e_posta, :tel_no, :isim, :soyisim)";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':kullanici_adi' => $kullanici_adi,
        ':sifre'         => $hashedPassword,
        ':e_posta'       => $eposta,
        ':tel_no'        => $telefon,
        ':isim'          => $isim,
        ':soyisim'       => $soyisim
    ]);

    echo json_encode(['success' => true, 'message' => 'Kayıt başarılı.']);
    exit;

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı hatası: ' . $e->getMessage()]);
    exit;
}
