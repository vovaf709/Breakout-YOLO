function startVideo(video) {
  	video.width = video.width || 640;
  	video.height = video.height || video.width * (3 / 4);

  	return new Promise(function (resolve, reject) {
    	navigator.mediaDevices.getUserMedia({
        	audio: false,
        	video: {facingMode: "user"}
     	}).then(stream => {
       	 	video.srcObject = stream
       	 	video.onloadedmetadata = () => {
          		video.play();
          		resolve(true);
        	}
      	}).catch(function (err) {
        	resolve(false);
      	});
  	});
}

function beginVideo() {
	startVideo(video).then(function(status) {
		if(status) {
    		runDetection(true);
		}
	})
}

function runDetection(flip) {
  	var timeBegin = Date.now();

	model.detectAndBox(video, flip).then(boxes => {
      	var timeEnd = Date.now();
      	var FPS = Math.round(1000 / (timeEnd - timeBegin));
      	var canvas = document.getElementById("myCanvas");
     	var context = canvas.getContext('2d');
		 
		renderPredictions(boxes, canvas, context, video, flip, FPS);
		requestAnimationFrame(runDetection);
	});
}

function renderPredictions(boxes, canvas, context, mediasource, flip, FPS) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.width = mediasource.width;
	canvas.height = mediasource.height;

	var colors = {
		"finger up": "#ff0000",
		"pistol": "#00ff00",
		"circle": "#0000ff",
		"fist": "#ffff00"
	};

	context.save();
	if (flip) {
  		context.scale(-1, 1);
  		context.translate(-mediasource.width, 0);
	}
	
	context.drawImage(mediasource, 0, 0, mediasource.width, mediasource.height);
	context.restore();
	context.font = '18px Arial';

	for (let i = 0; i < boxes.length; i++) {
  		context.beginPath();
  		context.fillStyle = colors[boxes[i]["label"]];
  		context.fillRect(boxes[i]["left"], boxes[i]["top"] - 17, boxes[i]["width"], 17);
  		context.rect(boxes[i]["left"], boxes[i]["top"], boxes[i]["width"], boxes[i]["height"]);

 		context.lineWidth = 1;
  		context.strokeStyle = colors[boxes[i]["label"]];
  		context.fillStyle = colors[boxes[i]["label"]];
  		context.fillRect(boxes[i]["left"] + (boxes[i]["width"] / 2), boxes[i]["top"] + (boxes[i]["height"] / 2), 5, 5);

		context.stroke();
		context.fillStyle = "#000000";  
  		context.fillText(
    		boxes[i]["label"] + ": " + (Math.round(100*parseFloat(boxes[i]["score"]))/100).toString(),
    		boxes[i]["left"], boxes[i]["top"]);
	}

	context.font = "bold 12px Arial";
	context.fillStyle = "#000000";
	context.fillText("[FPS]: " + FPS, 10, 20);
}

var canvas = document.getElementById("myCanvas");
var video = document.getElementById("videoElement");
var model = new TinyYoloV3();
var time1 = Date.now();
model.load("models/yolov3-tiny_10k_graph/model.json").then(() => {
	console.log(Date.now() - time1);
  	beginVideo();
})