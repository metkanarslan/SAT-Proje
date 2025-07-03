<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$bolum_id = $data['bolum_id'];
$program = $data['program'];

$errors = [];

try {
    $conn->beginTransaction();

    // 1. Tüm çakışmaları kontrol et
    foreach ($program as $key => $entry) {
        $parts = explode("_", $key);
        $gun_id = intval($parts[0]);
        $saat_id = intval($parts[1]);
        $ders_id = intval($entry['ders_id'] ?? 0);
        $ogretmen_id = intval($entry['ogretmen_id'] ?? 0);
        $sinif_id = intval($entry['sinif_id'] ?? 0);

        if (!$ders_id || !$ogretmen_id || !$sinif_id) continue;

        // Öğretmen çakışması
        $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE gun_id = ? AND saat_id = ? AND ogretmen_id = ? AND bolum_id != ?");
        $stmt->execute([$gun_id, $saat_id, $ogretmen_id, $bolum_id]);
        if ($stmt->fetchColumn() > 0) {
            $errors[] = "Hoca çakışması: {$gun_id}. gün {$saat_id}. saatte öğretmen başka derste.";
        }

        // Sınıf çakışması
        $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE gun_id = ? AND saat_id = ? AND sinif_id = ? AND bolum_id != ?");
        $stmt->execute([$gun_id, $saat_id, $sinif_id, $bolum_id]);
        if ($stmt->fetchColumn() > 0) {
            $errors[] = "Sınıf çakışması: {$gun_id}. gün {$saat_id}. saatte sınıf dolu.";
        }
    }

    if (count($errors) > 0) {
        $conn->rollBack();
        echo json_encode([
            "success" => false,
            "errors" => $errors
        ]);
        exit;
    }

    // 2. Eski programı sil
    $conn->prepare("DELETE FROM ders_programi WHERE bolum_id = ?")->execute([$bolum_id]);

    // 3. Yeni programı ekle
    foreach ($program as $key => $entry) {
        $parts = explode("_", $key);
        $gun_id = intval($parts[0]);
        $saat_id = intval($parts[1]);
        $ders_id = intval($entry['ders_id'] ?? 0);
        $ogretmen_id = intval($entry['ogretmen_id'] ?? 0);
        $sinif_id = intval($entry['sinif_id'] ?? 0);

        if (!$ders_id || !$ogretmen_id || !$sinif_id) continue;

        $stmt = $conn->prepare("
            INSERT INTO ders_programi (ders_id, ogretmen_id, sinif_id, gun_id, saat_id, bolum_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$ders_id, $ogretmen_id, $sinif_id, $gun_id, $saat_id, $bolum_id]);
    }

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Sunucu hatası: " . $e->getMessage()
    ]);
}
?>
