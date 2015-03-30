'use strict'

var $ = require('NodObjC');
$.framework('Cocoa');
$.framework('Foundation');

var pool, cGEventSourceRef;

var init = function() {
    pool = $.NSAutoreleasePool('alloc')('init');
    cGEventSourceRef = $.CGEventSourceCreate($.kCGEventSourceStateHIDSystemState);
}

var getMousePos = function() {
    return new Promise(function(resolve, reject){
        var ourEvent = $.CGEventCreate(cGEventSourceRef); 
        var pos = $.CGEventGetLocation(ourEvent);
        resolve({x: pos.x << 0, y: pos.y << 0});
    });
}

var setMouse = function(x, y) {
    return new Promise(function(resolve, reject){
        var e = $.CGEventCreateMouseEvent(cGEventSourceRef, $.kCGEventMouseMoved, $.CGPointMake(x, y), $.kCGMouseButtonLeft);
        $.CGEventPost($.kCGHIDEventTap, e);
        // $.CFRelease(e);
        resolve();
    });
}

var mouseDown = function(x, y, right) {
    return new Promise(function(resolve, reject){
        if (right == undefined) {
            right = false;
        }
        var kCGEvent = right ? $.kCGEventRightMouseDown : $.kCGEventLeftMouseDown;
        var kCGMouseButton = right ? $.kCGMouseButtonRight : $.kCGMouseButtonLeft;
        var e = $.CGEventCreateMouseEvent(cGEventSourceRef, kCGEvent, $.CGPointMake(x, y), kCGMouseButton);
        $.CGEventPost($.kCGHIDEventTap, e);
        // $.CFRelease(e);
        resolve();
    });
}

var mouseUp = function(x, y, right) {
    return new Promise(function(resolve, reject){
        if (right == undefined) {
            right = false;
        }
        var kCGEvent = right ? $.kCGEventRightMouseUp : $.kCGEventLeftMouseUp;
        var kCGMouseButton = right ? $.kCGMouseButtonRight : $.kCGMouseButtonLeft;
        var e = $.CGEventCreateMouseEvent(cGEventSourceRef, kCGEvent, $.CGPointMake(x, y), kCGMouseButton);
        $.CGEventPost($.kCGHIDEventTap, e);
        // $.CFRelease(e);
        resolve();
    });
}

var jsCharToMacKeyCode = function (key) {
    var map = {'a': 0, 'b': 11, 'c': 8, 'd': 2, 'e': 14, 'f': 3, 'g': 5, 'h': 4, 'i': 34, 'j': 38, 'k': 40, 'l': 37, 'm': 46, 'n': 45, 'o': 31, 'p': 35, 'q': 12, 'r': 15, 's': 1, 't': 17, 'u': 32, 'v': 9, 'w': 13, 'x': 7, 'y': 16, 'z': 6, ' ': 49, 'shift': 56};
    return map[key];
}

// Keycodes defined in https://gist.github.com/willwade/5330474
var keyDown = function(char) {
    return new Promise(function(resolve, reject){
        var keyCode = jsCharToMacKeyCode(char);
        if (keyCode == undefined) {
            throw 'Unrecognised character in keyDown';
        }
        var e = $.CGEventCreateKeyboardEvent(cGEventSourceRef, keyCode, true);
        $.CGEventPost($.kCGHIDEventTap, e);
        // $.CFRelease(e);
        resolve();
    });
}

var keyUp = function(char) {
    return new Promise(function(resolve, reject){
        var keyCode = jsCharToMacKeyCode(char);
        if (keyCode == undefined) {
            throw 'Unrecognised character in keyUp';
        }
        var e = $.CGEventCreateKeyboardEvent(cGEventSourceRef, keyCode, false);
        $.CGEventPost($.kCGHIDEventTap, e);
        // $.CFRelease(e);
        resolve();
    });
}

var getDisplayId = function() {
    return $.CGMainDisplayID();
}

