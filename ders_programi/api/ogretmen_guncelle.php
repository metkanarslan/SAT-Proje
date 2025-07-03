<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$isim = trim($data['isim']);
$soyisim = trim($data['soyisim']);
$e_posta = trim($data['e_posta']);
$tel_no = trim($data['tel_no']);
$bolumler = $data['bolumler'];
$dersler = $data['dersler'];

if (empty($isim) || empty($soyisim) || !filter_var($e_posta, FILTER_VALIDATE_EMAIL) || strlen($tel_no) != 11 || empty($bolumler) || empty($dersler)) {
    echo json_encode(["message" => "Tüm alanlar doğru şekilde doldurulmalıdır.", "success" => false]);
    exit;
}

try {
    $conn->beginTransaction();

    // 1. Öğretmeni güncelle
    $updateOgretmen = $conn->prepare("UPDATE ogretmen SET isim = ?, soyisim = ?, e_posta = ?, tel_no = ? WHERE id = ?");
    $updateOgretmen->execute([$isim, $soyisim, $e_posta, $tel_no, $id]);

    // 2. Aktif olduğu ders-program eşleşmelerini kontrol et
    $stmt = $conn->prepare("SELECT dp.bolum_id, dp.ders_id, b.isim AS bolum_adi, d.isim AS ders_adi
                            FROM ders_programi dp
                            JOIN bolum b ON dp.bolum_id = b.id
                            JOIN ders d ON dp.ders_id = d.id
                            WHERE dp.ogretmen_id = ?");
    $stmt->execute([$id]);
    $aktif = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $uyumsuz = [];
    foreach ($aktif as $row) {
        $bolum_id = $row['bolum_id'];
        $ders_id = $row['ders_id'];
        if (!in_array($bolum_id, $bolumler) || !in_array($ders_id, $dersler)) {
            $uyumsuz[] = "- " . $row['bolum_adi'] . " bölümünde " . $row['ders_adi'];
        }
    }

    if (!empty($uyumsuz)) {
        $mesaj = implode("\n", $uyumsuz);
        echo json_encode([
            "success" => false,
            "message" => "Bu öğretmen aşağıdaki programlarda görevli:\n$mesaj\nLütfen önce programı düzenleyiniz."
        ]);
        $conn->rollBack();
        exit;
    }

    // 3. Eski bölümleri ve dersleri sil
    $conn->prepare("DELETE FROM ogr_bolum WHERE ogr_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM ogr_ders WHERE ogr_id = ?")->execute([$id]);

    // 4. Öğretmenin isim bilgileri tekrar alınır
    $ogretmen_query = $conn->prepare("SELECT isim, soyisim FROM ogretmen WHERE id = ?");
    $ogretmen_query->execute([$id]);
    $ogretmen = $ogretmen_query->fetch(PDO::FETCH_ASSOC);
    $ogretmen_isim = $ogretmen['isim'];
    $ogretmen_soyisim = $ogretmen['soyisim'];

    // 5. Yeni bölümleri ekle
    $insertBolum = $conn->prepare("INSERT INTO ogr_bolum (ogr_id, bolum_id, bolum_isim, isim, soyisim) VALUES (?, ?, ?, ?, ?)");
    foreach ($bolumler as $bolum_id) {
        $bolum_query = $conn->prepare("SELECT isim FROM bolum WHERE id = ?");
        $bolum_query->execute([$bolum_id]);
        $bolum_isim = $bolum_query->fetchColumn();
        $insertBolum->execute([$id, $bolum_id, $bolum_isim, $ogretmen_isim, $ogretmen_soyisim]);
    }

    // 6. Yeni dersleri ekle
    $insertDers = $conn->prepare("INSERT INTO ogr_ders (isim, soyisim, ders_isim, ogr_id, ders_id) VALUES (?, ?, ?, ?, ?)");
    foreach ($dersler as $ders_id) {
        $ders_query = $conn->prepare("SELECT isim FROM ders WHERE id = ?");
        $ders_query->execute([$ders_id]);
        $ders_isim = $ders_query->fetchColumn();
        $insertDers->execute([$ogretmen_isim, $ogretmen_soyisim, $ders_isim, $id, $ders_id]);
    }

    $conn->commit();
    echo json_encode(["message" => "Öğretmen başarıyla güncellendi.", "success" => true]);

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["message" => "Bir hata oluştu: " . $e->getMessage(), "success" => false]);
}
?>
