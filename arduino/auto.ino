#include <SoftwareSerial.h>
/*EL MOTOR 1 es el que maneja la velocidad, y el MOTOR 2 es el que maneja la direccion*/
#define MOTOR_1_PWM   6   // Vcc Pin para MOTOR1  
#define MOTOR_1_CTRL1 7   // Control PIN 1 para MOTOR1
#define MOTOR_1_CTRL2 8   // Control PIN 2 para MOTOR1

#define MOTOR_2_PWM   9   // Vcc Pin para MOTOR2
#define MOTOR_2_CTRL1 10  // Control PIN 1 para MOTOR2
#define MOTOR_2_CTRL2 11  // Control PIN 2 para MOTOR2

#define LED_FRONTAL 3
#define SENSOR_LUZ A0
#define PIN_SPEAKER A1

//Constantes para manejar sensor de distancia
#define LED_STOP 12
#define SENSOR_DIST 5

int sentidoMotor1 = 0; // 0=stop, 1=adelante, 2=atras
int sentidoMotor2 = 0; // 0=centro, 1=derecha, 2=izquierda

SoftwareSerial BT1(4,2); // RX, TX recorder que se cruzan
bool obstaculo = false; //flag para verificar si hay objetos al frente

// variables sensor de luz
int sensorValue = 0;         // the sensor value
//int sensorMin = 1023;        // minimum sensor value
//int sensorMax = 0;          // maximum sensor value
/*int ledLuz = 3;
int sensorLuz = A0;
*/

//Variables para leer los comandos
char comando;         //comando leido desde el puerto serie
int velocidad = 0;    //velocidad leida desde el puerto serie


void setup() {

  Serial.begin(9600);
  BT1.begin(9600);

  pinMode(LED_STOP, OUTPUT);
  pinMode(SENSOR_DIST, INPUT);

  pinMode(LED_FRONTAL, OUTPUT);
  pinMode(SENSOR_LUZ, INPUT);
  
  pinMode(PIN_SPEAKER, OUTPUT);
  
  setupMotors();
}

void loop() {

  // Verificamos si el sensor de distancia detecto un obstáculo
  if(  digitalRead(SENSOR_DIST) == LOW ){  // si tenemo un obsataculo
    digitalWrite(LED_STOP, HIGH);           // encendemos la luz de stop 
    if (obstaculo == false)
      stopMotor(1);                 // y detenemos el motor de velocidad
    obstaculo = true;
  }
  else{
    digitalWrite(LED_STOP, LOW);    // cuando no hay obstaculo apagamos la luz de stop
    obstaculo = false;
  }

  // leemos el sensor de luz ambiente.
  //sensorValue = analogRead(SENSOR_LUZ);
  //sensorValue = 1023 - sensorValue ;
  // fade the LED using the calibrated value:
  //analogWrite(LED_FRONTAL, sensorValue);
  
  if( digitalRead(SENSOR_LUZ) == HIGH )
    digitalWrite(LED_FRONTAL, HIGH); 
  else
    digitalWrite(LED_FRONTAL, LOW); 

  // verificamos si tenemos mensajes entrantes desde bluetooth
  if (BT1.available()) {
    Serial.println("Bluetooth activo");

    //invocamos a la fc que lee los comandos que llegaron desde el bluetooth
    leerComando();
  //BORRAR SOLO PARA TESTEAR
    Serial.println("comando");
        Serial.println(comando);

    Serial.println("velocidad");

    Serial.println(velocidad);
// BORRAR HASTA ACA

    // procesamos los comandos que nos llegan.
    switch(comando){
    case 'A': //el motor 1 se mueve para adelante, si no hay obstaculos al frente
          if( obstaculo == false){
              if (sentidoMotor1 == 2) // si tenemo que cambiar el sentido de giro del motor primero lo paramos
                  stopMotor(1);
              setMotor(1, velocidad, false);
            }
            break;
    case 'B': //el motor 1 se mueve para atras
             if (sentidoMotor1 == 1)  // si tenemo que cambiar el sentido de giro del motor primero lo paramos
                stopMotor(1);
             setMotor(1, velocidad, true);
             break;
    case 'C':
           //el motor 1 se detiene
           stopMotor(1);
             break;
    case 'D': //el motor 2 se mueve para la derecha
             if (sentidoMotor2 == 2)
                stopMotor(2);
             setMotor(2, velocidad, false);
             break;
    case 'E': //el motor 2 se mueve para la izquierda
             if (sentidoMotor1 == 1)
                stopMotor(2);
             setMotor(2, velocidad, true);
             break;
    case 'F':
           //el motor 2 se detiene
           stopMotor(2);
             break;
    case 'G':
          //activamos el speaker
          tone(PIN_SPEAKER,100,100); //tone(pin,frecuencia, tiempo_ms )
    default:
          Serial.println("Comando no valido.") ;
          break;
    }
  }
 delay(100);
}


