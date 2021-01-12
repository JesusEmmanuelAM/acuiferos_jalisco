<?php


include("../conexion.php");
#ini_set('display_errors', 1);
#ini_set('display_startup_errors', 1);
#error_reporting(E_ALL);

$headers = json_decode(file_get_contents('php://input'), true);
$cve_acuifero = $headers['cve_acuifero'];

$data =  array ();
$contador = 0;

$info_acuifero = $mysqli->query("SELECT DISTINCT titular FROM conagua_concesionarios WHERE clave_acuifero = '$cve_acuifero' ");

while($row = $info_acuifero->fetch_assoc()) {

    array_push($data, $row["titular"]);
    //$data[$contador]['titular'] = $row["titular"];
    //$contador ++;
    /*
    $data[$contador]['acuifero_titulo']    = $row["acuifero_titulo"];
    $data[$contador]['titulo']             = $row["titulo"];
    $data[$contador]['titular']            = $row["titular"];
    $data[$contador]['fecha_registro']     = $row["fecha_registro"];
    $data[$contador]['municipio']          = $row["municipio"];
    $data[$contador]['region_hidrologica'] = $row["region_hidrologica"];
    $data[$contador]['latitud']            = $row["latitud"];
    $data[$contador]['longitud']           = $row["longitud"];
    $data[$contador]['informacion']        = $row["informacion"];
    $data[$contador]['referencias']        = $row["referencias"];
    
    $contador ++;
    */
}


//$data[$contador]['titular'] = $row["titular"];


echo json_encode($data);
