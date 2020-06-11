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
    var time1 = Date.now();
    model.detectAndBox(video).then(boxes => {
        if (ready == 0) {
            ready = 1;
        }
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i]["label"] == "circle") {
                let rawvalX = boxes[i]["left"] + boxes[i]["width"] / 2;
                let rawvalY = boxes[i]["top"] + boxes[i]["height"] / 2;

                prevMouseX = mouseX;
                prevMouseY = mouseY;

                recMouseX = canvas.width * rawvalX / 640;
                recMouseY = canvas.height * rawvalY / 480;
            }
            else if (boxes[i]["label"] == "finger up") {
                if (mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]) {
                    sessionStorage.setItem('levelcount', 1);
                    mainMenuTheme.pause();

                    document.location.href = "game.html";

                    canvas.removeEventListener("mousemove", checkPos);
                    canvas.removeEventListener("mouseup", checkClick1);   
                }
            }
        }
        if (mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]) {
            ballVisible = true;
            ballX[0] = buttonX[0] - (ballWidth / 2) - 2;
            ballY[0] = buttonY[0] + 40;
            ballX[1] = buttonX[0] + buttonWidth[0] + (ballWidth / 2); 
            ballY[1] = buttonY[0] + 40;
        }
        else if (mouseX > buttonX[1] && mouseX < buttonX[1] + buttonWidth[1] && mouseY > buttonY[1] && mouseY < buttonY[1] + buttonHeight[1]) {
            ballVisible = true;
            ballX[0] = buttonX[1] - (ballWidth/2) - 2;
            ballY[0] = buttonY[1] + 40;
            ballX[1] = buttonX[1] + buttonWidth[1] + (ballWidth / 2); 
            ballY[1] = buttonY[1] + 40;
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

function keyDownHandler(e) { 							
    if (e.keyCode == 66) {
        Pressed = true;
        flag += 1;
        if (flag == 3) {
            flag = 0;
        }
    }
}

function keyUpHandler(e) { 							
    if (e.keyCode == 66) {
        Pressed = false;
    }
}

function drawbackground() {
    ctx.drawImage(backgroundImage, 0, 0);
}

function backgroundchanger() { 
    if (Pressed == true) {
        if (flag == 0) {
            backgroundImage = Images[0];
            drawbackground();
        }
        else if (flag == 1) {
            backgroundImage = Images[1];
            drawbackground();
        }
        else if (flag == 2) {
            backgroundImage = Images[2];
            drawbackground();
        }
    }
}

function drawlogo() {
    ctx.drawImage(logoImage, 80, 50);
    ctx.drawImage(yoloImage, 550, 120, 150, 75);
}

function drawplay() {
    ctx.drawImage(playImage, 200, 220);
}

function drawrating() {
    ctx.drawImage(ratingImage, 300, 400);
}

function drawsnow() {
    ctx.drawImage(snowImage, 0, backgroundY - canvas.height);
}

function drawloading() {
    ctx.drawImage(loadingImage, canvas.width / 2 - loadingImage.width / 2, canvas.height / 2 - loadingImage.height / 2);
}

function update() {
    clear();
    move();
    step();
    if (sound == 0) {
        mainMenuTheme.play();
        sound++;
    }
    if (mainMenuTheme.ended == true) {
        sound = 0;
    }
}

function step() {
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
    mouseX = mouseX + (recMouseX - prevMouseX) / delay;
    mouseY = mouseY + (recMouseY - prevMouseY) / delay;
    initial_seed++;
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

function draw() {
    if (Pressed == true) {		 							
        backgroundchanger();
    }
    drawbackground();
    drawFrame();
    drawsnow();
    drawlogo();
    drawplay();
    drawrating();
    if (ballVisible == true) {
        ctx.drawImage(ballImage, ballX[0] - (ballSize / 2), ballY[0], ballSize, ballHeight);
        ctx.drawImage(ballImage, ballX[1] - (ballSize / 2), ballY[1], ballSize, ballHeight);
    }
    drawCursor();
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("FPS: " + FPS, 10, 20);
}

function checkPos(mouseEvent) {
    mouseX = mouseEvent.pageX - this.offsetLeft;
    mouseY = mouseEvent.pageY - this.offsetTop;
    if (mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]) {
        ballVisible = true;
        ballX[0] = buttonX[0] - (ballWidth / 2) - 2;
        ballY[0] = buttonY[0] + 40;
        ballX[1] = buttonX[0] + buttonWidth[0] + (ballWidth / 2); 
        ballY[1] = buttonY[0] + 40;
    }
    else if (mouseX > buttonX[1] && mouseX < buttonX[1] + buttonWidth[1] && mouseY > buttonY[1] && mouseY < buttonY[1] + buttonHeight[1]) {
        ballVisible = true;
        ballX[0] = buttonX[1] - (ballWidth / 2) - 2;
        ballY[0] = buttonY[1] + 40;
        ballX[1] = buttonX[1] + buttonWidth[1] + (ballWidth / 2); 
        ballY[1] = buttonY[1] + 40;
    }
    else {
        ballVisible = false; 
    } 
}

function checkClick1(mouseEvent) {
    if (mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]) {
        sessionStorage.setItem("levelcount", 1);
        mainMenuTheme.pause();

        document.location.href = "game.html";

        canvas.removeEventListener("mousemove", checkPos);
        canvas.removeEventListener("mouseup", checkClick1);   
    }
}

//TODO: remove rating
function checkClick2(mouseEvent) {
    if (mouseX > buttonX[1] && mouseX < buttonX[1] + buttonWidth[1] && mouseY > buttonY[1] && mouseY < buttonY[1] + buttonHeight[1]) {
        mainMenuTheme.pause();
        document.forms["rating"].submit();
        canvas.removeEventListener("mousemove", checkPos);
        canvas.removeEventListener("mouseup", checkClick2);   
    }
}

var canvas = document.getElementById("myCanvas");
var video = document.getElementById("myvideo");
var ctx = canvas.getContext("2d");
canvas.addEventListener("mousemove", checkPos);
document.addEventListener("keydown", keyDownHandler, false); 							
document.addEventListener("keyup", keyUpHandler, false);	
canvas.addEventListener("mouseup", checkClick1);
canvas.addEventListener("mouseup", checkClick2); 							
      
var backgroundImage = new Image(); 
var snowImage = new Image();   
var logoImage = new Image();
var yoloImage = new Image();
var playImage = new Image();
var ratingImage = new Image();
var ballImage = new Image();
var loadingImage = new Image();
backgroundImage.src = "images/background.png";
snowImage.src = "images/snow.png";
logoImage.src = "images/logo.png";  
yoloImage.src = "images/yolo.png";  
playImage.src = "images/play.png";
ratingImage.src = "images/rating.png";
ballImage.src = "images/ball.png";
loadingImage.src = "images/loading.png";
var Images = [];
for (var i = 0; i < 3; i++) {
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
var ballSize = ballWidth;
var ballRotate = 0;
var ballRadius = 10;
  
var buttonX = [205, 300];
var buttonY = [220, 400];
var buttonWidth = [300, 450];
var buttonHeight = [100, 100];

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

model.load("http://127.0.0.1:5000/game/models/yolov3-tiny_12k_graph/model.json").then(() => {
    beginVideo()
    timeId = setInterval(update, 1000 / frames);
})