var getColor = function (x, y) {
    return new Promise(function(resolve, reject){
        var displayID = getDisplayId();
        var cGImageRef = $.CGDisplayCreateImageForRect(displayID, $.CGRectMake(x, y, 1, 1));
        var width = $.CGImageGetWidth(cGImageRef);
        var height = $.CGImageGetHeight(cGImageRef);
        var data = new Buffer(height * width * 4);
        var bytesPerPixel = 4;
        var bytesPerRow = bytesPerPixel * width;
        var bitsPerComponent = 8;
        var cGColorSpaceRef = $.CGColorSpaceCreateDeviceRGB();
        var cGContextRef = $.CGBitmapContextCreate(data, width, height, bitsPerComponent, bytesPerRow, cGColorSpaceRef, $.kCGImageAlphaPremultipliedLast | $.kCGBitmapByteOrder32Big);
        $.CGContextDrawImage(cGContextRef, $.CGRectMake(0, 0, width, height), cGImageRef);
        $.CGContextRelease(cGContextRef);
        resolve({r: data[0], g: data[1], b: data[2]});
    });
}

var getBitmap = function(xs, ys, xe, ye) {
    var displayID = getDisplayId();
    var image = $.CGDisplayCreateImageForRect(displayID, $.CGRectMake(xs, ys, xe - xs + 1, ye - ys + 1));
    var bitmap = $.NSBitmapImageRep('alloc')('initWithCGImage', image);
    $.CGImageRelease(image);
    return bitmap;
}

var getRealColor = function(x, y) {
    return new Promise(function(resolve, reject){
        var nSBitmapImageRep = getBitmap(x, y, x, y);
        var nSColor = nSBitmapImageRep('colorAtX', 0, 'y', 0);  
        nSBitmapImageRep('release');
        var red = nSColor('redComponent') * 255;
        var green = nSColor('greenComponent') * 255;
        var blue = nSColor('blueComponent') * 255;
        resolve({r: red, g: green, b: blue});
    });
}

var findColor = function(target, xs, ys, xe, ye) {
    return findColorTolerance(target, xs, ys, xe, ye, 0);
}

var findColorTolerance = function(target, xs, ys, xe, ye, tol) {
    return new Promise(function(resolve, reject){
        var startTime = Date.now();
        var displayID = getDisplayId();
        var cGImageRef = $.CGDisplayCreateImageForRect(displayID, $.CGRectMake(xs, ys, xe - xs + 1, ye - ys + 1));
        var width = $.CGImageGetWidth(cGImageRef);
        var height = $.CGImageGetHeight(cGImageRef);
        var data = new Buffer(height * width * 4);
        var bytesPerPixel = 4;
        var bytesPerRow = bytesPerPixel * width;
        var bitsPerComponent = 8;
        var cGColorSpaceRef = $.CGColorSpaceCreateDeviceRGB();
        var cGContextRef = $.CGBitmapContextCreate(data, width, height, bitsPerComponent, bytesPerRow, cGColorSpaceRef, $.kCGImageAlphaPremultipliedLast | $.kCGBitmapByteOrder32Big);
        $.CGContextDrawImage(cGContextRef, $.CGRectMake(0, 0, width, height), cGImageRef);
        $.CGContextRelease(cGContextRef);
        // console.log(data.toJSON());
        for (var y = 0; y <= 2 * (ye - ys); y += 2) {
            for (var x = 0; x <= 2 * (xe - xs); x += 2) {
                var r = data[4*(x + y * width)];
                var g = data[4*(x + y * width) + 1];
                var b = data[4*(x + y * width) + 2];
                // console.log('red is at '+4*(x + y * width)+', green is at '+4*(x + y * width + 1)+', blue is at '+4*(x + y * width + 2));
                // console.log('color at '+(xs + x/2)+', '+(ys + y/2) + ' is '+r+', '+g+', '+b);
                if (Math.abs(r - target.r) + Math.abs(g - target.g) + Math.abs(b - target.b) <= tol) {
                    // setMouse(xs + x/2, ys + y/2);
                    resolve({x: xs + x/2, y: ys + y/2});
                }
            }
        }
        var endTime = Date.now();
        var timeDelta = endTime-startTime;
        console.log('Done. Took '+timeDelta+'ms, or '+(timeDelta/((xe-xs)*(ye-ys)))+'ms per pixel.');
        resolve({x: -1, y: -1});
    });
}


var quit = function() {
    pool('drain');
}

module.exports = {
    init: init,
    getMousePos: getMousePos,
    setMouse: setMouse,
    mouseDown: mouseDown,
    mouseUp: mouseUp,
    keyDown: keyDown,
    keyUp: keyUp,
    getColor: getColor,
    getRealColor: getRealColor,
    findColor: findColor,
    findColorTolerance: findColorTolerance,
    quit: quit
}