/*
  Funcion leerComando, formato del comando <LetraNum>
    Las letras pueden ser A,B,C,D,E,F. Las letras (A,B,C) son instrucciones para el motor 1,
    las cuales le indican (adelante, atras, stop) y las letras (C,D,E) son para el motor2.
    Los numeros pueden ser 0,1,2,3,4. Con esto valores determinamos la velocidad de giro de los
    motores. (0=50, 1=100, 2=150, 3=200 4=250)

*/
void leerComando(){
  char vel;    //cadena para leer la velocidad
  int i = 0;            //contador para leer datos
  int aux=0;
  velocidad = 0;

  //Cuando haya datos disponibles
  while(i != 2)
  {
      switch(i){
        case 0:{
                  comando = BT1.read();
                  break;
            }
        case 1:{
                  vel = BT1.read(); //seteamos la veocidad solo puede incrementar de a 50
                switch(vel){
              case '0':{
                      velocidad = 50;
                      //Serial.println(velocidad);
                      break;
                    }
                    case '1':{
                      velocidad = 100;
                        break;
                    }
                    case '2':{
                      velocidad = 150;
                        break;
                    }
                    case '3':{
                      velocidad = 200;
                        break;
                    }
                    case '4':{
                      velocidad = 250;
                        break;
                    }
                default:{
                      velocidad = 250;
                      break;
                    }
                  }
                  break;
               }
          default: break;
      }
      i++;
  }
  // Lee caracter de fin
  BT1.read();
}


/**
 * setupMotors
 *
 * Inicializa la configuracion de los motores
 */
void setupMotors() {

  // MOTOR 1
  pinMode( MOTOR_1_PWM, OUTPUT);
  pinMode( MOTOR_1_CTRL1, OUTPUT);
  pinMode( MOTOR_1_CTRL2, OUTPUT);

  // MOTOR 2
  pinMode( MOTOR_2_PWM, OUTPUT);
  pinMode( MOTOR_2_CTRL1, OUTPUT);
  pinMode( MOTOR_2_CTRL2, OUTPUT);
}

/**
 * setMotor
 *
 * Setea velocidad y direccion del motor
 *
 * @param motor       Id del motor (1-2)
 * @param velocity    Velocidad del motor [0-255]
 * @param reverse     Direccion del motor. true: sentido horario, false: Sentido Antihorario
 *
 * @return            true|false
 */
boolean setMotor(int motorId, int velocity, boolean reverse) {

  // Validacion de parametros de entrada

  if ( motorId != 1 && motorId != 2 ) {
    return false;
  }

  if ( velocity < 0 || velocity > 255 ) {
    return false;
  }

  // Si es el motor 1
  if ( motorId == 1 ) {

    analogWrite( MOTOR_1_PWM, velocity);
    if ( reverse == true ) {
      digitalWrite( MOTOR_1_CTRL1, LOW);
      digitalWrite( MOTOR_1_CTRL2, HIGH);
      sentidoMotor1 = 1;
    } else {
      digitalWrite( MOTOR_1_CTRL1, HIGH);
      digitalWrite( MOTOR_1_CTRL2, LOW);
      sentidoMotor2 = 2;
    }

  } else {

    analogWrite( MOTOR_2_PWM, velocity);
    if ( reverse == true ) {
      digitalWrite( MOTOR_2_CTRL1, LOW);
      digitalWrite( MOTOR_2_CTRL2, HIGH);
      sentidoMotor2 = 1;
    } else {
      digitalWrite( MOTOR_2_CTRL1, HIGH);
      digitalWrite( MOTOR_2_CTRL2, LOW);
      sentidoMotor2 = 2;
    }
  }
  return true;
}

/**
 * stopMotor
 *
 * Frena un motor
 *
 * @param motorId   Id del motor
 */
 void stopMotor(int motorId){

  // Validacion de parametros de entrada

  if ( motorId != 1 && motorId != 2 ) {
    return;
  }

  if ( motorId == 1 ) {
    analogWrite( MOTOR_1_PWM, 0);
    sentidoMotor1 = 0;
  } else {
    analogWrite( MOTOR_2_PWM, 0);
    sentidoMotor2 = 0;
  }
   delay(2000);
}

//Bluetooth
String GetLine()
   {   String S = "" ;
       if (Serial.available())
          {    char c = Serial.read(); ;
                while ( c != '\n')            //Hasta que el caracter sea intro
                  {     S = S + c ;
                        delay(25) ;
                        c = Serial.read();
                  }
                return( S + '\n') ;
          }
   }
