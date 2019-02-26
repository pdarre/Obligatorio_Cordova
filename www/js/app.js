document.addEventListener('DOMContentLoaded', function (event) {
    BD.webdb.open();
    BD.webdb.createTable();
    checkConnection();
  })


document.addEventListener('init', function (event) {
    if (event.target.matches('#selecionarServicio')) {
        ons.notification.alert('Page is initiated');
        listarServicios();
        $("ons-progress-bar").hide();
    }
})

document.addEventListener("offline", onOffline, false); 
function onOffline() {
    ons.notification.alert('Conecte el dispositivo a internet');
}

function init() {
    BD.webdb.open();
    BD.webdb.createTable();
    checkConnection();
};


/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
        window.addEventListener("batterystatus", onBatteryStatus, false);
        chequearConexion();
        
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


function chequearConexion() {
    var con = checkConnection();
    if (con == "No network connection") {
        ons.notification.alert("No hay conexion a internet");
    }
};

// NETWORK CHECK
function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    ons.notification.alert('Connection type: ' + states[networkState]);
}


// NAVIGATOR
document.addEventListener('init', function (event) {
    var page = event.target;
});


/* #region SPLITTER APPPAGE */
window.fn = {};

window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};

window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page).then(menu.close.bind(menu));
};

document.addEventListener('init', function (event) {
    var page = event.target;
    if (page.id === 'registro') {
        page.querySelector('#push-button').onclick = function () {
            document.querySelector('#myNavigator').pushPage('page2.html');
        };
    }
});
/* #endregion */



/* #region DATOS WEBSQL */
var BD = {};
BD.webdb = {};

var idUsu;
var emailUsu;
var tokenUsu;

//CREA BASE DE DATOS
BD.webdb.db = null;

BD.webdb.open = function () {
    var dbSize = 5 * 1024 * 1024;
    BD.webdb.db = openDatabase("Obligatorio", "1.0", "Datos de la aplicacion", dbSize);
};

BD.webdb.onError = function (tx, e) {
    alert("Error: " + e.message);
};

BD.webdb.onSuccess = function (tx, r) {
    ons.notification.toast("Favorito agregado", { timeout: 3000 });
    console.log("Success: " + r.toString());
};

//CREANDO UN A TABLA
BD.webdb.createTable = function () {
    var db = BD.webdb.db;
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS Favoritos (idUsuario TEXT, servicioID integer)", []);
    });
};

//AGREGANDO DATOS A LA TABLA
BD.webdb.addFavorito = function (idu, ids) {
    var db = BD.webdb.db;
    db.transaction(function (tx) {
      var addedOn = new Date();
      tx.executeSql("INSERT INTO Favoritos(idUsuario, servicioID) VALUES (?,?)",
        [idu, ids],
        BD.webdb.onSuccess,
        BD.webdb.onError);
    });
  };

//RECUPERANDO LOS DATOS DEL USUARIO
function getDatosUsuario(id) {
    var db = BD.webdb.db;
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM Usuario WHERE idUsuario=? and added_on =(SELECT MAX(added_on) FROM Usuario)', [id], function (tx, results) {
            console.log(results.rows[0].email);
            console.log(results);
        });
    });
};

/* #endregion */


/* #region METODOS API */
var resp;

function registro() {
    var usu = $("#txtEmail").val();
    var tel = $("#txtTelefono").val();
    var pass = $("#txtPass").val();
    if (validarEmail(usu) && validarTelefono(tel)) {
        validarEmail(usu);
        disableInputs();
        $.ajax({
            url: "http://api.marcelocaiafa.com/usuario",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({
                email: usu,
                password: pass,
                telefono: tel
            }),
            success: function (response) {
                respuesta = response;
                document.querySelector('#myNavigator').pushPage('page2.html');
                enableInputs();
            },
            error: function (err, cod, msg) {
                var resp = err.responseJSON.descripcion;
                ons.notification.alert({ message: resp });
                enableInputs();
            }
        });
    };
};

