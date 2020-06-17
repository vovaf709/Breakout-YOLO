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
        if (status) {
            console.log("video on");
        }
    })
}
  
function renderPredictions(boxes, canvas, context, mediasource, flip) {
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
    		boxes[i]["label"] + ": " + (Math.round(100 * parseFloat(boxes[i]["score"])) / 100).toString(),
    		boxes[i]["left"], boxes[i]["top"]);
	}
}
  
async function runDetection() {
    circled = 0;
    let time1 = Date.now();
    model.detectAndBox(video).then(boxes => {
        if (ready == 0) {
            ready = 1;
        }
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i]["label"] == "circle") {
                circled = 1;
                let rawvalX = boxes[i]["left"] + boxes[i]["width"] / 2;
                let rawvalY = boxes[i]["top"] + boxes[i]["height"] / 2;

                prevMouseX = mouseX;
                prevMouseY = mouseY;

                recMouseX = canvas.width * rawvalX / 640;
                recMouseY = canvas.height * rawvalY / 480;
            }
            else if (boxes[i]["label"] == "finger up") {
                if (mouseX > buttonX && mouseX < buttonX + playImage.width && mouseY > buttonY && mouseY < buttonY + playImage.height) {
                    sessionStorage.setItem("levelcount", 1);
                    mainMenuTheme.pause();
                    document.location.href = "game.html"; 
                }
            }
        }
        if (mouseX > buttonX && mouseX < buttonX + playImage.width && mouseY > buttonY && mouseY < buttonY + playImage.height) {
            ballVisible = true;
        }
        else {
            ballVisible = false; 
        } 
    });
    FPS = Math.round(1000 / (Date.now() - time1));
}

function drawFrame() {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawbackground() {
    ctx.drawImage(backgroundImage, 0, 0);
}

function drawlogo() {
    ctx.drawImage(logoImage, 80, 50);
    ctx.drawImage(yoloImage, 550, 120, 150, 75);
}

function drawplay() {
    ctx.drawImage(playImage, buttonX, buttonY);
}

function drawsnow() {
    ctx.drawImage(snowImage, 0, backgroundY - canvas.height);
}

function drawloading() {
    ctx.drawImage(loadingImage, canvas.width / 2 - loadingImage.width / 2, canvas.height / 2 - loadingImage.height / 2);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    move();
    if (sound == 0) {
        mainMenuTheme.play();
        sound++;
    }
    if (mainMenuTheme.ended == true) {
        sound = 0;
    }
    if (ready == 1) {
        draw();
    }
    else {
        drawloading();
    }
    if (initial_seed % delay == 0) {
        initial_seed = initial_seed % delay;
        runDetection();
    }
    mouseX = mouseX + circled * (recMouseX - prevMouseX) / delay;
    mouseY = mouseY + circled * (recMouseY - prevMouseY) / delay;
    initial_seed++;
}

function move() {
    backgroundY += speedSnow;
    if (backgroundY == canvas.height) {
        backgroundY = 0;
    }
}

function drawCursor() {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    if (ballVisible) {
        ctx.drawImage(ballImage, buttonX - (ballWidth / 2) - (ballWidth / 2), buttonY + (playImage.height / 4), ballWidth, ballHeight);
        ctx.drawImage(ballImage, buttonX + playImage.width + (ballWidth / 2) - (ballWidth / 2), buttonY + (playImage.height / 4), ballWidth, ballHeight);
    }
}

function drawFPS() {
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("FPS: " + FPS, 10, 20);
}

function draw() {
    drawbackground();
    drawFrame();
    drawsnow();
    drawlogo();
    drawplay();
    drawBall();
    drawCursor();
    drawFPS();
}

var canvas = document.getElementById("myCanvas");
var video = document.getElementById("myvideo");
var ctx = canvas.getContext("2d");							
      
var backgroundImage = new Image(); 
var snowImage = new Image();   
var logoImage = new Image();
var yoloImage = new Image();
var playImage = new Image();
var ballImage = new Image();
var loadingImage = new Image();
backgroundImage.src = "images/background.png";
snowImage.src = "images/snow.png";
logoImage.src = "images/logo.png";  
yoloImage.src = "images/yolo.png";  
playImage.src = "images/play.png";
ballImage.src = "images/ball.png";
loadingImage.src = "images/loading.png";
var Images = [];
for (let i = 0; i < 3; i++) {
    Images[i] = new Image();
}
Images[0].src = "images/background.png";
Images[1].src = "images/lvl1.png";
Images[2].src = "images/background1.png";

var mainMenuTheme = new Audio("sounds/main_menu_theme.mp3");
mainMenuTheme.volume = 0.5;
var sound = 0; 
  
var frames = 30;
  
var backgroundY = 0;
var speedSnow = 1;
  
var mouseX = canvas.width / 2;
var mouseY = canvas.height / 2;
  
var ballX = [0,0];
var ballY = [0,0];
var ballWidth = 50;
var ballHeight = 50;
   
var ballVisible = false;
var ballRadius = 10;
  
var buttonX = 250;
var buttonY = 220;

var Pressed = false;							
var flag = -1;
var prevMouseX = canvas.width / 2;
var prevMouseY = canvas.height / 2;
var recMouseX = canvas.width / 2;
var recMouseY = canvas.height / 2;
var delay = 2;
var initial_seed = 0;
var model = new TinyYoloV3();
var ready = 0;
var FPS = 0;
var circled = 0;

model.load("models/yolov3-tiny_12k_graph/model.json").then(() => {
    beginVideo()
    timeId = setInterval(update, 1000 / frames);
})