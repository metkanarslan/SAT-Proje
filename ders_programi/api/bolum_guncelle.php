<?php
require_once "db.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;
$isim = trim($data["isim"] ?? "");
$ogretmenler = $data["ogretmenler"] ?? [];
$dersler = $data["dersler"] ?? [];
$siniflar = $data["siniflar"] ?? [];

if (!$id || $isim === "") {
    echo json_encode(["success" => false, "message" => "Geçersiz giriş."]);
    exit;
}

try {
    $conn->beginTransaction();

    // Eski verileri al
    $oldTeachers = $conn->prepare("SELECT ogr_id, isim, soyisim FROM ogr_bolum WHERE bolum_id = ?");
    $oldTeachers->execute([$id]);
    $oldTeachers = $oldTeachers->fetchAll(PDO::FETCH_ASSOC);

    $oldCourses = $conn->prepare("SELECT ders_id, ders_isim FROM ders_bolum WHERE bolum_id = ?");
    $oldCourses->execute([$id]);
    $oldCourses = $oldCourses->fetchAll(PDO::FETCH_ASSOC);

    $oldClasses = $conn->prepare("SELECT sinif_id, sinif_isim FROM sinif_bolum WHERE bolum_id = ?");
    $oldClasses->execute([$id]);
    $oldClasses = $oldClasses->fetchAll(PDO::FETCH_ASSOC);

    // Kaldırılmak istenenler
    $removedTeachers = array_filter($oldTeachers, fn($t) => !in_array($t['ogr_id'], $ogretmenler));
    $removedCourses = array_filter($oldCourses, fn($d) => !in_array($d['ders_id'], $dersler));
    $removedClasses = array_filter($oldClasses, fn($s) => !in_array($s['sinif_id'], $siniflar));

    $blockedTeachers = [];
    $blockedCourses = [];
    $blockedClasses = [];

    // Kontroller
    foreach ($removedTeachers as $t) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE ogretmen_id = ? AND bolum_id = ?");
    $stmt->execute([$t['ogr_id'], $id]);
    if ($stmt->fetchColumn() > 0) {
        $blockedTeachers[] = $t['isim'] . ' ' . $t['soyisim'];
    }
}

    foreach ($removedCourses as $d) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE ders_id = ? AND bolum_id = ?");
    $stmt->execute([$d['ders_id'], $id]);
    if ($stmt->fetchColumn() > 0) {
        $blockedCourses[] = $d['ders_isim'];
    }
}

foreach ($removedClasses as $s) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE sinif_id = ? AND bolum_id = ?");
    $stmt->execute([$s['sinif_id'], $id]);
    if ($stmt->fetchColumn() > 0) {
        $blockedClasses[] = $s['sinif_isim'];
    }
}

    // Engellenen bir şey varsa alert için uygun formatta mesaj oluştur
    if (!empty($blockedTeachers) || !empty($blockedCourses) || !empty($blockedClasses)) {
        $message = "Aşağıdaki ögeler bu bölümün programında kullanılmaktadır. Lütfen önce programı düzenleyiniz:\n\n";

        if (!empty($blockedTeachers)) {
            $message .= "• Öğretmen(ler): " . implode(', ', $blockedTeachers) . "\n";
        }

        if (!empty($blockedCourses)) {
            $message .= "• Ders(ler): " . implode(', ', $blockedCourses) . "\n";
        }

        if (!empty($blockedClasses)) {
            $message .= "• Sınıf(lar): " . implode(', ', $blockedClasses) . "\n";
        }

        echo json_encode(["success" => false, "message" => $message]);
        $conn->rollBack();
        exit;
    }

    // Güncelleme işlemleri
    $stmt = $conn->prepare("UPDATE bolum SET isim = ? WHERE id = ?");
    $stmt->execute([$isim, $id]);

    $conn->prepare("DELETE FROM ogr_bolum WHERE bolum_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM ders_bolum WHERE bolum_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM sinif_bolum WHERE bolum_id = ?")->execute([$id]);

    if (!empty($ogretmenler)) {
        $stmt = $conn->prepare("SELECT id, isim, soyisim FROM ogretmen WHERE id IN (" . implode(",", array_fill(0, count($ogretmenler), "?")) . ")");
        $stmt->execute($ogretmenler);
        $veriler = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $insert = $conn->prepare("INSERT INTO ogr_bolum (isim, soyisim, ogr_id, bolum_isim, bolum_id) VALUES (?, ?, ?, ?, ?)");
        foreach ($veriler as $o) {
            $insert->execute([$o['isim'], $o['soyisim'], $o['id'], $isim, $id]);
        }
    }

    if (!empty($dersler)) {
        $stmt = $conn->prepare("SELECT id, isim FROM ders WHERE id IN (" . implode(",", array_fill(0, count($dersler), "?")) . ")");
        $stmt->execute($dersler);
        $veriler = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $insert = $conn->prepare("INSERT INTO ders_bolum (ders_isim, bolum_isim, ders_id, bolum_id) VALUES (?, ?, ?, ?)");
        foreach ($veriler as $d) {
            $insert->execute([$d['isim'], $isim, $d['id'], $id]);
        }
    }

    if (!empty($siniflar)) {
        $stmt = $conn->prepare("SELECT id, isim FROM sinif WHERE id IN (" . implode(",", array_fill(0, count($siniflar), "?")) . ")");
        $stmt->execute($siniflar);
        $veriler = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $insert = $conn->prepare("INSERT INTO sinif_bolum (sinif_isim, bolum_isim, sinif_id, bolum_id) VALUES (?, ?, ?, ?)");
        foreach ($veriler as $s) {
            $insert->execute([$s['isim'], $isim, $s['id'], $id]);
        }
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Bölüm başarıyla güncellendi."]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Hata oluştu.", "error" => $e->getMessage()]);
}
?>
