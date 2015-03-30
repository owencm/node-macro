var $ = require('./macro.js');

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
    random(from, to) returns a random integer
    wait(ms) waits for ms milliseconds

	To call any of these you *must* use the yield keyword before the call. To learn why read http://www.html5rocks.com/en/tutorials/es6/promises/

*/

$.init();
$.spawn(function*(){

	// This moves the mouse to (100, 100), clicks, then types "Hello world".
	yield $.moveMouseHuman(100, 100, 30);
	yield $.wait(100);
	yield $.clickMouse(100, 100);
	yield $.wait(1000);
	yield $.sendKeysHuman('Hello world');

	// This finds the color in the box and moves the mouse to it immediately
	var pos = yield $.findColorTolerance({r: 50, g: 50, b: 50}, 0, 0, 1000, 1000, 0);
	if (pos.x > -1 && pos.y > -1) {
		yield $.setMouse(pos.x, pos.y);
	}

	// This is a color picker. Every 100ms it returns your cursor position and the color of the pixel
	while (true) {
		yield $.wait(100);
		var pos = yield $.getMousePos();
		var color = yield $.getColor(pos.x,pos.y);
		console.log(pos, color);
	}

});
$.quit();