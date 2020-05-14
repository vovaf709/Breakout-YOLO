# Breakout-YOLO
![logo](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/logo_yolo.png)  
Breakout-YOLO is a classic browser game that can be controlled by gestures. See [poster](https://github.com/vovaf709/Breakout-YOLO/blob/master/YOLO.pdf) for details.
## Tasks
- [ ] structure code
- [ ] add bounding box rendering in game
- [ ] move detection part to worker.js and use Worker API for parallelization of object detection and drawing
- [ ] add images without gestures to dataset(and train model on this) to decrease number of false positives
- [ ] recalculate anchor boxes for 256x256 and 192x192 models and train models with them
- [ ] add more gestures and game bonuses 

## Getting started
**Chromium**(version >= 81.0.4044.138) and **Firefox**(version >= 76.0.1) are supported.
For now only **Flask** is required. Install it in a way appropriate for your OS. For Linux:
#### Conda (Recommended)
```bash
conda install flask
```
#### Pip
```bash
pip install flask
```
After installation go to [flask](https://github.com/vovaf709/Breakout-YOLO/tree/master/flask) directory and run [app.py](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/app.py):
```bash
cd flask
python app.py
```
+ go to http://127.0.0.1:5000/js/tfjs_draft.html in your browser to run demonstration 
+ go to http://127.0.0.1:5000/js/index.html in your browser to play game   
## Performance

|              Device+CPU+GPU           |FPS |
|:-------------------------------------:|:--:|
|  ASUS Vivobook S15, i7 1.8GHz, MX250  | 37 |
|  Lenovo IdeaPad 520 i5 2.5GHz, 940MX  | 25 |
|  Acer Aspire V5, i3 1.8GHz, GT 740M   | 16 |
## Game Controls 
+ use "circle" gesture to move cursor in main menu or to unpause game  
![circle](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/2.png)
+ use "finger up" gesture to click on buttons in main menu or to pause game  
![finger up](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/1.png)
+ use "fist" gesture to move paddle  
![fist](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/4.png)
+ use "pistol" gesture to detach ball from sticky paddle  
![pistol](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/3.png)  
## Acknowledgments
* [Yolov3 Keras implementation](https://github.com/qqwweee/keras-yolo3)
* [AlexeyAB darknet repository](https://github.com/AlexeyAB/darknet)
* [Yolo v3 official paper](https://arxiv.org/abs/1804.02767)
* [TensorFlowJS](https://github.com/tensorflow/tfjs)
* [Dude who made a big contribution to the game script code](https://github.com/MeneTelk0)



