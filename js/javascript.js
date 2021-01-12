const map_provider = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
//document.cookie = 'cross-site-cookie=bar; SameSite=Lax; Secure';

$("#contenedor_agua").hide();
//$('#cont_map2').hide();



let titulos = [];
let titulares = [];
let suma_concesionarios = 0;
let agua_total;



$(document).ready(function () {
});



// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([20.649722, -103.179167], 7);

// add an OpenStreetMap tile layer
L.tileLayer(map_provider, {
    maxZoom: 10,
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



var map2 = L.map('map2').setView([20.649722, -103.179167], 12);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map2);
//map2.doubleClickZoom.disable(); 
$('#cont_map2').hide();


var agua_icono = L.icon({
    iconUrl: './media/gota.png',

    iconSize:     [38, 38], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});




//declaramos una instancia del sidebar
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});

//agregamos el sidebar al mapa
map.addControl(sidebar);

//funcion onclik (fuera del mapa)
map.on('click', function () {
    sidebar.hide();
});


//obtener shape y agregarlo al mapa
//var shpfile = new L.Shapefile('shapes/shape_final.zip', {
var shpfile = new L.Shapefile('shapes/acuifero_shape.zip', {
    onEachFeature: function (feature, layer) {

        //convertir los caracteres en latin como:  "Ã?" -> "Ñ" 
        let nombre_acuifero = feature.properties.NOM_ACUI.toString();
        //Para cambiar otros caracteres copia la linea de abajo sin eliminar la anterior
        nombre_acuifero = nombre_acuifero.replace("Ã?", "Ñ");

        //label que sale cuando pasas el mouse por el mapa
        layer.bindLabel(nombre_acuifero, {noHide: true});

        //agregamos una funcion onClick por cada acuifero del shape enviando como parametros la informacion del mismo
        layer.on('click', function (e) { get_info_acuifero(feature, layer); });

        //cuando carga el mapa de nueva cuenta es necesario ocultar los elementos de abajo como el mapa #2
        $('#cont_map2').fadeOut('slow');
        
    }, style: function (feature) {

        //definimos un numero aleatorio 1-4 para colorear el mapa
        let color_random = Math.floor(Math.random() * 4)+1;

        //agregamos un color diferente a cada acuifero del mapa para facilitar la experiencia del usuario
        //son 4 colores y se ingresan de forma aleatoria
        switch (color_random) {
            case 1: return {

                fillColor: '#0277bd',
                weight: 1,
                opacity: 1,
                color: '#fff',  //Outline color
                fillOpacity: 0.8

            };
            case 2: return {

                fillColor: '#0288d1',
                weight: 1,
                opacity: 1,
                color: '#fff',  //Outline color
                fillOpacity: 0.8

            };
            case 3: return {

                fillColor: '#039be5',
                weight: 1,
                opacity: 1,
                color: '#fff',  //Outline color
                fillOpacity: 0.8

            };
            case 4: return {

                fillColor: '#4fc3f7',
                weight: 1,
                opacity: 1,
                color: '#fff',  //Outline color
                fillOpacity: 0.8

            };

        }

    },pointToLayer: function (feature, latlng) {
        //return L.circleMarker(latlng);
        return L.polygonMarker(latlng);
    }
});

//por ultimo añadimos toda la configuracion de arriba a nuestro mapa
shpfile.addTo(map);


var volumen_maximo = 0 ;


function get_info_acuifero(feature, layer_label) {

    let content_sb = '';

    let parametros = {
        "cve_acuifero": feature.properties.CLV_ACUI
    }


    fetch('./php/API/num_concesionarios.php', {
        method: 'POST',
        body: JSON.stringify(parametros)
    })
    .then(
        function (response) {

            if (response.status !== 200) {
                console.log('Error al cargar la información' +
                    response.status);
                return;
            }

            // Si la peticion responde de manera exitosa
            response.json().then(function (data) {
                
                let num_conv = data.registro_pendiente.replace(/\B(?=(\d{3})+(?!\d))/g, ",");    

                content_sb += `     
                <h5 class="text-secondary text-center p-3"> ${data.nombre_acuifero}</h5> 
                <p>
                   <b>Clave:</b> </br> <span class="text-secondary">${data.clave_acuifero}</span>
                </p>
                <p>
                    <b>Región Hidrologico Administrativa:</b> </br> <span class="text-secondary">${data.region_hidrologico_administrativa}</span>
                </p>
                <p>
                    <b>Recarga Total Anual en m3:</b> </br> <span class="text-secondary">${data.recarga_total}</span>
                </p>
                <p>
                    <b >Pendiente de titulación y/o registro en el REPDA:</b> </br> <span class="text-secondary">${num_conv}.0</span>
                </p>`;

                if (data.concesionarios_totales >= 1) {
                    content_sb += `   
                    <div class="col-12 pt-4">
                        <button onclick="get_info_concesionarios(${data.clave_acuifero})" type="button" class="btn btn-azul"> Ver (${data.concesionarios_totales}) Concesionarios Disponibles</button>
                    </div>`;
                }else{
                    content_sb += `   
                    <div class="col-12 ">
                        <p class="txt-naranja text-center txt-medio">
                            *Éste acuifero no cuenta con algunos de los 40 mayores concesionarios registrados ante el REDPA.
                        </p>
                    </div>`;
                }

                document.getElementById("content_sidebar").innerHTML = content_sb;
                sidebar.show();
                $('#info_concs').fadeOut('slow');
                

                let cont_animacion = `
                <i class="text-center text-dark">Agua utilizada  ${data.nombre_acuifero}</i>
                <p class="center-text text-secondary">${data.recarga_total}</p>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" style="display: none;">
                    <symbol id="wave">
                        <path
                            d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z">
                        </path>
                        <path
                            d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z">
                        </path>
                        <path
                            d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z">
                        </path>
                        <path
                            d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z">
                        </path>
                    </symbol>
                </svg>
                <div class="box">
                    <div class="percent">
                    <div class="porcentaje_agua text-center" id="porcentaje_agua">
                        Selecciona </br> un </br> concesionario
                    </div>
                        
                    </div>
                    <div id="water" class="water">
                        <svg viewBox="0 0 560 20" class="water_wave water_wave_back">
                            <use xlink:href="#wave"></use>
                        </svg>
                        <svg viewBox="0 0 560 20" class="water_wave water_wave_front">
                            <use xlink:href="#wave"></use>
                        </svg>
                    </div>
                </div>
                <div id="titulares_totales"></div>`;
                document.getElementById("animacion").innerHTML = cont_animacion;


            });
        }
    )
    .catch(function (err) {
        console.log('Fetch Error ', err);
    });

}



