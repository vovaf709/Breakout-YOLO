function startVideo(video) {
    // Video must have height and width in order to be used as input for NN
    // Aspect ratio of 3/4 is used to support safari browser.
        video.width = video.width || 640;
        video.height = video.height || video.width * (3 / 4)
  
        return new Promise(function (resolve, reject) {
          navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {facingMode: "user"}
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
      context.font = '20px Arial';
  
      for (let i = 0; i < boxes.length; i++) {
            context.beginPath();
            context.fillStyle = "rgba(255, 255, 255, 0.6)";
            context.fillRect(boxes[i]["left"], boxes[i]["top"] - 17, boxes[i]["width"], 17)
            context.rect(boxes[i]["left"], boxes[i]["top"], boxes[i]["width"], boxes[i]["height"]);
  
            // draw a dot at the center of bounding box
  
            context.lineWidth = 1;
            context.strokeStyle = '#0063FF';
            context.fillStyle = "#0063FF";
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
        if (ready == 0) {
            ready = 1;
        }
          var fisted = 0
          //var canvas = document.getElementById("myCanvas");
          //var context = canvas.getContext("2d");
          //renderPredictions(boxes, canvas, context, video, true)
          for (let i = 0; i < boxes.length; i++) {
              if (boxes[i]["label"] == "fist") {
                  fisted = 1
                  prevPaddleX = paddleX;
                  let midval = boxes[i]["left"] + boxes[i]["width"] / 2
                  //лютый подгон под canvas
                  midval = 1.5*midval - 5;
                  relativeX = midval;
                  if(relativeX > paddleWidth/2 && relativeX < canvas.width - paddleWidth/2) {
                         recPaddleX = relativeX - paddleWidth/2;
                  }
                  else if(relativeX <= paddleWidth/2 ) {
                      recPaddleX = 0;
                  }
                  else if(relativeX >= canvas.width - paddleWidth/2) {
                      recPaddleX = canvas.width - paddleWidth;
                     }
              }
              else if (boxes[i]["label"] == "pistol") {
                  spacePressed = 1;
                  if (sticked == 1){
                      fireSound.play()
                  }
                  sticked = 0;
              }
              else if ((boxes[i]["label"] == "finger up") && (pause == 0) && (first_collision > 0)) {
                              spacePressed = false;
                              begun = 1;
                              pause = 1;
                              pauseVar = (pauseVar + 1) % pauseDelay;
                          }
                          else if ((boxes[i]["label"] == "circle") && (pause == 1)) {
                              spacePressed = 1;
                              begun = 1;
                              pause = 0;
                          }
          }
          if (fisted == 0) {
              recPaddleX = prevPaddleX;
          }
      });
  }
  
      var video = document.getElementById("myvideo");
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      var x = 0;
      var y = 0;
      var videoInterval = 10;
      var initial_seed = 0;
      var delay = 20;
      
  //Рисовалка рамки по периметру canvas
      function drawFrame(){
          //цвет линии
          ctx.strokeStyle = '#ffffff';
          //ширина линии
          ctx.lineWidth = 1;
          //Нарисовать прямоугольник  
          ctx.strokeRect(0, 0, 900, 570);
      }
  
      var smoothDelta = 0;
      var paddleWidth = 125;
      var relativeX = (canvas.width-paddleWidth) / 2;
      //Параметры лопатки
      var paddleHeight = 10;	//Высота лопатки	//Ширина лопатки
      var paddleX = (canvas.width-paddleWidth) / 2;	//Координата левого края лопатки
      var recPaddleX = (canvas.width-paddleWidth) / 2;  //Предсказананя координата левого края лопатки
      var prevPaddleX = (canvas.width-paddleWidth) / 2;  //Координата левого края лопатки на предыдущем предскзании
      var prevHandY = canvas.height;
      var HandY = canvas.height;
      var thresholdY = 100;
      var sounded = 0;
      var pauseVar = 0;
      var pauseDelay = 1000000;
  
  //Названия уровней
      lvlname = [];
      lvlname[0] = "City of fools";
      lvlname[1] = "Takeoff";
      lvlname[2] = "Dawn";
      lvlname[3] = "Nightside";
      lvlname[4] = "Sweet dreams";
  
  //Картинка меню паузы и старта игры
      var pauseImage = new Image();
      pauseImage.src = "images/pause.png";
  
      var pauseContinueImage = new Image();
      pauseContinueImage.src = "images/pauseContinue.png";
  
      var spaceStartImage = new Image();
      spaceStartImage.src = "images/spaceStart.png";
  
  //Прозрачность картинок меню паузы и старта игры
      var opacity = 1;
      var opacityChanger = 0.002;
  
  //background image - все картинки фона в игре
      var backgroundImageLvl1 = new Image();
      backgroundImageLvl1.src = "images/lvl1.png";
      
      var backgroundImageLvl2 = new Image();
      backgroundImageLvl2.src = "images/lvl2.png";
      
      var backgroundImageLvl3 = new Image();
      backgroundImageLvl3.src = "images/lvl3.png";
      
      var loadingImage = new Image();
      loadingImage.src = "images/loading.png";

      var backgroundImageLvl4 = new Image();
      backgroundImageLvl4.src = "images/lvl4.png";
      var levelcount = 1
      //Переключатель картинок фона в зависимости от уровня
      function drawbackground(){
          switch (levelcount) {
              case 1:
                  ctx.drawImage(backgroundImageLvl1, 0, 0);
                  break;
              case 2:
                  ctx.drawImage(backgroundImageLvl2, 0, 0);
                  break;
              case 3:
                  ctx.drawImage(backgroundImageLvl3, 0, 0);
                  break;
              case 4:
                  ctx.drawImage(backgroundImageLvl4, 0, 0);
                  break;
              default:
                  alert('Error1');
          }
      }
  
  //Звуки
      //Звук проигрыша
      var lossSound = new Audio("sounds/loss.mp3");
      lossSound.volume = 1;
  
      //Звук отрыва с липкой платформы
      var fireSound = new Audio("sounds/fire.mp3");
      fireSound.volume = 1;
  
      //Звук разбивания блока наверху
      var scoreUpSound = new Audio("sounds/score_up.mp3");
      scoreUpSound.volume = 0.6;
  
      //Звуки бонуса с увеличением и уменьшением платформы
          //Увеличение
      var PBonusPlus = new Audio("sounds/PBonus+.mp3");
      PBonusPlus.volume = 1;
          //Уменьшение
      var PBonusMinus = new Audio("sounds/PBonus-.mp3");
      PBonusMinus.volume = 1;
  
      //Звук липкого бонуса
      var SBonus = new Audio("sounds/SBonus.mp3");
      SBonus.volume = 1;
  
      //Музыка на уровнях
      var lvl1ThemeSound = new Audio("sounds/lvl1_theme.mp3");
      lvl1ThemeSound.volume = 0.5;
      var lvl2ThemeSound = new Audio("sounds/lvl2_theme.mp3");
      lvl2ThemeSound.volume = 0.5;
      var lvl3ThemeSound = new Audio("sounds/lvl3_theme.mp3");
      lvl3ThemeSound.volume = 0.5;
      var lvl4ThemeSound = new Audio("sounds/lvl4_theme.mp3");
      lvl4ThemeSound.volume = 0.5;
      var tick = new Audio("sounds/ticktack.mp3");
      var tick_fast = new Audio("sounds/ticktack_fast.mp3");
      tick.volume = 0.5;
      tick_fast.volume = 0.5;
      tickedm = 0;
  
      //Звук победы
      var winSound = new Audio("sounds/win.mp3");
      
  //Функция выбора фоновой музыки в зависимости от уровня
      function playMusic() {
          if ((sounded == 0) && (begun > 0) && (pause == 0)) {
              switch (levelcount) {
                  case 1:
                      lvl1ThemeSound.play();
                      sounded++;
                      break;
                  case 2:
                      lvl2ThemeSound.play();
                      sounded++;
                      break;
                  case 3:
                      lvl3ThemeSound.play();
                      sounded++;
                      break;
                  case 4:
                      lvl4ThemeSound.play();
                      sounded++;
                      break;
                  default:
                      alert('Error2');
              }
          }
      }
  
  //Остановка музыки в зависимости от уровня
      function stopMusic() {
          if(sounded == 1) {
              switch (levelcount) {
                  case 1:
                      lvl1ThemeSound.pause()
                      sounded = 0;
                      break;
                  case 2:
                      lvl2ThemeSound.pause()
                      sounded = 0;
                      break;
                  case 3:
                      lvl3ThemeSound.pause()
                      sounded = 0;
                      break;
                  case 4:
                      lvl4ThemeSound.pause()
                      sounded = 0;
                      break;
                  default:
                      alert('Error3');
              }
          }
      }
      
  //Счетчик уровней
      if((parseInt(sessionStorage.getItem('levelcount'))) == 1) {
          var levelcount = 1;
      }
      else {
          var levelcount = parseInt(sessionStorage.getItem('levelcount'));
          if (levelcount == 0) {
              levelcount++;
          }
      }
  
  //Переменная начала игры
      var begun = 0;
  //Переменная паузы
      var pause = 0;
  
  //Счет
      var score = 0;
      var first_collision = 0;
      if(levelcount > 1){
          score = parseInt(sessionStorage.getItem('score'));
      }
      var count = 0;
      
  //Движение
      if(levelcount == 1){
          var speed = 3;
      }
      if (levelcount > 1){
          speed = parseInt(sessionStorage.getItem('speed')) + 1;
  
          //Увеличение скорости при переходе на след уровень (для уменьшения сложности игры закомменч)
          //speed = speed + 1;
      }
  
  //Инициализация скорости шарика в направлениях X и Y в начале игры
      var speedX = 0;
      var speedY = -speed;
  
  //Параметры шарика
      var ballRadius = 10;	//Радиус шарика
  
  //Булевые нажатия кнопок на клавиатуре
      var rightPressed = false;	//Стрелка вправо
      var leftPressed = false;	//Стрелка влево
      var spacePressed = false;	//Пробел
  
  //Параметры блоков наверху
      var brickRowCount = 6;	//Количество строк блоков наверху
      var brickColumnCount = 10;	//Количество столбцов блоков наверху
      var brickWidth = 75;	//Ширина блока
      var brickHeight = 20;	//Высота блока
      var brickPadding = 5;	//отвечает за расстояние между блоками как сверху, так и сбоку
      var brickOffsetTop = 50;	//координата по y левого верхнего угла отрисовки всех блоков
      var brickOffsetLeft = 50;	//координата по x правого верхнего угла отрисовки всех блоков
  
  //Описание блоков наверху в виде массива
      //Подсчет количесва ненулевых элементов в массиве
      var countstatus = 0;
      
  //Переменная collisions отвечает за количество блоков, которых касается шарик в момент,
  //проверяемый функцией collisionDetection
      var collisions = 0;
  
  //Переменные ограничивающие функцию math.random в отражении от лопатки
      var min1=0; 
      var max1=2;
      
  //Переменные для прозрачности и ее изменения
      var transparentMax = 10;	//max непрозрачность
      var transparent = 0;	//max прозрачность
      var transDelta = 0.003;	//Прибавлялка прозрачности
      var trans = 1;
      var transFlag = 0;
      var passed = 0;
      
  //Строим блоки
      var c = 0;
      var bricks = [];
      var mass1 = 0;
      if(levelcount > 3){
          var levelweight = 3;	//Установка мах веса блоков на уровне
      }
      else {
          var levelweight = levelcount;
      }
      for(var c = 0; c<brickColumnCount; c++) {
          bricks[c] = [];
          for(var r = 0; r<brickRowCount; r++) {
              bricks[c][r] = { x: 0, y: 0, status: Math.floor(Math.random() * (max1 - min1)) + min1, weight: Math.floor(1 +
              Math.random()*levelweight), transparency: 0};
              if ((bricks[c][r].weight == 1) && (bricks[c][r].status == 1)){
                  mass1++;
              }
              if (bricks[c][r].status == 1){
                      countstatus += 1;
              }
          }
      }
      while (transparentMax > mass1) {
          transparentMax--
      }
      c = 0;
      while (c<transparentMax) {
          n = Math.floor(Math.random() * brickColumnCount);
          m = Math.floor(Math.random() * brickRowCount);
          if((n >= brickColumnCount) || (m >= brickRowCount) || (n < 0) || (m < 0)) {
              alert(String(n) + ', ' + String(m));
          }
          if ((bricks[n][m].transparency == 0) && (bricks[n][m].status == 1) && (bricks[n][m].weight == 1)) {
              bricks[n][m].transparency = 1;
              c++;
          }
      }
  
  //временной интервал обновления картинки
      //var interval = setInterval(draw, videointerval);
  
  //Listener для нажатых кнопок и мыши
      document.addEventListener("keydown", keyDownHandler, false);	//Listener нажатия кнопки
      document.addEventListener("keyup", keyUpHandler, false);	//Listener отпускания кнопки
      document.addEventListener("mousemove", mouseMoveHandler, false);	//Listener движения мыши
  
  //Нажатие кнопок
      function keyDownHandler(e) {
          if(e.key == "Right" || e.key == "ArrowRight") {	//Стрелка вправо
              rightPressed = true;
          }
          else if(e.key == "Left" || e.key == "ArrowLeft") {	//Стрелка влево
              leftPressed = true;
          }
          else if(e.keyCode == 32) {	//Пробел
              spacePressed = true;
          }
          else if(e.keyCode == 80) {	//Клавиша P (пауза)
              pausePressed = true;
              if (begun == 1){
                  if (pause == 0)
                      pause = 1;
                  else
                      pause = 0;
              }
          }
      }
  
  //Отпускание кнопок
      function keyUpHandler(e) {
          if(e.key == "Right" || e.key == "ArrowRight") {	//Стрелка вправо
              rightPressed = false;
          }
          else if(e.key == "Left" || e.key == "ArrowLeft") {	//Стрелка влево
              leftPressed = false;
          }
          else if(e.keyCode == 32) {	//Пробел
              spacePressed = false;
              begun = 1;
          }
      }
  
  //Движение мыши и paddla за ней. Мышь привязана к центру paddle
      function mouseMoveHandler(e) {
          var relativeX = e.clientX - canvas.offsetLeft;
            if((pause == 0) && (begun == 1)){
               if(relativeX > paddleWidth/2 && relativeX < canvas.width - paddleWidth/2) {
                  paddleX = relativeX - paddleWidth/2;
               }
                 else if(relativeX <= paddleWidth/2 ){
                  paddleX = 0;
                 }
                 else if(relativeX >= canvas.width - paddleWidth/2){
                  paddleX = canvas.width - paddleWidth;
                 }
            }
      }
  
  
  //Удар об угол блока
      //Удар об угол блока
      function cornerCollision(b) {
          collisions++;
          if(collisions == 1) {
              speedX = -speedX;
              speedY = -speedY;
              
          }
  
          //Уменьшение веса блока при ударе
          b.weight--;
          if(b.weight == 0) {
              b.status = 0;
              score++;
              first_collision++;
              scoreUpSound.play();
              count++;
          }
      }
  
  //Удар о горизонтальную поверхность блока
      function horizontalCollision(b) {
          collisions++;
          if(collisions == 1) {
              speedY = -speedY;
          }
  
          //Уменьшение веса блока при ударе
          b.weight--;
          if(b.weight == 0) {
              b.status = 0;
              score++;
              first_collision++;
              scoreUpSound.play();
              count++;
          }
      }
  
  //Удар о вертикальную поверхность блока
      function verticalCollision(b) {
          collisions++;
          if(collisions == 1) {
              speedX = -speedX;
          }
  
          //Уменьшение веса блока при ударе
          b.weight--;
          if(b.weight == 0) {
              b.status = 0;
              score++;
              first_collision++;
              scoreUpSound.play();
              count++;
          }
      }
      
  //Детектирование столкновения с блоками наверху (8 различных случаув)
      function collisionDetection() {
          for(var c = 0; c<brickColumnCount; c++) {
              for(var r = 0; r < brickRowCount; r++) {
                  var b = bricks[c][r];
                  if(b.status == 1) {				
                      if ((x >= b.x - ballRadius) && (x <= b.x) && (y >= b.y - ballRadius) && (y <= b.y)) { //1
                          if (Math.sqrt(Math.pow(x - b.x, 2) + Math.pow(y - b.y, 2)) <= ballRadius) {
                              cornerCollision(b);
                          }
                      } else if ((x >= b.x) && (x <= b.x + brickWidth) && (y >= b.y - ballRadius) && (y <= b.y)) { //2
                          horizontalCollision(b);
                      } else if ((x >= b.x + brickWidth) && (x <= b.x + ballRadius + brickWidth) && (y >= b.y - ballRadius) && (y <= b.y)) { //3
                          if (Math.sqrt(Math.pow(x - b.x - brickWidth, 2) + Math.pow(y - b.y, 2)) <= ballRadius) {
                              cornerCollision(b);
                          }
                      } else if ((x >= b.x + brickWidth) && (x <= b.x + ballRadius + brickWidth) && (y >= b.y) && (y <= b.y + brickHeight)) { //4
                          verticalCollision(b);
                      } else if ((x >= b.x + brickWidth) && (x <= b.x + ballRadius + brickWidth) && (y >= b.y + brickHeight) && (y <= b.y + brickHeight + ballRadius)) { //5
                          if (Math.sqrt(Math.pow(x - b.x - brickWidth, 2) + Math.pow(y - b.y - brickHeight, 2)) <= ballRadius) {
                              cornerCollision(b);
                          }
                      } else if ((x >= b.x) && (x <= b.x + brickWidth) && (y >= b.y + brickHeight) && (y <= b.y + brickHeight + ballRadius)) { //6
                          horizontalCollision(b);
                      } else if ((x >= b.x - ballRadius) && (x <= b.x) && (y >= b.y + brickHeight) && (y <= b.y + brickHeight + ballRadius)) { //7
                          if (Math.sqrt(Math.pow(x - b.x, 2) + Math.pow(y - b.y - brickHeight, 2)) <= ballRadius) {
                              cornerCollision(b);
                          }
                      } else if ((x >= b.x - ballRadius) && (x <= b.x) && (y >= b.y) && (y <= b.y + brickHeight)) { //8
                          verticalCollision(b);
                      }
                  }
                  //Проверка того, что все блоки на экране разбиты
                  if(count == countstatus) {
                      stopMusic();
                      tick.pause();
                      tick_fast.pause();
                      winSound.play();
  
                  //Выгрыш после прохождения 4 уровня
                      if ((levelcount == 4) && (passed == 0)) {
                          sessionStorage.setItem('score', score);
                          document.writeln("<body style='background-color:#000000;'> <center> <h1 style=color:#FFFFFF > YOU PASSED THE GAME, CONGRATULATIONS!!! </h1> <form action='index.html'> <button type='submit'> OKAY </button> </form> </center> </body>");
                          passed = 1;
                      }
  
                  //Продолежение игры, если не 4 уровень
                      else if (passed == 0) {
  
                          //Уведомление о переходе на след уровень
                          alert("Level " + String(levelcount) + " passed! Get ready for the next one.");
                          alert("Level " + String(levelcount+1) + ": " + lvlname[levelcount]);
                          
                          //Подгрузка важных значений в session storage
                          sessionStorage.setItem('score', score);
                          sessionStorage.setItem('speed', speed);
                          count = 0;
                          levelcount++;
                          sessionStorage.setItem('levelcount', levelcount);
  
                          //Перезагрука всего документа
                          document.location.reload();
                      }
                  }
              }
          }
          collisions = 0;
      } 
  
  //Вывод счета на экран 
      function drawScore() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.fillText("Score: " + score, 8, 20);
      }
  
  //Вывод уровня на экран
      function drawLevel() {
          ctx.font = "16px Arial";
          ctx.fillStyle = "#ff0000";
          ctx.fillText("Level: " + levelcount, 100, 20);
      }
  
  //Рисование скорости
      function drawspeed() {
              ctx.font = "16px Arial";
              ctx.fillStyle = "#008000";
              if (speed == 0) {
                  ctx.fillText("Speed: " + (0), 185, 20);
              }
              else {
                  ctx.fillText("Speed: " + (speed-1), 185, 20);
              }
      }
  
  //Рисование шарика
      function drawBall() {
          ctx.beginPath();
  
              ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  
              //Градиент у шарика
              var grd = ctx.createRadialGradient(x-ballRadius/4, y-ballRadius/4, ballRadius/4, x, y, ballRadius);
              grd.addColorStop(0,"white");
              grd.addColorStop(1,"red");
              ctx.fillStyle = grd;
              ctx.fill();
  
          ctx.closePath();
      }
  
      function drawTarget() {
          ctx.beginPath();
  
              ctx.moveTo(recPaddleX + paddleWidth/2, canvas.height);
              ctx.lineTo(recPaddleX + paddleWidth/2 + paddleHeight, canvas.height - paddleHeight);
              ctx.lineTo(recPaddleX + paddleWidth/2 - paddleHeight, canvas.height - paddleHeight);
              ctx.fillStyle = "#FFBD00"
              ctx.fill();
  
          ctx.closePath();
      }
  
  //Рисование лопатки
      function drawPaddle() {
          ctx.beginPath();
          ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
          
          //Проверка наличия пойманного бонуса
          if (bonusSActive == 1) {
              var gradP = ctx.createLinearGradient(paddleX, canvas.height-paddleHeight, paddleX, canvas.height);
              gradP.addColorStop(0, 'green');
              gradP.addColorStop(1, '#009999');
              ctx.fillStyle = gradP;
          }
          else {
              ctx.fillStyle = "rgb(" + String(Math.floor(((1.0*paddleWidth - 125)/175)*255)) + ", " + String(Math.floor(153 - ((1.0*paddleWidth - 125)/175)*153)) + ", " + String(Math.floor(153 - ((1.0*paddleWidth - 125)/175)*153)) + ")";
          }
          ctx.fill();
          ctx.closePath();
          if(begun == 0) {
              x = paddleX + paddleWidth/2;
              y = canvas.height-paddleHeight-ballRadius;
          }
      }
  
  //Рисование бонусов
  //Переменные положения бонуса, увеличивающего платформу PaddleBonus
      var strDist = 10;
      var bonusPx = 150 + Math.floor(600*Math.random());
      var bonusPy = -4*strDist;
      var bonusedP = 0;
      var dyP = 1;
      var bonusPActive = 0;
      var bonusPCountDuration = 7;
      var bonusOrder = 1;
      if (bonusOrder == 0) {
          var countToActBonusP = 3;
          var countToActBonusS = 11;
      }
      else {
          var countToActBonusP = 11;
          var countToActBonusS = 3;
      }
      var paddleChanged = 0;
      var dPad = 1;
      var speedChanged = 0;
  
  //paddle-бонус
      function bonusGiantPaddle() {
          var colors = ["red", "#0066ff", "#ffff00"];
          for (var i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.lineWidth = 10;
              ctx.lineJoin = 'round';
              ctx.beginPath();
              ctx.moveTo(bonusPx, bonusPy + i * strDist);
              ctx.lineTo(bonusPx + strDist, bonusPy + strDist + i * strDist);
              ctx.lineTo(bonusPx + 2*strDist, bonusPy + i * strDist);
              ctx.lineTo(bonusPx + 3*strDist, bonusPy + strDist + i * strDist);
              ctx.lineTo(bonusPx + 4*strDist, bonusPy + i * strDist);
              ctx.strokeStyle = colors[i];
              ctx.stroke();
              ctx.closePath();
          }
          bonusPy = bonusPy + dyP;
      }
  
  //Поимка padlle-бонуса
      function bonusGiantPaddleCollisionDetection() {
          if((paddleX <= bonusPx + 4*strDist) && (paddleX + paddleWidth >= bonusPx) && (bonusPy + 3*strDist >= canvas.height - paddleHeight) && (bonusPy <= canvas.height) && (bonusPActive == 0)) {
              bonusPActive++;
              tick.play();
              bonusPy = bonusPy + 100;
          }
      }
      
  //Рисование paddle-бонуса
      function drawBonusGiantPaddle(){
          if(((bonusedP == 1) || (count == countToActBonusP)) && (bonusPActive == 0)) {
              bonusGiantPaddle();
              if(bonusedP == 0){
                  bonusedP++;
              }
          }
      }
  
  //Эффект paddle-бонуса
      function bonusGiantPaddleEffect(){
          if((bonusPActive == 1) && (paddleChanged == 0)){
              paddleX = paddleX - dPad/2;
              paddleWidth = paddleWidth + dPad;
              if (speedChanged == 0) {
                  PBonusPlus.play();
                  sessionStorage.setItem('speed1', speedX);
                  sessionStorage.setItem('speed2', speedY);
                  speedChanged++;
                  speedX = 0;
                  speedY = 0;
              }
              if (paddleWidth > 300) {
                  dPad = 0;
                  speedX = parseFloat(sessionStorage.getItem('speed1'));
                  speedY = parseFloat(sessionStorage.getItem('speed2'));
                  speedChanged = 0;
                  paddleChanged++;
              }
          }
          if ((count > countToActBonusP + bonusPCountDuration - 3) && (tickedm == 0) && (bonusPActive == 1)) {
              tick.pause();
              tick_fast.play();
              tickedm++;
          }
          if((count > countToActBonusP + bonusPCountDuration) && (paddleChanged == 1)) {
              if (speedChanged == 0) {
                  PBonusMinus.play();
                  tick_fast.pause();
                  sessionStorage.setItem('speed1', speedX);
                  sessionStorage.setItem('speed2', speedY);
                  speedChanged++;
                  speedX = 0;
                  speedY = 0;
              }
              dPad = -1;
              paddleWidth = paddleWidth + dPad;
              paddleX = paddleX - dPad/2;
              if (paddleWidth <= 125) {
                  speedX = parseFloat(sessionStorage.getItem('speed1'));
                  speedY = parseFloat(sessionStorage.getItem('speed2'));
                  speedChanged = 0;
                  dPad = 1;
                  paddleChanged = 0;
              }
              bonusPActive = 0;
              tickedm = 0;
          }
      }
  
  //Переменные положения бонуса, прилепляющего шарик к платформе(StickyPaddleBonus)
      var bonusedS = 0;
      var bonusSActive = 0;
      var bonusSRadius = 2*ballRadius;
      var bonusSx = 150 + Math.floor(600*Math.random());
      var bonusSy = -bonusSRadius;
      var bonusSCountDuration = 7;
      var dyS = 1;
      var deltaXPaddleX = 0;
      var deltaXPaddleXStoraged = 0;
      var sticked = 0;
  
      function bonusStickyPaddle() {
          ctx.beginPath();
          ctx.arc(bonusSx, bonusSy, bonusSRadius, 0, Math.PI * 2);
          var grdS = ctx.createRadialGradient(bonusSx-bonusSRadius/4, bonusSy-bonusSRadius/4, bonusSRadius/4, bonusSx, bonusSy, bonusSRadius);
          grdS.addColorStop(0,"white");
          grdS.addColorStop(1,"green");
          ctx.fillStyle = grdS;
          ctx.fill();
          ctx.closePath();
          bonusSy = bonusSy + dyS;
      }
      
      function drawBonusStickyPaddle() {
          if(((bonusedS == 1) || (count == countToActBonusS)) && (bonusSActive == 0)) {
              bonusStickyPaddle();
              if(bonusedS == 0){
                  bonusedS++;
              }
          }
      }
      
      function bonusStickyPaddleCollisionDetection() {
          if((paddleX <= bonusSx + bonusSRadius) && (paddleX + paddleWidth >= bonusSx - bonusSRadius) && (bonusSy + bonusSRadius >= canvas.height - paddleHeight) && (bonusSy - bonusSRadius <= canvas.height) && (bonusSActive == 0)) {
              bonusSActive++;
              SBonus.play();
              tick.play();
              bonusSy = bonusSy + 100;
          }
      }
      
      function bonusStickyPaddleEffect() {
          if (bonusSActive == 1) {
              if ((count >= countToActBonusS + bonusSCountDuration - 3) && (tickedm == 0)) {
                  tick.pause();
                  tick_fast.play();
                  tickedm++;
              }
              if (((y + speedY >= canvas.height-ballRadius-paddleHeight) && (x >= paddleX) && (x <= paddleX + paddleWidth)) || (sticked == 1)) {
                  if (deltaXPaddleXStoraged == 0) {
                      sessionStorage.setItem('delta', x - paddleX);
                      sessionStorage.setItem('speed1', speed);
                      deltaXPaddleXStoraged = 1;
                  }
                  y = canvas.height - ballRadius - paddleHeight;
                  x = paddleX + parseFloat(sessionStorage.getItem('delta'));
                  sticked = 1;
                  speed = 0;
                  speedX = 0;
                  speedY = 0;
                  if (spacePressed == true) {
                      spacePressed = false;
                      speed = parseInt(sessionStorage.getItem('speed1'));
                      speedY = -speed;
                      deltaXPaddleXStoraged--;
                      sticked = 0;
                  }
              }
          }
          if ((count >= countToActBonusS + bonusSCountDuration) && (bonusSActive == 1)) {
              bonusSActive = 0;
              tick_fast.pause();
              tickedm = 0;
          }
      }
  
  //Рисование блоков наверху  
      function drawBricks() {
          for(var c = 0; c < brickColumnCount; c++) {
              for(var r = 0; r < brickRowCount; r++) {
                  if(bricks[c][r].status == 1) {
                      var brickX = (c * (brickWidth+brickPadding)) + brickOffsetLeft;
                      var brickY = (r * (brickHeight+brickPadding)) + brickOffsetTop;
                      bricks[c][r].x = brickX;
                      bricks[c][r].y = brickY;
                      ctx.beginPath();
                      ctx.rect(brickX, brickY, brickWidth, brickHeight);
                      if(bricks[c][r].weight == 1) {
                          if (bricks[c][r].transparency == 1) {
                              if (transFlag == 0) {
                                  trans = trans - transDelta;
                                  transFlag++;
                              }
                              if (((trans <= 0) || (trans >= 1)) && (transFlag == 1)) {
                                  transDelta = -transDelta;
                                  transFlag++;
                              }
                              ctx.fillStyle = "rgba(255, 255, 255, " + String(trans) + ")";
                          }
                          else {
                              var lingrad = ctx.createLinearGradient(bricks[c][r].x, bricks[c][r].y, bricks[c][r].x, 
                              bricks[c][r].y + brickHeight);
                              lingrad.addColorStop(0, '#fff');
                              lingrad.addColorStop(1, '#0033cc');
                              ctx.fillStyle = lingrad;
                          }
                      } else if(bricks[c][r].weight == 2) {
                          var lingrad = ctx.createLinearGradient(bricks[c][r].x, bricks[c][r].y, bricks[c][r].x, 
                          bricks[c][r].y + brickHeight);
                          lingrad.addColorStop(0, '#ff0000');
                          lingrad.addColorStop(1, '#ffff00');
                          ctx.fillStyle = lingrad;
                      } else if(bricks[c][r].weight == 3) {
                          var lingrad = ctx.createLinearGradient(bricks[c][r].x, bricks[c][r].y, bricks[c][r].x, 
                          bricks[c][r].y + brickHeight);
                          lingrad.addColorStop(0, '#ffff00');
                          lingrad.addColorStop(1, '#00ff00');
                          ctx.fillStyle = lingrad;
                      }
                      ctx.fill();
                      ctx.closePath();
                  }
              }
          }
          transFlag = 0;
      }
  
  //Большая функция нарисовать все
      function draw() {
          playMusic();
          if ((lvl1ThemeSound.ended == true) && (levelcount == 1)) {
              sounded = 0;
          }
          else if ((lvl2ThemeSound.ended == true) && (levelcount == 2)) {
              sounded = 0;
          }
          else if ((lvl3ThemeSound.ended == true) && (levelcount == 3)) {
              sounded = 0;
          }
          else if ((lvl4ThemeSound.ended == true) && (levelcount == 4)) {
              sounded = 0;
          }
  
      //Стираем все!
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      //Рисуем все!   
          drawbackground();
          drawFrame();
          drawBall();
          if (begun < 1) {
              opacity += opacityChanger;
              if(opacity <= 0.002 || opacity >= 1)
                  opacityChanger = -opacityChanger;
              ctx.globalAlpha = opacity;
              ctx.drawImage(spaceStartImage, 60, 340, 800, 100);
              ctx.globalAlpha = 1.0;
          }
  
          //Меню паузы - вывод всего на экран
          if (pause == 1 && begun == 1) {
              ctx.drawImage(pauseImage, 200, 220);
              opacity += opacityChanger;
              stopMusic();
              dyP = 0;
              dyS = 0;
              if(opacity <= 0.002 || opacity >= 1)
                  opacityChanger = -opacityChanger;
              ctx.globalAlpha = opacity;
              //ctx.drawImage(pauseContinueImage, 110, 340);
              ctx.globalAlpha = 1.0;
          }
  
          if (pause == 0 && begun == 1) {
              opacity = 0.002;
              playMusic();
              dyP = 1;
              dyS = 1;
          }
  
          //Бонус с увеличением платформы
          bonusGiantPaddleEffect();
          drawBonusGiantPaddle();
          bonusGiantPaddleCollisionDetection();
          
          //Бонус с липкой платформой
          bonusStickyPaddleEffect();
          drawBonusStickyPaddle();
          bonusStickyPaddleCollisionDetection();
          
          //Рисовалка остального и детектирование столкновений
          drawPaddle();
          //drawTarget();
          drawBricks();
          collisionDetection();
          drawScore();
          drawLevel();
          drawspeed();
  
      //Переменная random
          var min = 1.2; 
          var max = 6;  
          var random = Math.random() * (+max - +min) + +min; 
  
      //Отскакивание от стенок
          if(x + speedX > canvas.width - ballRadius || x + speedX < ballRadius) {
              speedX = -speedX;
          }
  
      //Отскакивание от потолка, лопатки и GAME OVER при уходе за экран вниз
          if(y + speedY < ballRadius) {
              speedY = -speedY;
          } else if(y + speedY >= canvas.height-ballRadius-paddleHeight) {
              if(x > paddleX + paddleWidth/3 && x < paddleX + 2 * paddleWidth/3) {
                  speedY = -speedY;
              }
              else { 
                  if(x > paddleX - ballRadius && x < paddleX + paddleWidth/3){
                      speedX = -Math.abs(speedY)/random;
                      speedY = -Math.sqrt(Math.pow(speed, 2) - Math.pow(speedX, 2));
                  }
                  else {
                      if (x > paddleX + 2 * paddleWidth/3 && x < paddleX + paddleWidth + ballRadius){
                      speedX = Math.abs(speedY)/random;
                      speedY = -Math.sqrt(Math.pow(speed, 2) - Math.pow(speedX, 2));
                      }
                      else if(y + speedY >= canvas.height-ballRadius) {
                          //Остановка музыки
                          stopMusic();
                          tick.pause();
                          tick_fast.pause();
                          //Звук проигрыша
                          lossSound.play();
                          
                          //Перенос значения счета в session storage
                          sessionStorage.setItem('score', score);
  
                          //GameOver
                          document.writeln("<body style='background-color:#000000;'> <center> <h1 style=color:#FFFFFF > GAME OVER! </h1> <form action='index.html'> <button type='submit'> OKAY </button> </form> </center> </body>");
                          clearInterval(timeId);
                      }
                  }
              }    
          }
              
          //Движение лопатки от нажатия клавиш на клавиатуре
          if(rightPressed && paddleX < canvas.width - paddleWidth && pause == 0) {
              paddleX += 7;
          }
          else if(leftPressed && paddleX > 0 && pause == 0) {
              paddleX -= 7;
          }
  
          //Скорость движения шарика (Если в зависимости от нажатых start и pause)
          if((begun > 0) && (pause == 0)) {
              x = x + speedX;
              y = y + speedY;
          }
      }
      
      function drawloading() {
        ctx.drawImage(loadingImage, canvas.width / 2 - loadingImage.width / 2, canvas.height / 2 - loadingImage.height / 2);
    }
  
      async function game() {
          //requestAnimationFrame(game)
          draw();
          spacePressed = 0;
          if (begun == 1) {
              if (initial_seed % delay == 0) {
                  initial_seed = 0
                  pauseVar = (pauseVar + 1) % pauseDelay;
  
                  if (post == 0) { 
                      var imgSize = video.constructor.name === 'HTMLVideoElement' ? [video.videoHeight, video.videoWidth] : [video.height, video.width]
                      video.onloadeddata = (e) => {
  
  
                      }
                      imageTensor = tf.browser.fromPixels(video, 3)
                      imageTensor = imageTensor.expandDims(0).toFloat().div(tf.scalar(255))
                      myWorker.postMessage([imgSize, Object.assign({},imageTensor)])
  
                      console.log('Message posted')
                      post = 1
                  }
                  myWorker.onmessage = function(e) {
                      post = 0
                      delta = delay - initial_seed
                        boxes = e.data;
                      console.log('Message received from worker');
                      console.log(initial_seed)
                      var fisted = 0
                      for (let i = 0; i < boxes.length; i++) {
                          if (boxes[i]["label"] == "fist") {
                              fisted = 1
                              prevPaddleX = paddleX;
                              let midval = boxes[i]["left"] + boxes[i]["width"] / 2
                              midval = 1.5*midval - 5;
                              relativeX = midval;
                              if(relativeX > paddleWidth/2 && relativeX < canvas.width - paddleWidth/2) {
                                     recPaddleX = relativeX - paddleWidth/2;
                              }
                              else if(relativeX <= paddleWidth/2 ) {
                                  recPaddleX = 0;
                              }
                              else if(relativeX >= canvas.width - paddleWidth/2) {
                                  recPaddleX = canvas.width - paddleWidth;
                                 }
                          }
                          else if (boxes[i]["label"] == "pistol") {
                              sticked = 0
                          }
                      }
                      if (fisted == 0) {
                          recPaddleX = prevPaddleX;
                      }
                  }
              }
              paddleX = paddleX + (recPaddleX - prevPaddleX)/delta;
              initial_seed++;
          }
      }
  
      function step() {
          //requestAnimationFrame(step);
          if (ready == 1) {
            draw();
            }
         else {
            drawloading();
        }
          spacePressed = 0;
          if (begun == 1) {
              if (initial_seed % delay == 0) {
                  initial_seed = initial_seed % delay;
                  pauseVar = (pauseVar + 1) % pauseDelay;
                  runDetection();
                  //console.log("detected" + initial_seed);
              }
              paddleX = paddleX + (recPaddleX - prevPaddleX)/delay;
          }
          else {
              if ((initial_seed % delay == 0)) {
                  initial_seed = initial_seed % delay;
                  model.detectAndBox(video).then(boxes => {
                      if (ready == 0) {
                          ready = 1;
                      }
                      for (let i = 0; i < boxes.length; i++) {
                          if ((boxes[i]["label"] == "finger up") && (pause == 0)) {
                              spacePressed = false;
                              begun = 1;
                              pauseVar = (pauseVar + 1) % pauseDelay;
                          }
                      }
                  })
                  //console.log("detected" + initial_seed);
              }
          }
          pauseVar = (pauseVar + 1) % pauseDelay;
          initial_seed++;
      }
  
      let imageTensor = 0
      var delta = 0
      var post = 0
      var model = new TinyYoloV3();
      var ready = 0;
      //var myWorker = new Worker("worker.js");
      model.load("http://127.0.0.1:5000/game/models/yolov3-tiny_12k_graph/model.json").then(model => {
          beginVideo()
          timeId = setInterval(step, videoInterval);
          //step()
      })