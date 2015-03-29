var m = require('./macro.js');

var random = function (from, to) {
	return from + (Math.random() * (to - from) + 0.5) << 0;
}

var clickMouse = function (x, y) {
	return new Promise(function (resolve, reject) {
		m.mouseDown(x, y);
		setTimeout(function () {
			m.mouseUp(x, y);
			resolve();
		}, random(1, 20));
	});
}

var moveMouse = function (endX, endY) {
	return new Promise(function(resolve, reject) {
		var currPos = m.getMousePos();
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
		var interval = setInterval(function () {
			if (currX == endX && currY == endY) {
				clearInterval(interval);
				resolve();
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
				m.setMouse(currX, currY);
			}
		}, 1);
	});
}

var type = function (str) {
	return new Promise(function(resolve, reject) {
		var i = 0;
		var typeKey = function (key) {
			m.keyDown(key);
			setTimeout(function () {
				m.keyUp(key);
				setTimeout(function() {
					if (i < str.length) {
						typeKey(str[i++]);
					} else {
						resolve();
					}
				}, random(30, 70))
			}, random(2, 20));
		}
		typeKey(str[i++]);
	});
}

m.init();

// console.log(m.findColor({r: 51, g: 51, b: 51}, 0, 0, 270, 120));

// console.log(m.getColor(0,0));
for (var x = 301; x < 303; x++) {
	console.log(m.processScreen(x, 466, x, 466));
	console.log(m.getColor(x, 466));
	m.setMouse(x, 466);
}

// var y = 350;
// for (var x = 360; x < 500; x++) {
// 	var cola = m.processScreen(x, y, x, y);
// 	var colb = m.getColor(x, y);
// 	if (cola.r !== colb.r || cola.g !== colb.g || cola.b !== colb.b) {
// 		console.log('No match at '+x+', '+y,cola,colb);
// 	}
// 	m.setMouse(x, y);
// }

// moveMouse(390, 100).then(function() {
// 	clickMouse(390, 100).then(function () {
// 		console.log("Done!");
// 	})
// });

// setInterval(function () {
// 	var pos = m.getMousePos();
// 	console.log(pos);
// 	var color = m.getColor(pos.x,pos.y);
// 	console.log(color);
// },16);

m.quit();