function get_info_concesionarios(cve_acuifero) {

    $("#txt_inf").hide();
    
    agua_total = 0 ;
    titulos = [''];
    titulares = [''];
    suma_concesionarios = 0;

    $("#info_concesionario").hide();
    $("#cont_map2").hide();

    $("html, body").animate({ scrollTop: "700" });


    let parametros = {
        "cve_acuifero": cve_acuifero
    }

    fetch('./php/API/select_concesionarios.php', {
        method: 'POST',
        body: JSON.stringify(parametros)
    })
    .then(
        function (response) {

            if (response.status !== 200) {
                console.log('Error al cargar la información' +
                    response.status);
                return;
            }

            // Si la peticion responde de manera exitosa
            response.json().then(function (data) {

                let select_concesionarios = `<div class="col-12 text-center">
                    <i class="text-secondary p-3 ">Selecciona un Concesionario para obtener más información</i> <br>
                    <div class="input-group mb-3 mt-3">
                        <select class="custom-select" id="sel_concesionario" onchange="get_concesionarios(${cve_acuifero})" > 
                        <option disabled selected>Concesionarios Disponibles</option>`;
                for (var item in data) {
                    // volumen de extracción de agua pendiente de titulación y/o registro en el REPDA (VAPTYR)
                    select_concesionarios += `<option value="${data[item]}">${data[item]}</option>`;
                }
                
                select_concesionarios += `<option value="vol_pendiente">Otros (vol. pendiente de registro en REPDA)</option>`;

                select_concesionarios += `</select>
                    </div>
                </div>`;

                document.getElementById("select_concesionario").innerHTML = select_concesionarios;
            });
        }
    )
    .catch(function (err) {
        console.log('Fetch Error ', err);
    });

    //carga_agua(100);


    $("#info_concs").fadeIn('slow');

    $("#contenedor_agua").addClass("wow animate__animated animate__fadeInLeft animated");
    $("#contenedor_agua").attr("style", "visibility: visible; animation-name: fadeInRight;");
    $('#contenedor_agua').addClass('animated');

    
}








