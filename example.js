/* 

Welcome to macrojs. $ supports the following methods:

    setMouse(x, y) moves the mouse to x, y immediately
    moveMouseHuman(x, y, speed) moves the mouse to x, y like a human. Speed defaults to 25 if unspecified.
    getMousePos() returns the current position in an object {x: x, y: y}
    clickMouse(x, y, right) clicks the mouse like a human at x, y. Set right to true if it should right click.
    mouseDown(x, y, right) presses the mouse down at x, y. Set right to true if it should right click.
    mouseUp(x, y, right) releases the mouse down at x, y. Set right to true if it should right click.
    sendKeysHuman(str) types the string str like a human. It only supports letters (upper and lowercase) and the space bar.
    keyDown(char) presses the char.
    keyUp(char) presses the char.
    getColor(x, y) returns the color at x, y in an object {r: r, g: g, b: b} where r, g and b take values from 0 to 255.
    findColor(target, xs, ys, xe, ye) returns the {x: x, y: y} coordinates of the target color in the box defined by xs, ys, xe, ye. The color must be provided as {r: r, g: g, b: b}
    findColorTolerance(target, xs, ys, xe, ye, tolerance) does the same as findColor but allows you to specify a tolerance. Increasing the tolerance returns less perfect matches.
    findBitmap(imageName, xs, ys, xe, ye, tolerance) returns the {x: x, y: y} coordinates of the bitmap in the box defined by xs, ys, xe, ye.
    random(from, to) returns a random integer
    wait(ms) waits for ms milliseconds

    To find a bitmap you must pass it in as a data URI. These can be generated for any image using the datauir plugin: https://github.com/heldr/datauri.
    I recommend you only use very small images. First save them as bitmaps then convert them into datauris using `datauri your_image.bmp`

	To call any of these you *must* use the yield keyword before the call. To learn why read http://www.html5rocks.com/en/tutorials/es6/promises/

	If you implement a function which uses a call from $ you must include the boilerplate Promise and spawn function as in the moveMouseToColorInBoxWithTolerance example.
	If you implement a function which doesn't call $ you may do it in the normal way.

*/

var $ = require('./macro.js');

$.spawn(function*(){

	// EXAMPLE 1: This moves the mouse to (100, 100), clicks, then types "Hello world".
	yield $.moveMouseHuman(100, 100, 30);
	yield $.wait(100);
	yield $.clickMouse(100, 100);
	yield $.wait(1000);
	yield $.sendKeysHuman('Hello world');
	yield $.wait(1000 + $.random(0, 1000));

	// EXAMPLE 2: This demonstrates how to implement a helper function which will move the mouse if it finds a color on the screen
	var didFind = yield moveMouseToColorInBoxWithTolerance({r: 255, g: 255, b: 255}, 0, 0, 1, 1, 10);
	console.log(didFind ? 'We found the color and moved the mouse!' : 'We failed to find the color :(');

	// EXAMPLE 3: This demonstrates how to find a bitmap on the screen and move the mouse to it's position
	var pos = yield $.findBitmap('image.png', 0, 0, 1000, 1000, 10);
	if (pos.x > 0 && pos.y > 0) {
		yield $.setMouse(pos.x, pos.y);
	}

	// EXAMPLE 4: This is a color picker. Every 100ms it returns your cursor position and the color of the pixel
	while (true) {
		yield $.wait(100);
		var pos = yield $.getMousePos();
		var color = yield $.getColor(pos.x,pos.y);
		console.log(pos, color);
	}

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