function login() {
    var usu = $("#username").val();
    var pass = $("#password").val();
    if (validarEmail(usu)) {
        disableInputs();
        $.ajax({
            url: "http://api.marcelocaiafa.com/login",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({
                email: usu,
                password: pass
            }),
            success: function (response) {
                resp = response;
                sessionStorage.setItem("token", response.description.token);
                sessionStorage.setItem("email", response.description.usuario.email);
                sessionStorage.setItem("idUsuario", response.description.usuario.id);
                enableInputs();
                cargarPagina();
                cargarDatosUsuario();
            },
            error: function (err, cod, msg) {
                var resp = err.responseJSON.description;
                ons.notification.alert({ message: resp });
                enableInputs();
            }
        });
    };
};

function guardarVehiculo() {
    var mat = $("#txtMAtricula").val();
    var desc = $("#txtDescripcion").val();
    if (!esVacio(mat) && !esVacio(desc)) {
        var idU = sessionStorage.getItem("idUsuario");
        var datos = {
            matricula: mat,
            descripcion: desc,
            usuario: idU
        };
        datos = JSON.stringify(datos);
        $.ajax({
            headers: {
                "Authorization": sessionStorage.getItem("token")
            },
            url: "http://api.marcelocaiafa.com/vehiculo",
            type: "POST",
            data: datos,
            success: function (response) {
                document.querySelector('#myNavigator').pushPage('home.html');
            },
            error: function (xmlrequest) {
                ons.notification.toast(xmlrequest.responseJSON.descripcion, { timeout: 2000 });
            }
        });
    };
};

function listarVehiculos() {
    var idU = sessionStorage.getItem("idUsuario");
    $.ajax({
        headers: {
            "Authorization": sessionStorage.getItem("token")
        },
        url: "http://api.marcelocaiafa.com/vehiculo/?usuario=" + idU,
        type: "GET",
        success: function (response) {
            cargarListaMisVehiculos(response);
        },
        error: function (response) {
            ons.notification.toast(response.description, { timeout: 3000 });
        }
    });
};

function cargarListaMisVehiculos(r) {
    for (var i = 0; i < r.description.length; i++) {
        $('#contenidoMiVehiculo').append(
            "<ons-card>" +
            // "<div style='width:20%;'>" +
            // "<img src='img/imagenAuto.png'>" +
            // "</div>" +
            "<div class='title' width:80%;>" +
            "Matricula: " + r.description[i].matricula +
            "</div>" +
            "<div class='content'>" +
            "<div>ID: " + r.description[i].id + "</div>" +
            "<div>Desc: " + r.description[i].descripcion + "</div>" +
            "</div>" +
            "<div>" +
            "<ons-button modifier='quiet' ontouchstart='listarServiciosById(" + r.description[i].id + ")'>Mis servicios</ons-button>" +
            "<ons-button modifier='quiet' ontouchstart='caargarPaginaServicios(" + r.description[i].id + ")'>Agregar servicio</ons-button>" +
            "</div>" +
            "</ons-card>"
        )
    };
};

function caargarPaginaServicios(id) {
    sessionStorage.setItem('vehiculoId', id);
    fn.load("servicios.html");
}

function listarServicios() {
    $.ajax({
        headers: {
            "Authorization": sessionStorage.getItem("token")
        },
        url: "http://api.marcelocaiafa.com/servicio",
        type: "GET",
        success: function (response) {
            cargarServicios(response);
        },
        error: function (response) {
            ons.notification.toast(response.descripcion, { timeout: 3000 });
        }
    });
};

function listarServiciosById(id) {
    $.ajax({
        headers: {
            "Authorization": sessionStorage.getItem("token")
        },
        url: "http://api.marcelocaiafa.com/mantenimiento/?vehiculo=" + id,
        type: "GET",
        success: function (response) {
            // cargarServicios(response);
        },
        error: function (response) {
            if (response.status == 0) {
                ons.notification.toast('No hay servicios para el vehiculo', { timeout: 2000 });
            }
            ons.notification.toast(response.description, { timeout: 3000 });
        }
    });
};


function cargarServicios(r) {
    var inicio = "<ons-list>";
    var medio;
    for (var i = 0; i < r.description.length; i++) {
        medio += "<ons-list-item expandable>" +
            "<p style='font-weight: bold;'>" + r.description[i].nombre + "</p>" +
            "<div class='expandable-content'>" +
            "<p>" + "Desc: " + r.description[i].descripcion + "</p>" +
            "<ons-button modifier='quiet' onclick='solicitarServicio(" + r.description[i].id + ");" + " cargarNombre(\"" + r.description[i].nombre + "\");'>Solicitar</ons-button>" +
            "</div>" +
            "</ons-list-item>"
    };
    var fin = "</ons-list>";
    document.getElementById('selServicios').innerHTML = inicio += medio += fin;
};