function get_concesionarios(clave_acuifero) {
    
    $("#info_concesionario").show();
    let valor_select = document.getElementById("sel_concesionario").value;


    let parametros = {
        "valor_select": valor_select,
        "clave_acuifero": clave_acuifero
    }

    if (valor_select != '') {
        
        fetch('./php/API/info_concesionario.php', {
            method: 'POST',
            body: JSON.stringify(parametros)
        })
        .then(
            function (response) {
    
                if (response.status !== 200) {
                    console.log('Error al cargar la información' +
                        response.status);
                    return;
                }
    
                // Si la peticion responde de manera exitosa
                response.json().then(function (data) {
                    
                    let bool_pendiente = data[0].otro;
                    let info_conce;
                    let volumen_extraccion = 0;

                    let vol_acuifero = data[0].vol_acuifero;
                    let vol_pendiente = data[0].vol_pendiente; //inf de cantidad pendiente ate REPDA
                    let titular = data[0].titular;
                    let titulo = data[0].titulo;
                    
                    let municipio = data[0].municipio;
                    let informacion = data[0].informacion;
                    let referencias = data[0].referencias;
                    
                    (informacion === null) ? informacion = '<i>Sin Información</i>' : '' ;
                    (referencias === null) ? referencias = '<i>Sin Información</i>' : '' ;
                    
                    if (bool_pendiente) {
                        let num_conv = vol_pendiente.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        volumen_extraccion = num_conv+'.00';
                        document.getElementById("porcentaje_agua").innerHTML = num_conv+'.00';
                        info_conce = `     
                        <h5 class="text-info text-center p-3"> Otros: </h5> 

                        <p>
                        Pendiente de titulación y/o registro en el REPDA
                        </p>
                        <p>
                           <b>Volúmen de Extracción:</b> </br> ${num_conv}.00
                        </p>`;

                    }else{
                        volumen_extraccion = data[0].volumen_extraccion;
                        document.getElementById("porcentaje_agua").innerHTML = volumen_extraccion;
                        
                         info_conce = `     
                        <h5 class="text-info text-center p-3"> ${titular}</h5> 
                        <p>
                           <b>Titulo:</b> </br> ${titulo}
                        </p>
                        <p>
                           <b>Volúmen de Extracción:</b> </br> ${volumen_extraccion}
                        </p>
                        <p>
                           <b>Clave - Municipio:</b> </br> ${municipio}
                        </p>
                        <p>
                            <b>Información:</b> </br> ${informacion}
                        </p>
                        <p style="font-size:small;">
                            <b>Referencias:</b> </br> ${referencias}
                        </p>`;
                    }


                    document.getElementById("info_concesionario").innerHTML = info_conce;


                    

                    let vol_total_parseado = parseFloat(vol_acuifero.replace(/,/g, ''));
                    let vol_parseado = parseFloat(volumen_extraccion.replace(/,/g, ''));
                    let total = (vol_parseado / vol_total_parseado) * 100;

                    total = Math.round(total);

                    (bool_pendiente) ? titulo = 'PENDIENTES' : '';
                    (bool_pendiente) ? titular = 'PENDIENTES' : '';

                    carga_agua(total, titulo, titular, volumen_extraccion);

                    if (!bool_pendiente) {
                        $('#cont_map2').fadeIn('slow');
                        let array_coords = data[1].coords;
                        for (var item in array_coords) {

                            let coords = array_coords[item];
                            let coords_expl = coords.split(', ');

                            if (item == 0) {
                                map2.panTo(new L.LatLng(coords_expl[0], coords_expl[1]));
                            }

                            L.marker([coords_expl[0], coords_expl[1]], {icon: agua_icono}).addTo(map2)
                            .bindPopup('"' + titular + '" #' + item);
                            
                        }
                    }else{
                        $('#cont_map2').fadeOut('slow');
                    }
                    
                    

                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error ', err);
        });
        
    }

}





// ANIMACION DE AGUA
function carga_agua(porcentaje, titulo, titular, volumen) {
    let vol_parseado = 0;
    let contenido_titulares = '';
    if (titulo != undefined && !titulos.includes(titulo)) {
        
        titulares.push( titular +': <span class="text-info">' + volumen + '</span>');
        titulos.push(titulo);
        agua_total = agua_total + porcentaje;
        contenido_titulares = '<div class="col-12" id="info_titulares">';

        for (var item in titulares) {
            contenido_titulares +=' <label class="text-secondary">' + titulares[item] + ' </label> </ br>'; 
        }
        
        //if (titulo != 'PENDIENTES') {
            vol_parseado = parseFloat(volumen.replace(/,/g, ''));
        /*}else{
            vol_parseado = parseFloat(volumen);
        }*/
        console.log(volumen);
        console.log(vol_parseado);

        suma_concesionarios += vol_parseado; 
        let num_conv = suma_concesionarios.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");        

        contenido_titulares += '</div><hr> <i>Total: <span class="text-success">'+num_conv +'.00</span> </i>'; 
        document.getElementById("titulares_totales").innerHTML = contenido_titulares;

    }


    //segun el porcentaje de agua se llena este mismo con add agregamos la clase correspondiente y con remove la quitamos
    if (porcentaje >= 0 && porcentaje <= 5) {
        document.getElementById("water").classList.remove("cargar_agua50");
        document.getElementById("water").classList.remove("cargar_agua70");
        document.getElementById("water").classList.add("cargar_agua30");
    }else if (porcentaje >= 6 && porcentaje <= 20) {
        document.getElementById("water").classList.remove("cargar_agua30");
        document.getElementById("water").classList.remove("cargar_agua70");
        document.getElementById("water").classList.add("cargar_agua50");
    }else if (porcentaje >= 21 && porcentaje <= 100) {
        document.getElementById("water").classList.remove("cargar_agua30");
        document.getElementById("water").classList.remove("cargar_agua50");
        document.getElementById("water").classList.add("cargar_agua70");
    }


}




//API para actualizar bd de prueba
/*
function actualiza_bd(){
    fetch('./php/API/actualizar_acuiferos.php')
    .then(
        function (response) {

            if (response.status !== 200) {
                console.log('Error al cargar la información' +
                    response.status);
                return;
            }

            // Si la peticion responde de manera exitosa
            response.json().then(function (data) {

                console.log(data);

            });
        }
    )
    .catch(function (err) {
        console.log('Fetch Error ', err);
    });
}*/
