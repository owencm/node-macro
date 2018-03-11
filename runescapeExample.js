var $ = require('./macro.js');

var clientPos = {x: 100, y: 50};
var clientSize = {width: 760, height: 500}
var client = { xs: clientPos.x, xe: clientPos.x + clientSize.width,  ys: clientPos.y, ye: clientPos.y + clientSize.height }
var world = { xs: clientPos.x + 10, ys: clientPos.y + 10, xe: clientPos.x + 500, ye: clientPos.y + 335 }
var player = { x: clientPos.x + 250, y: clientPos.y + 170 }
var inventory = { xs: clientPos.x + 555, xe: clientPos.x + 727,  ys: clientPos.y + 207, ye: clientPos.y + 460}
var dropCount = 0

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

var colorDelta = function (color, color2) {
	return Math.abs(color.r - color2.r) + Math.abs(color.g - color2.g) + Math.abs(color.b - color2.b)
}

$.spawn(function*(){
	let pos;
	let coal = [{ r: 23, g: 23, b: 12 }, { r: 34, g: 33, b: 20 }]
	let oreColor = {r: 39, g:20, b:15}
	let inventoryCoal = { r: 26, g: 26, b: 16 }
	let text = {r: 10, g: 204, b: 200}

	while(true) {
		let points = yield $.gatherColorTolerance(coal[0], world, 5)
		let clusters = $.cluster(points, 30).filter((cluster) => cluster.length > 60 )
		// If we found something to mine
		if (clusters.length > 0) {
			let cluster = $.clusterClosest(clusters, player)
			let point = $.clusterCenter(cluster)
			let pointToClick = { x: $.random(point.x-10, point.x+10), y: $.random(point.y-10, point.y+10) }
			yield $.moveMouseHuman(pointToClick.x, pointToClick.y)
			yield $.wait($.random(100, 200))
			let isTextVisible = (yield $.findColorTolerance(text, world, 60)).x !== -1
			// Check that after hovering that it's really a rock
			if (isTextVisible) {
				yield $.clickMouse(pointToClick.x, pointToClick.y);
				if (Math.random() > 0.8) {
					for (var i = 0; i < $.random(1, 3); i++) {
						yield $.clickMouse(pointToClick.x, pointToClick.y);
						yield $.wait($.random(50, 150))
					}
				}
				yield $.wait($.random(0, 2000))
				// Move mouse off screen
				if (Math.random() > 0.5) {
					yield $.moveMouseHuman($.random(point.x-700, point.x+700), $.random(point.y-700, point.y+700))
				}
			} else {
				console.log('Skipped click because wasnt a rock')
			}
			yield $.wait($.random(3000, 8000))
		} else {
			yield $.wait($.random(500, 2000))
			console.log('Couldnt find ore')
		}

		if (Math.random() < 0.02) {
			console.log('Simulating afk')
			yield $.wait($.random(10000, 20000))
		}

		{
			if (Math.random() < 0.1) {
				console.log('Dropping ore')
				for (var i = 0; i < 5; i++) {
					inventoryMinus = { xs: inventory.xs, xe: inventory.xe, ys: inventory.ys, ye: inventory.ye -60 }
					let point = yield $.findColorTolerance(inventoryCoal, inventoryMinus, 10)
					// let clusters = $.cluster(points, 10).filter((cluster) => cluster.length > 5 )
					// let point = $.clusterCenter(clusters[0])
					if (point.x !== -1) {
						let pointToClick = { x: $.random(point.x-5, point.x+5), y: $.random(point.y, point.y+10) }
						yield $.moveMouseHuman(pointToClick.x, pointToClick.y)
						yield $.wait($.random(200, 500))
						yield $.clickMouse(pointToClick.x, pointToClick.y, true)
						yield $.wait($.random(200, 500))
						let dropPoint = { x: $.random(pointToClick.x - 45,pointToClick.x) , y: $.random(pointToClick.y + 43, pointToClick.y + 35) }
						yield $.moveMouseHuman(dropPoint.x, dropPoint.y)
						yield $.wait($.random(200, 500))
						yield $.clickMouse(dropPoint.x, dropPoint.y)
						dropCount++
						yield $.wait($.random(600, 2000))
					}
				}
				console.log('Now dropped', dropCount)
			}


			// let inventoryPlus = { xs: inventory.xs - 30, xe: inventory.xe + 30, ys: inventory.ys - 30, ye: inventory.ye + 30 }
			// let dropPoint = yield $.findBitmap('drop.png', inventoryPlus, 20)
			// yield $.moveMouseHuman(dropPoint.x, dropPoint.y)
			// console.log(dropPoint)

			// yield $.wait(10000)
		// inventoryCoal
		}



	}

	// for (point of cluster) {
	// 	if (Math.random() < 0.1) {
	// 		yield $.moveMouseHuman(point.x, point.y, 10)
	// 	}
	// }

	// let endTime = Date.now()
	// console.log('took ', endTime - startTime)

	// do {
	// 	pos = yield $.findColorTolerance(oreColor, clientPos.x, y, clientPos.x+clientSize.width, clientPos.y+clientSize.height, 10)
	// 	yield adjColor = yield $.getRealColor(pos.x + 4, pos.y)
	// 	yield adjColor2 = yield $.getRealColor(pos.x, pos.y + 4)
	// 	y = pos.y + 1
	// } while ((colorDelta(adjColor, oreColor) > 10 || (colorDelta(adjColor2, oreColor) > 10)) && y !== -1)
	//
	// if (y!==-1) {
	// 	yield $.moveMouseHuman(pos.x, pos.y, 30);
	// 	yield $.wait($.random(0, 100))
	// 	yield $.clickMouse(pos.x, pos.y);
	// }

	// var pos = yield $.findBitmap('inventory.png', clientPos.x, clientPos.y, clientPos.x+clientSize.width, clientPos.y+clientSize.height, 10)
	// yield $.moveMouseHuman(pos.x, pos.y, 30);


	// var pos = getInventoryItemCoord(27);
	// var width = pos.xe - pos.xs;
	// var height = pos.ye - pos.ys;
	// var x = pos.xs + $.random(0, width);
	// var y = pos.ys + $.random(0, height);
	// var newPos = toScreenCoords({x: x, y: y});
	// yield $.moveMouseHuman(newPos.x, newPos.y, 30);

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


// Call quit when you're done so we can free up the objects allocated for interacting with the Objective C layer
$.quit();
