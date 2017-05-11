var app = angular.module('myApp')
  .controller('AppController', function($scope, Upload) {

    var files = [];
    var i = 0;    

    $scope.reset = function() {
      $scope.image1 = {};
      $scope.image2 = {};
      $scope.file1 = false;
      $scope.file2 = false;
      $scope.message = false;
      $scope.progressPercentage = false;
      files = [];
      $scope.loading = false;
      $scope.config = {webcam: false};  
      $scope.cameras = [];
      $scope.multiplasCameras = false;  
      $scope.cameraas = []; 
      $scope.loaded = false;
      var i = 0;    
      $scope.mostrarImagens = false; 
      load(); 
    }

    $scope.openWebcam = function(){   

        if(window.stream){
            window.stream.getTracks().forEach(function(track){
                track.stop();
            });
        }        

        var videos = $scope.cameras[i];
        var constraints = {
        		video: {deviceId: videos ? {exact: videos} : undefined},
        		audio: false
        } 
        				  
        navigator.mediaDevices.getUserMedia(constraints).then( function(stream){
                window.stream = stream;
                var video = document.getElementById("v");
                video.srcObject = stream;                
        });        
    }

    function load(){
        navigator.mediaDevices.enumerateDevices().then(function(devices){
            devices.forEach(function(element) {
                if(element.kind === "videoinput"){
                    $scope.cameraas.push(element);
                    $scope.cameras.push(element.deviceId);                    
                }                
            });              
            if($scope.cameras.length > 1){
                $scope.multiplasCameras = true;
            }
        })        
    }
    load();

    $scope.alterarCamera = function(){
        var video = document.getElementById("v");
        video.pause();
        if (i === $scope.cameras.length -1 ){
            i = 0
        }else{
            i++;
        }
        $scope.openWebcam();        
        
    }

    $scope.resetImage1 = function(){
        $scope.image1 = {};
        files.splice(0,1);
        $scope.$apply();
    }
    $scope.resetImage2 = function(){
        $scope.image2 = {};
        files.splice(1,1);
        $scope.$apply();
    }

    $scope.reset();

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    $scope.capture = function(){
        $scope.loading = true

        var video = document.getElementById("v");
        var canvas = document.getElementById("c");
        var context = canvas.getContext('2d');
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);        
        var src = canvas.toDataURL("image/jpeg");
        var f = dataURLtoFile(src, 'a');
        $scope.loading = false;
        $scope.upload(f, $scope.image1);
    }

    $scope.capture2 = function(){
        $scope.loading = true

        var video = document.getElementById("v");
        var canvas = document.getElementById("c");
        var context = canvas.getContext('2d');
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);        
        var src = canvas.toDataURL("image/jpeg");
        var f = dataURLtoFile(src, 'a');
        $scope.loading = false;
        $scope.upload(f, $scope.image2);
    }
    

    $scope.close = function(){
        if(window.stream){
            window.stream.getTracks().forEach(function(track){
                track.stop();
            });
        }   
    }
    

    $scope.upload = function ($file, image) {

        var reader = new FileReader();

        reader.onload = function(e) {
            image.src = reader.result;
            $scope.$apply();
            
        }

        reader.readAsDataURL($file);
        $scope.$broadcast('ngWebcam_off');        

        files.push($file);            
    

        if(files.length === 2) {
           $scope.loading = true;
           Upload.upload({
               url: '/compare/index',
               data: {
                 file1: files[0],
                 file2: files[1]
               }
           }).then(function (resp) {
               $scope.classe = resp.data.classe;
               $scope.message = resp.data.mensagem;
               $scope.loading = false;
           }, function (resp) {
               console.log('Error status: ' + resp.status);
               $scope.loading = false;
           }, function (evt) {
               $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
               $scope.mostrarImagens = true;

           });
        }
        $scope.close();
        $scope.config.webcam = false;
    }
  });
