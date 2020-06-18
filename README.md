![logo](https://github.com/vovaf709/Breakout-YOLO/blob/master/docs/images/logo_yolo.png)  
Breakout-YOLO is a classic browser game that can be controlled by gestures. See [poster](https://github.com/vovaf709/Breakout-YOLO/blob/master/YOLO.pdf) for details.
## Tasks
- [x] structure code
- [ ] add bounding box rendering in game
- [ ] move detection part to worker.js and use Worker API for parallelization of object detection and drawing
- [ ] add images without gestures to dataset(and train model on this) to decrease number of false positives
- [ ] add more gestures and game bonuses 

## Getting started
**Firefox**(version >= 76.0.1)(recommended) and **Chromium**(version >= 81.0.4044.138) are supported.

Press [demo](https://vovaf709.github.io/Breakout-YOLO/demo.html) and [game](https://vovaf709.github.io/Breakout-YOLO/) to immediately enjoy the process(loading may take some time).

If you want(for some reason) to run all things locally follow this instruction:

For now only **Flask** is required. Install it in a way appropriate for your OS.
For Linux just run following comands:
#### Conda (Recommended)
```bash
conda env create -f breakout.yml  
conda activate breakout  
```
or  
#### Pip
```bash
python -m venv breakout  
source ./breakout/bin/activate  
pip install -r requirements.txt
```

After installation run [app.py](https://github.com/vovaf709/Breakout-YOLO/blob/master/app.py):
```bash
python app.py
```
+ go to http://127.0.0.1:5000/docs/demo.html in your browser to run demonstration 
+ go to http://127.0.0.1:5000/docs/index.html in your browser to play game  

If you get
```bash
OSError: [Errno 98] Address already in use
```

so there is another process listening on the port 5000. Just find its PID and kill by:
```bash
lsof -i :5000
kill -9 PID
```

## Performance

|              Device+CPU+GPU           |FPS |
|:-------------------------------------:|:--:|
|  ASUS Vivobook S15, i7 1.8GHz, MX250  | 37 |
|  Lenovo IdeaPad 520 i5 2.5GHz, 940MX  | 25 |
|  Acer Aspire V5, i3 1.8GHz, GT 740M   | 16 |
## Game Controls 
+ use «circle» gesture to move cursor in main menu or to unpause game  
![circle](https://github.com/vovaf709/Breakout-YOLO/blob/master/docs/images/2.png)
+ use «finger up» gesture to click on buttons in main menu or to pause game  
![finger up](https://github.com/vovaf709/Breakout-YOLO/blob/master/docs/images/1.png)
+ use «fist» gesture to move paddle  
![fist](https://github.com/vovaf709/Breakout-YOLO/blob/master/docs/images/4.png)
+ use «pistol» gesture to detach ball from sticky paddle  
![pistol](https://github.com/vovaf709/Breakout-YOLO/blob/master/docs/images/3.png)  
## Known issues
* In Chromium cursor movement smoothing may not work
## Acknowledgments
* [Yolov3 Keras implementation](https://github.com/qqwweee/keras-yolo3)
* [AlexeyAB darknet repository](https://github.com/AlexeyAB/darknet)
* [Yolo v3 official paper](https://arxiv.org/abs/1804.02767)
* [TensorFlowJS](https://github.com/tensorflow/tfjs)
* [Dude who made a big contribution to the game script code](https://github.com/MeneTelk0)



