# Breakout-YOLO
![logo](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/logo_yolo.png)
Breakout-YOLO is a classic browser game that can be controlled by gestures. See YOLO.pdf for details.
## TODO
- [ ] structure code
- [ ] add bounding box rendering in game
- [ ] move detection part to worker.js and use Worker API for parallelization of object detection and drawing
- [ ] add images without gestures to dataset(and train model on this) to decrease number of false positives
- [ ] recalculate anchor boxes for 256x256 and 192x192 models and train models with them
- [ ] add more gestures and game bonuses 
## Getting started

For now only Flask is required. Install it in a way appropriate for your OS. For Linux:
#### Conda (Recommended)
```bash
conda install flask
```
#### Pip
```bash
pip install flask
```
After installation go to flask directory and run app.py:
```bash
cd flask
python app.py
```
+ go to http://127.0.0.1:5000/js/tfjs_draft.html in your browser to run demonstration 
+ go to http://127.0.0.1:5000/js/index.html in your browser to play game  
## Game Controls 
+ use "circle" gesture to move cursor in main menu or to unpause game  
![circle](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/2.png)
+ use "finger up" gesture to click on buttons in main menu or to pause game  
![finger up](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/1.png)
+ use "fist" gesture to move paddle 
![fist](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/4.png)
+ use "pistol" gesture to detach ball from sticky paddle  
![pistol](https://github.com/vovaf709/Breakout-YOLO/blob/master/flask/js/Images/3.png)



