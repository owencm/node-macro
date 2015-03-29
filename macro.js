'use strict'

var $ = require('NodObjC');
$.framework('Cocoa');
$.framework('Foundation');

var pool;

var init = function() {
    pool = $.NSAutoreleasePool('alloc')('init');
}

var getMousePos = function() {
    var ourEvent = $.CGEventCreate(null); 
    var pos = $.CGEventGetLocation(ourEvent);
    return {x: pos.x << 0, y: pos.y << 0}
}

var setMouse = function(x, y) {
    var e = $.CGEventCreateMouseEvent(null, $.kCGEventMouseMoved, $.CGPointMake(x, y), $.kCGMouseButtonLeft);
    $.CGEventPost($.kCGHIDEventTap, e);
    // $.CFRelease(e);
}

var mouseDown = function(x, y, right) {
    if (right == undefined) {
        right = false;
    }
    var kCGEvent = right ? $.kCGEventRightMouseDown : $.kCGEventLeftMouseDown;
    var kCGMouseButton = right ? $.kCGMouseButtonRight : $.kCGMouseButtonLeft;
    var e = $.CGEventCreateMouseEvent(null, kCGEvent, $.CGPointMake(x, y), kCGMouseButton);
    $.CGEventPost($.kCGHIDEventTap, e);
    // $.CFRelease(e);
}

var mouseUp = function(x, y, right) {
    if (right == undefined) {
        right = false;
    }
    var kCGEvent = right ? $.kCGEventRightMouseUp : $.kCGEventLeftMouseUp;
    var kCGMouseButton = right ? $.kCGMouseButtonRight : $.kCGMouseButtonLeft;
    var e = $.CGEventCreateMouseEvent(null, kCGEvent, $.CGPointMake(x, y), kCGMouseButton);
    $.CGEventPost($.kCGHIDEventTap, e);
    // $.CFRelease(e);
}

var jsCharToMacKeyCode = function (key) {
    var map = {'a': 0, 'b': 11, 'c': 8, 'd': 2, 'e': 14, 'f': 3, 'g': 5, 'h': 4, 'i': 34, 'j': 38, 'k': 40, 'l': 37, 'm': 46, 'n': 45, 'o': 31, 'p': 35, 'q': 12, 'r': 15, 's': 1, 't': 17, 'u': 32, 'v': 9, 'w': 13, 'x': 7, 'y': 16, 'z': 6};
    return map[key];
}

// Keycodes defined in https://gist.github.com/willwade/5330474
var keyDown = function(char) {
    var keyCode = jsCharToMacKeyCode(char);
    if (keyCode == undefined) {
        throw 'Unrecognised character in keyDown';
    }
    var e = $.CGEventCreateKeyboardEvent(null, keyCode, true);
    $.CGEventPost($.kCGHIDEventTap, e);
    // $.CFRelease(e);
}

var keyUp = function(char) {
    var keyCode = jsCharToMacKeyCode(char);
    if (keyCode == undefined) {
        throw 'Unrecognised character in keyDown';
    }
    var e = $.CGEventCreateKeyboardEvent(null, keyCode, false);
    $.CGEventPost($.kCGHIDEventTap, e);
    // $.CFRelease(e);
}

var getDisplayId = function() {
    return $.CGMainDisplayID();
}

var getBitmap = function(xs, ys, xe, ye) {
    var displayID = getDisplayId();
    var image = $.CGDisplayCreateImageForRect(displayID, $.CGRectMake(xs, ys, xe - xs + 1, ye - ys + 1));
    var bitmap = $.NSBitmapImageRep('alloc')('initWithCGImage', image);
    $.CGImageRelease(image);
    return bitmap;
}

var processScreen = function(xs, ys, xe, ye) {
    var displayID = getDisplayId();
    console.log(xs, ys, xe, ye);
    var cGImageRef = $.CGDisplayCreateImageForRect(displayID, $.CGRectMake(xs, ys, xe - xs + 1, ye - ys + 1));
    var width = $.CGImageGetWidth(cGImageRef);
    var height = $.CGImageGetHeight(cGImageRef);
    console.log(width+', '+height);
    var cFDataRef = $.CGDataProviderCopyData($.CGImageGetDataProvider(cGImageRef));
    var data = $.CFDataGetBytePtr(cFDataRef);
    var buffer = new Buffer(data);
    console.log(buffer.toJSON());
    // for (var x = 0; x < width; x += 2) {
    //     for (var y = 0; y < height; y += 2) {

    //     }
    // }
    var color = {r: buffer.readUInt8(2), g: buffer.readUInt8(1), b: buffer.readUInt8(0)};
    // console.log(color);
    $.CGDataProviderRelease(cFDataRef);
    return color;
}

var oldGetColor = function(x, y) {
    var bitmap = getBitmap(x, y, x, y);
    var color = bitmap('colorAtX', 0, 'y', 0);  
    bitmap('release');
    var red = color('redComponent');
    var green = color('greenComponent');
    var blue = color('blueComponent');
    return {r: red, g: green, b: blue};    
}

var getColor = function(x, y) {
    var bitmap = getBitmap(x, y, x, y);
    var pixelData = new Buffer(17);
    bitmap('getPixel', pixelData, 'atX', 0, 'y', 0); 
    bitmap('release');
    return {r: pixelData.readUInt8(0), g: pixelData.readUInt8(8), b: pixelData.readUInt8(16)};
}

var findColor = function(targetColor, xs, ys, xe, ye) {
    console.log('start');
    var bitmap = getBitmap(xs, ys, xe, ye);
    var pixelData = new Buffer(17);
    for (var xi = 0; xi <= (xe - xs) * 2; xi += 2) {
        for (var yi = 0; yi <= (ye - ys) * 2; yi += 2) {
            if (Math.random() < 0.01) setMouse(xs+xi/2, ys+yi/2);
            bitmap('getPixel', pixelData, 'atX', xi, 'y', yi); 
            var color = {r: pixelData.readUInt8(0), g: pixelData.readUInt8(8), b: pixelData.readUInt8(16)};
            if (color.r == targetColor.r && color.g == targetColor.g && color.b == targetColor.b) {
                bitmap('release');
                console.log('done');
                return {x: xs + xi/2, y: ys + yi/2};
            }
        }
    }
    bitmap('release');
    return {x: -1, y: -1};
}

// Convenience functions written on top of the above API



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
    findColor: findColor,
    processScreen: processScreen,
    quit: quit
}
