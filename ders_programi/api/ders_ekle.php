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

$isim = trim($data["isim"] ?? "");
$bolumler = $data["bolumler"] ?? [];
$ogretmenler = $data["ogretmenler"] ?? [];

if ($isim === "") {
    http_response_code(400);
    echo json_encode(["error" => "Ders ismi boş bırakılamaz."]);
    exit;
}

if (!is_array($bolumler) || count($bolumler) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "En az bir bölüm seçilmelidir."]);
    exit;
}

try {
    // Aynı isimde ders tüm sistemde var mı kontrol et (isteğe bağlı kısıt)
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM ders WHERE isim = :isim");
    $checkStmt->execute([":isim" => $isim]);
    $count = $checkStmt->fetchColumn();

    if ($count > 0) {
        http_response_code(400);
        echo json_encode(["error" => "Bu isimde bir ders zaten mevcut."]);
        exit;
    }

    // Benzersiz ders kodu üret
    do {
        $kod = strtoupper(substr(str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, 5));
        $kodKontrol = $conn->prepare("SELECT COUNT(*) FROM ders WHERE ders_kodu = :kod");
        $kodKontrol->execute([":kod" => $kod]);
        $kodVarMi = $kodKontrol->fetchColumn();
    } while ($kodVarMi > 0);

    // Tek bir kez ders tablosuna ekle
    $insertDers = $conn->prepare("INSERT INTO ders (isim, ders_kodu) VALUES (:isim, :kod)");
    $insertDers->execute([
        ":isim" => $isim,
        ":kod" => $kod
    ]);

    $dersId = $conn->lastInsertId();

    // ders_bolum tablosuna çoklu ekleme
    $insertDersBolum = $conn->prepare("INSERT INTO ders_bolum (ders_id, bolum_id, ders_isim, bolum_isim) 
                                       VALUES (:ders_id, :bolum_id, :ders_isim, :bolum_isim)");

    foreach ($bolumler as $bolum_id) {
        // bölüm ismini al
        $bolumFetch = $conn->prepare("SELECT isim FROM bolum WHERE id = :id");
        $bolumFetch->execute([":id" => $bolum_id]);
        $bolum = $bolumFetch->fetch(PDO::FETCH_ASSOC);

        $insertDersBolum->execute([
            ":ders_id" => $dersId,
            ":bolum_id" => $bolum_id,
            ":ders_isim" => $isim,
            ":bolum_isim" => $bolum["isim"]
        ]);
    }

    // ogr_ders ekleme (isteğe bağlı)
    $insertOgrDers = $conn->prepare("INSERT INTO ogr_ders (isim, soyisim, ders_isim, ogr_id, ders_id) 
                                     VALUES (:isim, :soyisim, :ders_isim, :ogr_id, :ders_id)");

    foreach ($ogretmenler as $ogretmen_id) {
        $getOgr = $conn->prepare("SELECT isim, soyisim FROM ogretmen WHERE id = :id");
        $getOgr->execute([":id" => $ogretmen_id]);
        $ogr = $getOgr->fetch(PDO::FETCH_ASSOC);

        $insertOgrDers->execute([
            ":isim" => $ogr["isim"],
            ":soyisim" => $ogr["soyisim"],
            ":ders_isim" => $isim,
            ":ogr_id" => $ogretmen_id,
            ":ders_id" => $dersId
        ]);
    }

    echo json_encode(["message" => "Ders başarıyla eklendi."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veritabanı hatası.", "detay" => $e->getMessage()]);
}
