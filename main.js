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
			yield wait(random(1, 20));
			yield m.mouseUp(x, y);
			resolve();
		})
	});
}

var moveMouse = function (endX, endY) {
	return new Promise(function(resolve, reject) {
		spawn(function*(){
			var currPos = yield m.getMousePos();
			var currX = currPos.x;
			var currY = currPos.y;
			var bigDX = endX - currX;
			var bigDY = endY - currY;
			var time = Math.sqrt(Math.pow(bigDX, 2) + Math.pow(bigDY, 2)) << 0;
			var moveEveryX = time/bigDX;
			var moveEveryY = time/bigDY;
			var movingRight = (moveEveryX > 0) ? 1 : -1;
			var movingDown = (moveEveryY > 0) ? 1 : -1;
			moveEveryX = Math.abs(moveEveryX);
			moveEveryY = Math.abs(moveEveryY);
			var xCounter = 0;
			var yCounter = 0;
			while (true) {
				if (currX == endX && currY == endY) {
					resolve();
					break;
				} else {
					xCounter++; 
					yCounter++;
					if (xCounter >= moveEveryX) {
						xCounter -= moveEveryX;
						currX += movingRight;
					}
					if (yCounter >= moveEveryY) {
						yCounter -= moveEveryY;
						currY += movingDown;
					}
					yield m.setMouse(currX, currY);
					yield wait(1);
				}
			}
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
					yield wait(random(5,20)); 
				};
				yield m.keyDown(key);
				yield wait(random(5, 20));
				yield m.keyUp(key);
				yield wait(random(40, 80));
				if (uppercase) { 
					yield m.keyUp('shift'); 
					yield wait(random(5,20)); 
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
		yield moveMouse(150, 120);
		yield wait(100);
		yield clickMouse(150, 120);
		yield wait(100);
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