function cargarNombre(nom) {
    sessionStorage.setItem("nombreServicio", nom);
}

function solicitarServicio(id) {
    $.ajax({
        headers: {
            "Authorization": sessionStorage.getItem("token")
        },
        url: "http://api.marcelocaiafa.com/taller/?servicio=" + id,
        type: "GET",
        success: function (response) {
            sessionStorage.setItem("servicioId", id);
            prepararMarcadores(response);
            myNavigator.pushPage('mapa.html');
        },
        error: function (response) {
            ons.notification.toast(response.description, { timeout: 3000 });
        }
    });
};

function guardarServicio() {
    var idU = sessionStorage.getItem("idUsuario");
    var datos = {
        vehiculo: vehiculoid,
        descripcion: desc,
        fecha: fecha,
        servicio: servicioid,
        kilometraje: kilometraje,
        costo: costo,
        taller: tallerid
    };
    datos = JSON.stringify(datos);
    $.ajax({
        headers: {
            "Authorization": sessionStorage.getItem("token")
        },
        url: "http://api.marcelocaiafa.com/mantenimiento",
        type: "POST",
        data: datos,
        success: function (response) {            
            myNavigator.resetToPage('appPage.html');
            limpiarFormularioServicios();
            hideDialog();
        },
        error: function (response) {
            // ons.notification.alert(response.responseJSON.descripcion);
            ons.notification.toast(response.responseJSON.descripcion, { timeout: 2000 });
        }
    });
}


function logout() {
    ons.notification.confirm({
        message: 'Desea terminar la sesion?',
        callback: function (idx) {
            switch (idx) {
                case 0:
                    break;
                case 1:
                    $.ajax({
                        headers: {
                            "Authorization": sessionStorage.getItem("token")
                        },
                        url: "http://api.marcelocaiafa.com/logout",
                        type: "POST",
                        success: function (response) {
                            document.querySelector('#myNavigator').pushPage('login.html');
                            location.reload();
                        },
                        error: function (xmlrequest) {
                            ons.notification.toast(xmlrequest.responseJSON.descripcion, { timeout: 3000 });
                        }
                    });
                    break;
            }
        }
    });
};
/* #endregion */

function cargarDatosUsuario() {
    $(document).ready(function () {
        $("#lblEmail").text(sessionStorage.getItem("email"));
        $('#lblIdUsuario').text("ID: " + sessionStorage.getItem("idUsuario"));
    });
};

function disableInputs() {
    $(".inputForm").prop('disabled', true);
    $("ons-progress-bar").show();
};

function enableInputs() {
    $(".inputForm").prop('disabled', false);
    $("ons-progress-bar").hide();
};

function validarEmail(EmailId) {
    var emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (emailRegex.test(EmailId)) {
        return true;
    } else {
        ons.notification.alert("Ingrese un email valido");
    };
};

function validarTelefono(telefono) {
    var telReg = /^09[0-9]{7}|[0-9]{8}$/;
    if (telReg.test(telefono)) {
        return true;
    } else {
        ons.notification.alert("Ingrese un telefono valido");
    };
};

function esVacio(text) {
    if (text.length <= 0) {
        return true;
    }
    return false;
};

function cargarPagina() {
    // document.querySelector('#myNavigator').pushPage('appPage.html');
    myNavigator.pushPage('appPage.html');
};

function prepararMarcadores(r) {
    for (var i = 0; i < r.description.length; i++) {
        talleres.push(
            {
                descripcion: r.description[i].descripcion,
                telefono: r.description[i].telefono,
                direccion: r.description[i].direccion,
                imagen: r.description[i].imagen,
                id: r.description[i].id,
                ubicacion: {
                    latitudLocal: r.description[i].lat,
                    longitudLocal: r.description[i].lng
                }

            });
    };
};

/* #endregion */


/* #region MAPAS */

var talleres = [];

