function startVideo(video) {
    // Video must have height and width in order to be used as input for NN
    // Aspect ratio of 3/4 is used to support safari browser.
        video.width = video.width || 640;
        video.height = video.height || video.width * (3 / 4)
  
        return new Promise(function (resolve, reject) {
          navigator.mediaDevices
                .getUserMedia({
                  audio: false,
                  video: {
                    facingMode: "user"
                  }
                }).then(stream => {
                  //window.localStream = stream;
                  video.srcObject = stream
                  video.onloadeddata = () => {
                        video.play()
                        resolve(true)
                  }
                }).catch(function (err) {
                  resolve(false)
                });
    });
  }
  
  function beginVideo() {
      startVideo(video).then(function(status) {
          if(status) {
              console.log("video on")
          }
      })
  }
  
  function renderPredictions(boxes, canvas, context, mediasource, flip) {
  
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = mediasource.width;
      canvas.height = mediasource.height;
      //console.log("render", mediasource.width, mediasource.height)
  
      context.save();
      if (flip) {
            context.scale(-1, 1);
            context.translate(-mediasource.width, 0);
      }
      context.drawImage(mediasource, 0, 0, mediasource.width, mediasource.height);
      context.restore();
      context.font = "20px Arial";
  
      // console.log('number of detections: ', predictions.length);
      for (let i = 0; i < boxes.length; i++) {
            context.beginPath();
            context.fillStyle = "rgba(255, 255, 255, 0.6)";
            context.fillRect(boxes[i]["left"], boxes[i]["top"] - 17, boxes[i]["width"], 17)
            context.rect(boxes[i]["left"], boxes[i]["top"], boxes[i]["width"], boxes[i]["height"]);
  
    // draw a dot at the center of bounding box
  
            context.lineWidth = 1;
            context.strokeStyle = '#0063FF';
            context.fillStyle = "#0063FF" // "rgba(244,247,251,1)";
            context.fillRect(boxes[i]["left"] + (boxes[i]["width"] / 2), boxes[i]["top"] + (boxes[i]["height"] / 2), 5, 5)
  
            context.stroke();
            context.fillText(
              boxes[i]["label"] + ": " + (Math.round(100*parseFloat(boxes[i]["score"]))/100).toString(),
              boxes[i]["left"], boxes[i]["top"]);
      }
  
  // Write FPS to top left
      //context.font = "bold 12px Arial"
      //context.fillText("[FPS]: " + FPS, 10, 20)
  }
  
  async function runDetection() {
      model.detectAndBox(video).then(boxes => {
          //var canvas = document.getElementById("myCanvas");
          //var context = canvas.getContext("2d");
          //renderPredictions(boxes, canvas, context, video, true)
          for (let i = 0; i < boxes.length; i++) {
              if (boxes[i]["label"] == "circle") {
                  let midval = boxes[i]["left"] + boxes[i]["width"] / 2
                  //лютый подгон под canvas
                  midval = 1.5*midval - 5;
                  prevMouseX = mouseX
                  prevMouseY = mouseY
                  recMouseX = midval;
                  recMouseY = 1.2*(boxes[i]["top"] + boxes[i]["height"]/2)
              }
              else if (boxes[i]["label"] == "finger up") {
                  if(mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]){
                      
                      //Постановка флага начала игры в sessionStorage
                      sessionStorage.setItem('levelcount', 1);
  
                      //Остановка музыки
                      mainMenuTheme.pause();
  
                      //Переход в файл game.html
                      document.location.href = "game.html";
  
                      //Удаление listener'ов для мыши
                      canvas.removeEventListener("mousemove", checkPos);
                      canvas.removeEventListener("mouseup", checkClick1);   
                  }
              }
          }
          if(mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]){
                  ballVisible = true;
                  ballX[0] = buttonX[0] - (ballWidth/2) - 2;
                  ballY[0] = buttonY[0]+40;
                  ballX[1] = buttonX[0] + buttonWidth[0] + (ballWidth/2); 
                  ballY[1] = buttonY[0]+40;
  
          }else
          if(mouseX > buttonX[1] && mouseX < buttonX[1] + buttonWidth[1] && mouseY > buttonY[1] && mouseY < buttonY[1] + buttonHeight[1]){
                  ballVisible = true;
                  ballX[0] = buttonX[1] - (ballWidth/2) - 2;
                  ballY[0] = buttonY[1]+40;
                  ballX[1] = buttonX[1] + buttonWidth[1] + (ballWidth/2); 
                  ballY[1] = buttonY[1]+40;
  
          }else{
              ballVisible = false; 
              } 
      });
  }
  
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      var Pressed = false;							
      var flag = -1;
      
  //Рисовалка рамки по периметру canvas
      function drawFrame(){
          //цвет линии
          ctx.strokeStyle = '#ffffff';
          //ширина линии
          ctx.lineWidth = 1;
          //Нарисовать прямоугольник  
          ctx.strokeRect(0, 0, 900, 563);
      }
  
  //Слушатель позиции мышки
      canvas.addEventListener("mousemove", checkPos);
  
  //Слушатели нажатия кнопки клавиатуры в меню	
      document.addEventListener("keydown", keyDownHandler, false); 							
      document.addEventListener("keyup", keyUpHandler, false);	 							
      
      function keyDownHandler(e) { 							
          if(e.keyCode == 66) {
              Pressed = true;
              flag += 1;
              if (flag == 3) {
                  flag = 0;
              }
          }
      }
  
      function keyUpHandler(e) { 							
          if(e.keyCode == 66) {
              Pressed = false;
          }
      }
      
  //Картинки для меню в качестве переменных
      var backgroundImage = new Image(); 
      var snowImage = new Image();   
      var logoImage = new Image();
      var yoloImage = new Image();
      var playImage = new Image();
      var ratingImage = new Image();
      var ballImage = new Image();
  
  //timer
      var frames = 30;
      var timerId = 0;
  
  //непосредственное обновление картинки через периодический вызов функции update
      //imerId = setInterval(update, 1000/frames);
      
  //Переменные движения
      var backgroundY = 0;
      var speedSnow = 1;
  
  //Переменные для тслеживания позиции мышки на экране
      var mouseX;
      var mouseY;
  
  //Переменные для описания шарика и его положений
      var ballX = [0,0];
      var ballY = [0,0];
      var ballWidth = 50;
      var ballHeight = 50;
   
      var ballVisible = false;
      var ballSize = ballWidth;
      var ballRotate = 0;
      var ballRadius = 10;
  
  //Переменные для размеров кнопок
      var buttonX = [205, 300];   //Положение по Х кнопок
      var buttonY = [220, 400];   //Положение по Y кнопок
      var buttonWidth = [300, 450];   //Ширина кнопки
      var buttonHeight = [100, 100];  //Высота кнопки
  
  //Проверка нажатия мыши
      var fadeId = 0;
      canvas.addEventListener("mouseup", checkClick1);    //Listener для кнопки Play 
      canvas.addEventListener("mouseup", checkClick2);    //Listener для кнопки Rating
  
  //переменная времени
      var time = 0.0;
  
  //Сорсы картинок
      backgroundImage.src = "images/background.png";
      logoImage.src = "images/logo.png";  
      yoloImage.src = "images/yolo.png";  
      playImage.src = "images/play.png";
      ratingImage.src = "images/rating.png";
      ballImage.src = "images/ball.png";
      snowImage.src = "images/snow.png";
  
  //Инициализация массива изображений
      var Images = [];
      for(var i = 0; i < 3; i++) {
          Images[i] = new Image();
      }
      Images[0].src = "images/background.png";
      Images[1].src = "images/lvl1.png";
      Images[2].src = "images/background1.png";
  
  
  //Музыка меню
      var mainMenuTheme = new Audio("sounds/main_menu_theme.mp3");
      mainMenuTheme.volume = 0.5;
      var sound = 0;
      
    
  //Функции отрисовки картинок на экран
      function drawbackground(){
          ctx.drawImage(backgroundImage, 0, 0);
      }
      
      //Выбор картинок фона из массива (Смена при нажатии кнопки B)
      function backgroundchanger(){ 
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
          ctx.drawImage(snowImage, 0, backgroundY - 563);
      }
  
  //Обновление всей картинки и всего-всего
      function update() {
          clear();
          move();
          step()
          if (sound == 0) {
              mainMenuTheme.play();
              sound++;
          }
          if (mainMenuTheme.ended == true) {
              sound = 0;
          }
      }
  
      function step() {
          //requestAnimationFrame(step);
          draw();
          if (initial_seed % delay == 0) {
              initial_seed = initial_seed % delay;
              runDetection()
          }
          mouseX = mouseX + (recMouseX - prevMouseX)/delay
          mouseY = mouseY + (recMouseY - prevMouseY)/delay
          initial_seed++;
      }
  
  
  //Описание функций для update()
      function clear(){
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
  
      function move(){
          backgroundY += speedSnow;
          if(backgroundY == 1 * canvas.height){
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
  //Функция рисования всего
      function draw(){
          if (Pressed == true) {		 							
              backgroundchanger();
          }
          drawbackground();
          drawFrame();
          drawsnow();
          drawlogo();
          drawplay();
          drawrating();
          if(ballVisible == true){
              ctx.drawImage(ballImage, ballX[0] - (ballSize/2), ballY[0], ballSize, ballHeight);
              ctx.drawImage(ballImage, ballX[1] - (ballSize/2), ballY[1], ballSize, ballHeight);
          }
          drawCursor();
      }
  
  //Остальные возможности   
  ////////////////////////////////////////////////////////////////////////////
  //Функция проверки положения мыши на экране в зависимости от положения кнопок
      function checkPos(mouseEvent){
          mouseX = mouseEvent.pageX - this.offsetLeft;
          mouseY = mouseEvent.pageY - this.offsetTop;
  
          if(mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]){
                  ballVisible = true;
                  ballX[0] = buttonX[0] - (ballWidth/2) - 2;
                  ballY[0] = buttonY[0]+40;
                  ballX[1] = buttonX[0] + buttonWidth[0] + (ballWidth/2); 
                  ballY[1] = buttonY[0]+40;
  
          }else
          if(mouseX > buttonX[1] && mouseX < buttonX[1] + buttonWidth[1] && mouseY > buttonY[1] && mouseY < buttonY[1] + buttonHeight[1]){
                  ballVisible = true;
                  ballX[0] = buttonX[1] - (ballWidth/2) - 2;
                  ballY[0] = buttonY[1]+40;
                  ballX[1] = buttonX[1] + buttonWidth[1] + (ballWidth/2); 
                  ballY[1] = buttonY[1]+40;
  
          }else{
              ballVisible = false; 
              } 
      }  
  
  //Проверка нажатия мыши
  //Проверка нажатия на кнопку PLAY
  function checkClick1(mouseEvent){
              if(mouseX > buttonX[0] && mouseX < buttonX[0] + buttonWidth[0] && mouseY > buttonY[0] && mouseY < buttonY[0] + buttonHeight[0]){
                      
                      //Постановка флага начала игры в sessionStorage
                      sessionStorage.setItem('levelcount', 1);
  
                      //Остановка музыки
                      mainMenuTheme.pause();
  
                      //Переход в файл game.html
                      document.location.href = "game.html";
  
                      //Удаление listener'ов для мыши
                      canvas.removeEventListener("mousemove", checkPos);
                      canvas.removeEventListener("mouseup", checkClick1);   
              }
          }
  //Проверка нажатия на кнопку RATING
  function checkClick2(mouseEvent){
              if(mouseX > buttonX[1] && mouseX < buttonX[1] + buttonWidth[1] && mouseY > buttonY[1] && mouseY < buttonY[1] + buttonHeight[1]){
  
                      //Остановка музыки
                      mainMenuTheme.pause();
  
                      //Submit для формы перехода в Rating
                      document.forms["rating"].submit();
  
                      //Удаление listener'ов для мыши
                      canvas.removeEventListener("mousemove", checkPos);
                      canvas.removeEventListener("mouseup", checkClick2);   
              }
          }
      
      var video = document.getElementById("myvideo");
      var canvas = document.getElementById("myCanvas");
      var prevMouseX = canvas.width/2
      var prevMouseY = canvas.height/2
      var recMouseX = canvas.width/2
      var recMouseY = canvas.height/2
      var delay = 2;
      var initial_seed = 0;
      var ctx = canvas.getContext("2d");
      var model = new TinyYoloV3();
      model.load("http://127.0.0.1:5000/game/models/yolov3-tiny_12k_graph/model.json").then(model => {
          beginVideo()
          //timeId = setInterval(step, videoInterval);
          timeId = setInterval(update, 1000/frames);
          //step()
      })