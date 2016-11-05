// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.controller('MotionController', function($scope, $cordovaDeviceMotion, $ionicPlatform) {

    // watch Acceleration options
    $scope.options = { 
        frequency: 100, // Measure every 100ms
        deviation : 25  // We'll use deviation to determine the shake event, best values in the range between 25 and 30
    };
 
    // Current measurements
    $scope.measurements = {
        x : null,
        y : null,
        z : null,
        timestamp : null
    }
 
    // Previous measurements    
    $scope.previousMeasurements = {
        x : null,
        y : null,
        z : null,
        timestamp : null
    }
    
    // Watcher object
    $scope.watch = null;
 
    // Start measurements when Cordova device is ready
    $ionicPlatform.ready(function() {
 
        //Start Watching method
        $scope.startWatching = function() {            
            // Device motion configuration
            $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);
 
            // Device motion initilaization
            $scope.watch.then(null, function(error) {
                console.log('Error');
            },function(result) {
 
                // Set current data  
                $scope.measurements.x = result.x;
                $scope.measurements.y = result.y;
                $scope.measurements.z = result.z;
                $scope.measurements.timestamp = result.timestamp;                 
 
                // Detecta shake  
                $scope.detectShake(result);  
 
            });     
        };      
 
        // Stop watching method
        $scope.stopWatching = function() {  
            $scope.watch.clearWatch();
        }       
 
        // Detect shake method      
        $scope.detectShake = function(result) { 
 
            //Object to hold measurement difference between current and old data
            var measurementsChange = {};
 
            // Calculate measurement change only if we have two sets of data, current and old
            if ($scope.previousMeasurements.x !== null) {
                measurementsChange.x = Math.abs($scope.previousMeasurements.x, result.x);
                measurementsChange.y = Math.abs($scope.previousMeasurements.y, result.y);
                measurementsChange.z = Math.abs($scope.previousMeasurements.z, result.z);
            }
 
            // If measurement change is bigger then predefined deviation
            if (measurementsChange.x + measurementsChange.y + measurementsChange.z > $scope.options.deviation) {
                $scope.stopWatching();  // Stop watching because it will start triggering like hell
                console.log('Movimiento detectado, frenando.'); // shake detected
                $scope.mensajeAcelerometro = "Movimiento detectado";
                setTimeout($scope.startWatching(), 1000);  // Again start watching after 1 sex
                comunicacionBluetooth.frenar();
                // Clean previous measurements after succesfull shake detection, so we can do it next time
                $scope.previousMeasurements = { 
                    x: null, 
                    y: null, 
                    z: null
                }               
 
            } else {
                // On first measurements set it as the previous one
                $scope.previousMeasurements = {
                    x: result.x,
                    y: result.y,
                    z: result.z
                }
            }           
 
        }       
 
    });
 
    $scope.$on('$ionicView.beforeLeave', function(){
        $scope.watch.clearWatch(); // Turn off motion detection watcher
    });

});