function correrMapa() {
    navigator.geolocation.getCurrentPosition(mostrarMapa,
        errorUbicacion,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
};

var markers = [];

var latActual;
var lonActual;
var directionsService;
var directionsDisplay;

function mostrarMapa(ubi) {
    latActual = ubi.coords.latitude;
    lonActual = ubi.coords.longitude;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latActual, lng: lonActual },
        zoom: 10
    });
    directionsDisplay.setMap(map);

    var marker = new google.maps.Marker({
        position: { lat: latActual, lng: lonActual },
        map: map,
        title: "YOGUI",
        icon: 'http://maps.google.com/mapfiles/kml/pal2/icon39.png'

    });

    setMarkers(map);
};

function dibujarRuta(lati, long) {
    directionsService.route({
        origin: { lat: latActual, lng: lonActual },
        destination: { lat: parseFloat(lati), lng: parseFloat(long) },
        travelMode: 'DRIVING'
    },
        function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                ons.notification.alert('Solicitud fallida: ' + status);
            }
        });
};
function setMarkers(map) {
    for (var i = 0; i < talleres.length; i++) {
        var location = talleres[i];
        var locationInfowindow = new google.maps.InfoWindow({
            content: "<div><strong>" + talleres[i].descripcion + "</strong></div>" +
                "<div>" + talleres[i].direccion + "</div>" +
                "<div>" + talleres[i].telefono + "</div>" +
                "<img src='http://images.marcelocaiafa.com/" + talleres[i].imagen + "' style='width:100px;height:80px;'>" +
                "<div><ons-button modifier='quiet' onclick='agregarFavoritos(" + talleres[i].id + ")'>favorito</ons-button></div>" +
                "<div><ons-button modifier='quiet' onclick='crearRuta(" +
                talleres[i].ubicacion.latitudLocal + "," + talleres[i].ubicacion.longitudLocal + ")'>Ruta al taller</ons-button></div>" +
                "<div><ons-button modifier='quiet' onclick='RegistrarServicio(" + talleres[i].id + ")'>Registrar servicio</ons-button></div>"
        });

        var latitud = parseFloat(talleres[i].ubicacion.latitudLocal);
        var longitud = parseFloat(talleres[i].ubicacion.longitudLocal);

        var marker = new google.maps.Marker({
            position: { lat: latitud, lng: longitud },
            map: map,
            title: talleres[i].descripcion,
            infowindow: locationInfowindow
        });

        markers.push(marker);

        google.maps.event.addListener(marker, 'click', function () {
            hideAllInfoWindows(map);            
            this.infowindow.open(map, this);
        });

    };
};

function hideAllInfoWindows(map) {
    markers.forEach(function (marker) {
        marker.infowindow.close(map, marker);
    });
};

function RegistrarServicio(id) {
    sessionStorage.setItem("tallerId", id);
    showTemplateDialog(id);
};

function agregarFavoritos(id){    
    var idu = sessionStorage.getItem('idUsuario');
    var ids = sessionStorage.getItem('servicioId');
    BD.webdb.addFavorito(idu, ids);
}

var showTemplateDialog = function (id) {
    var dialog = document.getElementById('my-dialog');
    if (dialog) {
        dialog.show();
        //cargar los datos que ya tengo desde sessionStage/ recordar guardar en session el id del servicio
    } else {
        ons.createElement('dialog.html', { append: true })
            .then(function (dialog) {
                dialog.show();
            });
    }

};

var vehiculoid;
var desc;
var fecha;
var servicioid;
var kilometraje;
var costo;
var tallerid;

function aceptar() {
    // limpiarFormulario()????
    vehiculoid = sessionStorage.getItem('vehiculoId');
    desc = sessionStorage.getItem('nombreServicio');
    var date = formato($('#txtDate').val());
    servicioid = sessionStorage.getItem('servicioId');
    kilometraje = $('#txtKilometraje').val();
    costo = $('#txtCosto').val();
    tallerid = sessionStorage.getItem('tallerId');

    var currentdate = new Date();
    fecha = date + " " +
        + currentdate.getHours() + ":"
        + currentdate.getMinutes();

    guardarServicio();

}

function limpiarFormularioServicios() {
    $('#txtDate').val('');
    $('#txtKilometraje').val('');
    $('#txtCosto').val('');
}

function formato(texto) {
    return texto.replace(/^(\d{4})-(\d{2})-(\d{2})$/g, '$3/$2/$1');
}

function hideDialog(){
    $('#my-dialog').hide();
}

function errorUbicacion(_e) {
    ons.notification.alert("Error" + e.toString());
};

function crearRuta(lat, long) {
    dibujarRuta(lat, long);
};
/* #endregion */
