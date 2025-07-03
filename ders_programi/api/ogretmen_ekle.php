<?php
require_once "db.php";
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$data = json_decode(file_get_contents("php://input"), true);

$isim = $data["isim"];
$soyisim = $data["soyisim"];
$e_posta = $data["e_posta"];
$tel_no = $data["tel_no"];
$bolumler = $data["bolumler"];
$dersler = $data["dersler"];

try {
    $conn->beginTransaction();

    // ogretmen tablosuna ekle
    $stmt = $conn->prepare("INSERT INTO ogretmen (isim, soyisim, e_posta, tel_no) VALUES (?, ?, ?, ?) RETURNING id");
    $stmt->execute([$isim, $soyisim, $e_posta, $tel_no]);
    $teacherId = $stmt->fetch(PDO::FETCH_ASSOC)["id"];

    // ogr_bolum tablosuna ekle
    foreach ($bolumler as $bolum_id) {
        $stmt = $conn->prepare("SELECT isim FROM bolum WHERE id = ?");
        $stmt->execute([$bolum_id]);
        $bolum_isim = $stmt->fetch(PDO::FETCH_ASSOC)["isim"];

        $stmt = $conn->prepare("INSERT INTO ogr_bolum (isim, soyisim, ogr_id, bolum_isim, bolum_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$isim, $soyisim, $teacherId, $bolum_isim, $bolum_id]);
    }

    // ogr_ders tablosuna ekle
    foreach ($dersler as $ders_id) {
        $stmt = $conn->prepare("SELECT isim FROM ders WHERE id = ?");
        $stmt->execute([$ders_id]);
        $ders_isim = $stmt->fetch(PDO::FETCH_ASSOC)["isim"];

        $stmt = $conn->prepare("INSERT INTO ogr_ders (isim, soyisim, ogr_id, ders_isim, ders_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$isim, $soyisim, $teacherId, $ders_isim, $ders_id]);
    }

    $conn->commit();
    echo json_encode(["message" => "Öğretmen başarıyla eklendi!"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => "Hata oluştu: " . $e->getMessage()]);
}
?>
