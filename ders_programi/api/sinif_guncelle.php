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
$id = $data["id"];
$isim = trim($data["isim"]);
$bolumler = $data["bolumler"]; // yeni seçilen bölümler (array)

try {
    $conn->beginTransaction();

    // 1. Şu an sınıfa bağlı olan eski bölümleri getir
    $stmt = $conn->prepare("SELECT bolum_id FROM sinif_bolum WHERE sinif_id = :id");
    $stmt->execute(['id' => $id]);
    $eskiBolumler = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // 2. Kaldırılmak istenen bölümleri bul (eski - yeni)
    $kaldirilacakBolumler = array_diff($eskiBolumler, $bolumler);

    // 3. Bu sınıfın kaldırılmak istenen bölümlerle `ders_programi` tablosunda kullanılıp kullanılmadığını kontrol et
    if (!empty($kaldirilacakBolumler)) {
        $placeholders = implode(',', array_fill(0, count($kaldirilacakBolumler), '?'));
        $params = array_merge([$id], array_values($kaldirilacakBolumler));

        $checkStmt = $conn->prepare("
            SELECT DISTINCT b.isim
            FROM ders_programi dp
            JOIN bolum b ON dp.bolum_id = b.id
            WHERE dp.sinif_id = ? AND dp.bolum_id IN ($placeholders)
        ");
        $checkStmt->execute($params);
        $usedBolumler = $checkStmt->fetchAll(PDO::FETCH_COLUMN);

        if (!empty($usedBolumler)) {
            $conn->rollBack();
            $bolumListesi = implode(", ", $usedBolumler);
            echo json_encode([
                "success" => false,
                "message" => "Bu sınıf şu bölümlerde aktif kullanımda: $bolumListesi. Lütfen önce programı düzenleyiniz."
            ]);
            exit;
        }
    }

    // 4. Sınıf ismini güncelle
    $stmt = $conn->prepare("UPDATE sinif SET isim = :isim WHERE id = :id");
    $stmt->execute(['isim' => $isim, 'id' => $id]);

    // 5. Tüm eski ilişkileri sil
    $stmt = $conn->prepare("DELETE FROM sinif_bolum WHERE sinif_id = :id");
    $stmt->execute(['id' => $id]);

    // 6. Bölüm isimlerini getir ve yeniden ekle
    if (!empty($bolumler)) {
        $placeholder = implode(",", array_fill(0, count($bolumler), "?"));
        $stmtBolum = $conn->prepare("SELECT id, isim FROM bolum WHERE id IN ($placeholder)");
        $stmtBolum->execute($bolumler);

        $bolumMap = [];
        foreach ($stmtBolum->fetchAll(PDO::FETCH_ASSOC) as $b) {
            $bolumMap[$b["id"]] = $b["isim"];
        }

        $stmt2 = $conn->prepare("INSERT INTO sinif_bolum (sinif_id, bolum_id, sinif_isim, bolum_isim)
                                 VALUES (:sinif_id, :bolum_id, :sinif_isim, :bolum_isim)");

        foreach ($bolumler as $bolumId) {
            $stmt2->execute([
                'sinif_id' => $id,
                'bolum_id' => $bolumId,
                'sinif_isim' => $isim,
                'bolum_isim' => $bolumMap[$bolumId] ?? ""
            ]);
        }
    }

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
