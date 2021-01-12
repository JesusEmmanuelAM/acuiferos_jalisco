<?php


include("../conexion.php");
#ini_set('display_errors', 1);
#ini_set('display_startup_errors', 1);
#error_reporting(E_ALL);

$headers = json_decode(file_get_contents('php://input'), true);
$cve_acuifero = $headers['cve_acuifero'];

$data =  array ();
$contador = 0;


$info_acuifero = $mysqli->query("SELECT * FROM conagua_acuiferos WHERE clave_acuifero = '$cve_acuifero' ");

while($row = $info_acuifero->fetch_assoc()) {

    $data['clave_acuifero'] = $row["clave_acuifero"];
    $data['nombre_acuifero'] = $row["nombre_acuifero"];
    $data['region_hidrologico_administrativa'] = $row["region_hidrologico_administrativa"];
    $data['recarga_total'] = $row["recarga_total"];
    $data['registro_pendiente'] = $row["registro_pendiente"];

}



$num_conce = $mysqli->query("SELECT COUNT(distinct titular) as concesionarios FROM conagua_concesionarios WHERE clave_acuifero = '$cve_acuifero' ");

while($row = $num_conce->fetch_assoc()) {

    $data['concesionarios_totales'] = $row["concesionarios"];
    
}
    


echo json_encode($data);
