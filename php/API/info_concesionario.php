<?php


include("../conexion.php");
//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$headers = json_decode(file_get_contents('php://input'), true);
$valor_select = $headers['valor_select'];
$clave_acuifero = $headers['clave_acuifero'];

$data =  array ();
$contador = 0;
$clave_acuifero;

if ($valor_select != 'vol_pendiente') {
 
    $info_acuifero = $mysqli->query("SELECT  * FROM conagua_concesionarios WHERE titular = '$valor_select' LIMIT 1 ");
    while($row = $info_acuifero->fetch_assoc()) {
        $data[0]['acuifero_titulo']    = $row["acuifero_titulo"];
        $data[0]['titulo']             = $row["titulo"];
        $data[0]['titular']            = $row["titular"];
        $data[0]['fecha_registro']     = $row["fecha_registro"];
        $data[0]['volumen_extraccion'] = $row["volumen_extraccion"];
        $data[0]['municipio']          = $row["municipio"];
        $data[0]['region_hidrologica'] = $row["region_hidrologica"];
        $data[0]['informacion']        = $row["informacion"];
        $data[0]['referencias']        = $row["referencias"];
    }
    $data[0]['otro'] = false;
}else{
    $data[0]['otro'] = true;
}

$vol_acuifero = $mysqli->query("SELECT recarga_total, registro_pendiente FROM conagua_acuiferos WHERE clave_acuifero = '$clave_acuifero' ");

while($vol = $vol_acuifero->fetch_assoc()) {
    $data[0]['vol_acuifero']     = $vol["recarga_total"];
    $data[0]['vol_pendiente']    = $vol["registro_pendiente"];

    
}



$pila = array();


$query  = "SELECT latitud, longitud FROM conagua_concesionarios WHERE titular = '$valor_select' ";
$coords = $mysqli->query("SELECT latitud, longitud FROM conagua_concesionarios WHERE titular = '$valor_select' ");
while($coords_array = $coords->fetch_assoc()) {

    $latitud = $coords_array["latitud"];
    $longitud = $coords_array["longitud"];

    array_push($pila, "$latitud, $longitud");

}
$data[1]['coords'] = $pila;


echo json_encode($data);
