<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Preflight isteği kontrolü
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

// İstek verisini al
$data = json_decode(file_get_contents("php://input"), true);
$bolum_id = $data['bolum_id'] ?? null;

if (!$bolum_id) {
    echo json_encode(["success" => false, "message" => "Bölüm ID eksik."]);
    exit;
}

try {
    // Gün, saat ve sınıf listesi
    $gunler = $conn->query("SELECT id FROM gunler")->fetchAll(PDO::FETCH_COLUMN);
    $saatler = $conn->query("SELECT id FROM saat")->fetchAll(PDO::FETCH_COLUMN);

    $stmt = $conn->prepare("
        SELECT d.id AS ders_id, o.ogr_id as ogretmen_id
        FROM ogr_ders o
        JOIN ders d ON o.ders_id = d.id
        WHERE d.id IN (SELECT ders_id FROM ders_bolum WHERE bolum_id = ?)
    ");
    $stmt->execute([$bolum_id]);
    $ders_ogretmen_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ders -> öğretmen eşlemesi
    $ders_ogretmen_map = [];
    foreach ($ders_ogretmen_raw as $row) {
        $ders_ogretmen_map[$row['ders_id']][] = $row['ogretmen_id'];
    }

    // Sınıfları getir
    $stmt = $conn->prepare("SELECT id FROM sinif WHERE id IN (SELECT sinif_id FROM sinif_bolum WHERE bolum_id = ?)");
    $stmt->execute([$bolum_id]);
    $sinif_listesi = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $program = [];

    foreach ($ders_ogretmen_map as $ders_id => $ogretmenler) {
        $yerlestirildi = false;

        shuffle($ogretmenler);      // Her ders için öğretmenler karıştır
        shuffle($gunler);
        shuffle($saatler);
        shuffle($sinif_listesi);

        foreach ($ogretmenler as $ogretmen_id) {
            foreach ($gunler as $gun_id) {
                foreach ($saatler as $saat_id) {
                    // Aynı saatte bu öğretmenin başka dersi var mı?
                    $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE gun_id = ? AND saat_id = ? AND ogretmen_id = ?");
                    $stmt->execute([$gun_id, $saat_id, $ogretmen_id]);
                    if ($stmt->fetchColumn() > 0) continue;

                    // Sınıf çakışması kontrolü
                    foreach ($sinif_listesi as $sinif_id) {
                        $stmt = $conn->prepare("SELECT COUNT(*) FROM ders_programi WHERE gun_id = ? AND saat_id = ? AND sinif_id = ?");
                        $stmt->execute([$gun_id, $saat_id, $sinif_id]);
                        if ($stmt->fetchColumn() == 0) {
                            $key = "{$gun_id}_{$saat_id}";
                            $program[$key] = [
                                "ders_id" => $ders_id,
                                "ogretmen_id" => $ogretmen_id,
                                "sinif_id" => $sinif_id
                            ];
                            $yerlestirildi = true;
                            break 3; // Dersi başarıyla yerleştirdik
                        }
                    }
                }
            }
        }

        if (!$yerlestirildi) {
            echo json_encode([
                "success" => false,
                "message" => "Tüm dersler yerleştirilemedi. Eksik olan ders ID: $ders_id"
            ]);
            exit;
        }
    }

    echo json_encode([
        "success" => true,
        "program" => $program
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Sunucu hatası: " . $e->getMessage()
    ]);
}
?>
