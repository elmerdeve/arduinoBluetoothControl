/*
    Comunicación vía bluetooth con la app.
*/


var comunicacionBluetooth = {
    macAddress: "98:D3:31:70:93:95",  // Dirección bluetooth del auto.
    chars: "",

/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        console.log("Activando bluetooth...");
    },
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', comunicacionBluetooth.manageConnection, false);
        testSendButton.addEventListener('touchend', comunicacionBluetooth.escribirMensaje, false);
        bocinaButton.addEventListener('touchend', comunicacionBluetooth.tocarBocina, false);
        luzButton.addEventListener('touchend', comunicacionBluetooth.encenderLuz, false);
        avanceButton.addEventListener('touchend', comunicacionBluetooth.avanzar, false);
        stopButton.addEventListener('touchend', comunicacionBluetooth.frenar, false);
        retrocesoButton.addEventListener('touchend', comunicacionBluetooth.retroceder, false);
        izquierdaButton.addEventListener('touchend', comunicacionBluetooth.girarAIzquierda, false);
        centrarDireccionButton.addEventListener('touchend', comunicacionBluetooth.centrarDireccion, false);
        derechaButton.addEventListener('touchend', comunicacionBluetooth.girarADerecha, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    console.log(JSON.stringify(results));
                    //comunicacionBluetooth.display(JSON.stringify(results));
                },
                function(error) {
                    comunicacionBluetooth.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            comunicacionBluetooth.display("Bluetooth no disponible.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            comunicacionBluetooth.clear();
            comunicacionBluetooth.display("Intentando conectar...");
            // attempt to connect:
            bluetoothSerial.connect(
                comunicacionBluetooth.macAddress,  // device to connect to
                comunicacionBluetooth.openPort,    // start listening if you succeed
                comunicacionBluetooth.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            comunicacionBluetooth.display("Intentando desconectar...");
            // if connected, do this:
            bluetoothSerial.disconnect(
                comunicacionBluetooth.closePort,     // stop listening to the port
                comunicacionBluetooth.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        comunicacionBluetooth.display("Conectado a: " + comunicacionBluetooth.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            comunicacionBluetooth.clear();
            comunicacionBluetooth.display(data);
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        comunicacionBluetooth.display("Disconnected from: " + comunicacionBluetooth.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    comunicacionBluetooth.display(data);
                },
                comunicacionBluetooth.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        comunicacionBluetooth.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), 
            lineBreak = document.createElement("br"),     
            label = document.createTextNode(message);

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

//  Funciones 
/*
    Escribe un mensaje para testear la conexión.
*/
    escribirMensaje: function() {
        bluetoothSerial.write("A1", true, false);
        comunicacionBluetooth.display("Escribiendo...");
    },
/*
    Activa el giro a la izquierda.
*/
    girarAIzquierda: function() {
        bluetoothSerial.write("E", true, false);
        comunicacionBluetooth.display("Girando <-");
    },
/*
    Activa el giro a la derecha.
*/
    girarADerecha: function() {
        bluetoothSerial.write("D", true, false);
        comunicacionBluetooth.display("Girando ->");
    },
/*
    Centra la dirección.
*/
    centrarDireccion: function() {
        bluetoothSerial.write("F", true, false);
        comunicacionBluetooth.display("Centrando dirección");
    },
/*
    Activa el avance.
*/
    avanzar: function() {
        bluetoothSerial.write("A", true, false);
        comunicacionBluetooth.display("Avanzando");
    },
/*
    Activa el retroceso.
*/
    retroceder: function() {
        bluetoothSerial.write("B3", true, false);
        comunicacionBluetooth.display("Retrocediendo");
    },
/*
    Frena la marcha.
*/
    frenar: function() {
        bluetoothSerial.write("C", true, false);
        comunicacionBluetooth.display("Frenando");
    },
/*
    Activa el zumbador.
*/
    tocarBocina: function() {
        bluetoothSerial.write("G", true, false);
        comunicacionBluetooth.display("Tocando bocina");
    },
/*
    Enciende la luz.
*/
    encenderLuz: function() {
        bluetoothSerial.write("A1", true, false);
        comunicacionBluetooth.display("Encendiendo luz");
    }
}; // end of app