document.addEventListener('DOMContentLoaded', function() {



 
});
   
var sound1 = '../static/button-50.mp3';
var sound2 = '../static/water-splash.wav';
var sound3 = '';
   

function iconhide() {
	var audio = new Audio(sound1);
	audio.loop = false;
	audio.play();
  var x = document.getElementById("fotoresultaat");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
	document.getElementById("fotoresultaat").classList.add("hidden");
	$('a#grabFrameDisabled').hide();
	$('a#grabFrame').show();
	$('i#iconcancel').hide();
	$('a#analyze-buttonDisabled').show();
	$('a#analyze-button').hide();
	document.getElementById("image-picked").removeAttribute("src");
	document.getElementById("result-label").innerHTML = "Please take a new photo. You can do this, we believe in you!";
  }	
}

   
function playsound() {
    var audio = new Audio(sound1);
	audio.loop = false;
	audio.play(); 
}  
function playsound2() {
    var audio = new Audio(sound2);
	audio.loop = false;
	audio.play(); 
}


var el = x => document.getElementById(x);






var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;  

  



function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}




function showPicker() {
  el("file-input").click();
}

function showPicked(input) {
  var reader = new FileReader();
  reader.onload = function(e) {
    el("image-picked").src = e.target.result;
    el("image-picked").className = "";
    var element = document.getElementById("fotoresultaat");
    element.classList.remove("hidden");
	$('i#iconcancel').show();
	document.getElementById("result-label").innerHTML = "Tip: make sure your background is clean, and keep your face as straight as possible. Press 'Analyze Face' to continue, or take a new photo.";
	$('a#grabFrame').hide();
	$('a#grabFrameDisabled').show();
	$('a#analyze-buttonDisabled').hide();
	$('a#analyze-button').show();
  };
  reader.readAsDataURL(input.files[0]);
}   




function analyze() {
 var uploadFiles = el("file-input").files;

  $('i#iconcancel').hide();
  $('a#analyze-buttonDisabled').show();
  
  
  $('div#timer').show();
  var kip = setInterval(setTime, 1000);
  
  $('a#analyze-button').hide();
  el("result-label").innerHTML = "Please wait. This could take up to 30 seconds.";
  el("analyzetext").innerHTML = "Analyzing..."  
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
      el("result-label").innerHTML = `You have ${response["result"]}!`;
	  $('div#fotoresultaat').hide();
	  $('div#camera').show();
	  dataURL = '0';
	  $('div#timer').hide();
	  clearInterval(kip);
	  var audio = new Audio(sound2);
	  audio.loop = false;
	  audio.play();
    }
    el("analyzetext").innerHTML = "Analyze Face";
    $('i#iconanalyze').show();
	$('a#grabFrameDisabled').hide();
	$('a#grabFrame').show();
	$('i#iconcancel').show();
	totalSeconds = 0;
	el("minutes").innerHTML = "00";
	el("seconds").innerHTML = "00";
  };

  var fileData = new FormData();
  fileData.append("file", uploadFiles[0]);
  xhr.send(fileData);
}

