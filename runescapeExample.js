var $ = require('./macro.js');

var clientPos = {x: 880, y: 250};

var toScreenCoords = function (point) {
	return {x: point.x + clientPos.x, y: point.y + clientPos.y};
}

var toClientCoords = function (point) {
	return {x: point.x - clientPos.x, y: point.y - clientPos.y};
}

var getInventoryItemCoord = function (i) {
	var col = i % 4;
	var row = Math.floor(i / 4);
	var inventoryTopLeft = {x: 562, y: 213};
	var itemWidth = 40;
	var itemHeight = 36;
	var itemX = inventoryTopLeft.x + col * itemWidth;
	var itemY = inventoryTopLeft.y + row * itemHeight;
	return {xs: itemX + 5, ys: itemY + 5, xe: itemX + itemWidth - 5, ye: itemY + itemWidth - 5};
}

$.spawn(function*(){

	var pos = getInventoryItemCoord(27);
	var width = pos.xe - pos.xs;
	var height = pos.ye - pos.ys;
	var x = pos.xs + $.random(0, width);
	var y = pos.ys + $.random(0, height);
	var newPos = toScreenCoords({x: x, y: y});
	yield $.moveMouseHuman(newPos.x, newPos.y, 30);

	// // This moves the mouse to (100, 100), clicks, then types "Hello world".
	// yield $.moveMouseHuman(100, 100, 30);
	// yield $.wait(100);
	// yield $.clickMouse(100, 100);
	// yield $.wait(1000);
	// yield $.sendKeysHuman('Hello world');
	// yield $.wait(1000 + $.random(0, 1000));

	// // This demonstrates how to implement a helper function which will move the mouse if it finds a color on the screen
	// var didFind = yield moveMouseToColorInBoxWithTolerance({r: 255, g: 255, b: 255}, 0, 0, 1000, 1000, 10);
	// console.log(didFind ? 'We found the color and moved the mouse!' : 'We failed to find the color :(');

	// This is a color picker. Every 100ms it returns your cursor position and the color of the pixel
	// while (true) {
	// 	yield $.wait(500);
	// 	var pos = yield $.getMousePos();
	// 	var color = yield $.getColor(pos.x,pos.y);
	// 	console.log(toClientCoords(pos), color);
	// }

});

// This finds the color (with a tolerance of 10) in the box and moves the mouse to it immediately (if it's found)
function moveMouseToColorInBoxWithTolerance(color, xs, ys, xe, ye, tolerance) {
	// Unfortunately you must always use these two lines of boilerplate to ensure the yielding works correctly
	return new Promise(function(resolve, reject) {
		$.spawn(function*() {
			// Now do whatever your function should do
			var pos = yield $.findColorTolerance(color, xs, ys, xe, ye, tolerance);
			var didFind = pos.x > -1 && pos.y > -1;
			if (didFind) {
				// We found something. Move the mouse there
				yield $.setMouse(pos.x, pos.y);
			}
			// Instead of using `return result` we use `resolve(result)`
			resolve(didFind);
		});
	});
}

// Call quit when you're done so we can free up the objects allocated for interacting with the Objective C layer
$.quit();