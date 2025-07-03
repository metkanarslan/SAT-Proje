<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

try {
    $query = "SELECT 
            s.id AS sinif_id,
            s.isim AS sinif_isim,
            array_agg(sb.bolum_id) AS bolum_idler
        FROM sinif s
        JOIN sinif_bolum sb ON s.id = sb.sinif_id
        GROUP BY s.id, s.isim
        ORDER BY s.isim";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $siniflar = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($siniflar);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Veri çekilirken hata oluştu", "detay" => $e->getMessage()]);
}
?>
