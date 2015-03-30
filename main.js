var m = require('./macro.js');

function spawn(generatorFunc) {
  function continuer(verb, arg) {
	var result;
	try {
	  result = generator[verb](arg);
	} catch (err) {
	  return Promise.reject(err);
	}
	if (result.done) {
	  return result.value;
	} else {
	  return Promise.resolve(result.value).then(onFulfilled, onRejected);
	}
  }
  var generator = generatorFunc();
  var onFulfilled = continuer.bind(continuer, "next");
  var onRejected = continuer.bind(continuer, "throw");
  return onFulfilled();
}

var random = function (from, to) {
	return from + (Math.random() * (to - from) + 0.5) << 0;
}

var wait = function (time) {
	return new Promise(function(resolve, reject){
		setTimeout(resolve, time);
	});
}

var clickMouse = function (x, y) {
	return new Promise(function (resolve, reject) {
		spawn(function*() {
			yield m.mouseDown(x, y);
			yield wait(random(40, 100));
			yield m.mouseUp(x, y);
			resolve();
		})
	});
}

var moveMouse = function (endX, endY, speed) {
	return new Promise(function(resolve, reject) {
		spawn(function*(){
			var speedModifier = Math.min(speed, 1) * 5;
			var currPos = yield m.getMousePos();
			var currX = currPos.x;
			var currY = currPos.y;
			var bigDX = endX - currX;
			var bigDY = endY - currY;
			var movingRight = (bigDX > 0) ? 1 : -1;
			var movingDown = (bigDY > 0) ? 1 : -1;
			var time = Math.sqrt(Math.pow(bigDX, 2) + Math.pow(bigDY, 2)) * speedModifier << 0;
			var moveEveryX = time/bigDX;
			var moveEveryY = time/bigDY;
			moveEveryX = Math.abs(moveEveryX);
			moveEveryY = Math.abs(moveEveryY);
			var xCounter = 0;
			var yCounter = 0;
			while (true) {
				var doneX = (movingRight == 1 && currX >= endX) || (movingRight == -1 && currX <= endX);
				var doneY = (movingDown == 1 && currY >= endY) || (movingDown == -1 && currY <= endY);
				if (doneX && doneY) {
					resolve();
					break;
				} else {
					xCounter += speedModifier; 
					yCounter += speedModifier;
					if (xCounter >= moveEveryX) {
						xCounter -= moveEveryX;
						currX += movingRight * speedModifier;
					}
					if (yCounter >= moveEveryY) {
						yCounter -= moveEveryY;
						currY += movingDown * speedModifier;
					}
					yield m.setMouse(currX, currY);
					yield wait(1);
				}
			}
		});
	});
}

// A port of humanWindMouse from https://github.com/SRL/SRL-6/
var humanMouseMove = function(xe, ye, speed) {
	return new Promise(function(resolve, reject){
		spawn(function*() {
			var distance = function(start, end) {
				return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) << 0;
			}
			var pos = yield m.getMousePos();
			var xs = pos.x;
			var ys = pos.y;
			var targetArea = ((Math.random() * speed) / 2.0 + speed);
			var gravity = 7;
			var wind = 5;
			var x = xs;
			var y = ys;
			var veloX = 0, veloY = 0;
			var veloMag, dist, randomDist, d;
			var windX = 0, windY = 0;
			var lastX, lastY, w, tDist;
			var timeOut;
			var sqrt2, sqrt3, sqrt5, maxStep;
			var startPoint = {x: xs, y: ys};
			var endPoint = {x: xe, y: ye};

			sqrt2 = Math.sqrt(2);
			sqrt3 = Math.sqrt(3);
			sqrt5 = Math.sqrt(5);

			tDist = distance(startPoint, endPoint);
			timeOut = Date.now() + 10000;

			while (Date.now() < timeOut) {
				dist = distance({x: x, y: y}, {x: xe, y: ye});
				wind = Math.min(wind, dist);

				dist = Math.max(dist, 1);
				d = tDist * 0.04 << 0;
				d = Math.min(d, 25);
				d = Math.max(d, 5);

				if (random(1,5) == 1) {
					d = random(1, 5);
				}

				maxStep = Math.min(d, dist);

				if (dist >= targetArea) {
					windX = windX / sqrt3 + (Math.random() * (wind * 2 + 1) - wind) / sqrt5;
					windY = windY / sqrt3 + (Math.random() * (wind * 2 + 1) - wind) / sqrt5;
				} else {
					windX = windX / sqrt2;
					windY = windY / sqrt2;
				}

				veloX += windX;
				veloY += windY;

				veloX += gravity * (xe - x) / dist;
				veloY += gravity * (ye - y) / dist;

				if (Math.sqrt(Math.pow(veloX, 2) + Math.pow(veloY, 2)) > maxStep) {
					randomDist = maxStep / 2 + (Math.random() * (maxStep / 2));
					veloMag = Math.sqrt(veloX * veloX + veloY * veloY);
					veloX = (veloX / veloMag) * randomDist;
					veloY = (veloY / veloMag) * randomDist;
				}

				lastX = x;
				lastY = y;

				x = x + veloX << 0;
				y = y + veloY << 0;

				if (lastX !== x || lastY !== y) {
					yield m.setMouse(x, y);
				}

				w = Math.random() * (600 / speed);
				yield wait(w);

				if (distance({x: x, y: y}, {x: xe, y: ye}) <= 1) {
					break;
				}
			}

			if (xe !== x || ye !== y) {
				yield m.setMouse(xe, ye);
			}
			resolve();
		});
	});
}


var type = function (str) {
	return new Promise(function(resolve, reject) {
		spawn(function*() {
			for(var i = 0; i < str.length; i++) {
				var key = str[i];
				var uppercase = key !== key.toLowerCase();
				if (uppercase) { 
					key = key.toLowerCase();
					yield m.keyDown('shift'); 
					yield wait(random(20,70)); 
				};
				yield m.keyDown(key);
				yield wait(random(30, 125));
				yield m.keyUp(key);
				yield wait(random(10, 100));
				if (uppercase) { 
					yield m.keyUp('shift'); 
					yield wait(random(10, 50)); 
				};
			}
			resolve();
		});
	});
}

spawn(function*(){
	try{
		m.init();
		console.log('Started');
		yield humanMouseMove(100, 100, 30);
		yield wait(100);
		yield clickMouse(100, 100);
		yield wait(1000);
		yield type('Hello world');
	} catch(err) {
		console.log(err);
	}

	// var target = {r: 203, g: 10, b: 77};
	// console.log('Searching for ',target);
	// var pos = m.findColorTolerance(target, 0, 0, 1000, 1000, 0);
	// console.log(pos);
	// if (pos.x > -1 && pos.y > -1) {
	// 	m.setMouse(pos.x, pos.y);
	// }

	// for (var x = 329; x < 350; x++) {
	// 	console.log(m.processScreen(x, 466, x, 466));
	// 	console.log(m.getColor(x, 466));
	// 	m.setMouse(x, 466);
	// }

	// var y = 350;
	// for (var x = 360; x < 500; x++) {
	// 	var cola = m.processScreen(x, y, x, y);
	// 	var colb = m.getColor(x, y);
	// 	if (cola.r !== colb.r || cola.g !== colb.g || cola.b !== colb.b) {
	// 		console.log('No match at '+x+', '+y,cola,colb);
	// 	}
	// 	m.setMouse(x, y);
	// }

	// setInterval(function () {
	// 	var pos = m.getMousePos();
	// 	console.log(pos);
	// 	var color = m.getColor(pos.x,pos.y);
	// 	console.log(color);
	// },100);

	m.quit();
});