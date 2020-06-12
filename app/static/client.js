document.addEventListener('DOMContentLoaded', function() {

var isSecureOrigin = location.protocol === 'https:' ||
location.host === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

var constraints;
var mediaStream;


var video = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
var zoomInput = document.querySelector('input#zoom');

videoSelect.onchange = getStream;
zoomInput.oninput = setZoom;

// Get a list of available media input (and output) devices
// then get a MediaStream for the currently selected input device
navigator.mediaDevices.enumerateDevices()
  .then(gotDevices)
  .catch(error => {
    console.log('enumerateDevices() error: ', error);
  })
  .then(getStream);

// From the list of media devices available, set up the camera source <select>,
// then get a video stream from the default camera source.
function gotDevices(deviceInfos) {
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    console.log('Found media input or output device: ', deviceInfo);
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'Camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    }
  }
}

// Get a video stream from the currently selected camera source.
function getStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
  constraints = {
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints)
    .then(gotStream)
    .catch(error => {
      console.log('getUserMedia error: ', error);
    });
}

// Display the stream from the currently selected camera source, and then
// create an ImageCapture object, using the video from the stream.
function gotStream(stream) {
  console.log('getUserMedia() got stream: ', stream);
  mediaStream = stream;
  video.srcObject = stream;
  video.classList.remove('hidden');
  imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
  getCapabilities();
}

// Get the PhotoCapabilities for the currently selected camera source.
function getCapabilities() {
  imageCapture.getPhotoCapabilities().then(function(capabilities) {
    console.log('Camera capabilities:', capabilities);
    if (capabilities.zoom.max > 0) {
      zoomInput.min = capabilities.zoom.min;
      zoomInput.max = capabilities.zoom.max;
      zoomInput.value = capabilities.zoom.current;
      zoomInput.classList.remove('hidden');
    }
  }).catch(function(error) {
    console.log('getCapabilities() error: ', error);
  });
}



function setZoom() {
  imageCapture.setOptions({
    zoom: zoomInput.value
  });
}


    
	
var imageCapture;
var grabFrameButton = document.querySelector('#grabFrame');
//var takePhotoButton = document.querySelector('button#takePhoto');

grabFrameButton.onclick = grabFrame;
//takePhotoButton.onclick = takePhoto;

var canvas = document.querySelector('canvas');
var img = document.querySelector('img');

	
	
// Get an ImageBitmap from the currently selected camera source and
// display this with a canvas element.
function grabFrame() {
  imageCapture.grabFrame().then(function(imageBitmap) {
    console.log('Grabbed frame:', imageBitmap);
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    canvas.getContext('2d').drawImage(imageBitmap, 0, 0);
    canvas.classList.remove('hidden');
	$('div#camera').hide();
	$('div#fotoresultaat').show();
	document.getElementById("result-label").innerHTML = "";
    dataURL = canvas.toDataURL(imageBitmap);
  }).catch(function(error) {
    console.log('grabFrame() error: ', error);
  });
}



 
});
   
   
   
function iconhide() {
	var x = document.getElementById("fotoresultaat");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
	$('div#camera').show();
  }	
}
   


var el = x => document.getElementById(x);

function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
}







function analyze() {
  var block = dataURL.split(";");		
  // Get the content type of the image
  var contentType = block[0].split(":")[1];// In this case "image/gif"
  // get the real base64 content of the file
  var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
  // Convert it to a blob to upload
  var blob = b64toBlob(realData, contentType);
	
  // var uploadFiles = el('file-input').files;
//  var uploadFiles = dataURL;
//  if (uploadFiles.length !== 1) alert("Please select a file to analyze!");

  el("analyze-button").innerHTML = "Analyzing...";
  var xhr = new XMLHttpRequest();
  var loc = window.location;
  xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/analyze`,
    true);
  xhr.onerror = function() {
    alert(xhr.responseText);
  };
  xhr.onload = function(e) {
    if (this.readyState === 4) {
      var response = JSON.parse(e.target.responseText);
      el("result-label").innerHTML = `Result = ${response["result"]}`;
	  $('div#fotoresultaat').hide();
	  $('div#camera').show();
	  dataURL = '0';
    }
    el("analyze-button").innerHTML = "Analyze";
  };

  var fileData = new FormData();
  fileData.append("file", blob);
  xhr.send(fileData);
}
