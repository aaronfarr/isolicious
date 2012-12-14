// Global Variables
var images = [];  // array of Image() objects
var sprites = []; // array of Sprite objects
var layers = [];   // array of Layer objects

var world = new Rect( 0, 0, 5120, 2560 );
var camera = new Rect( 0, 0, 0, 0 );

var lastRun;
var grid = new Rect( 0, 0, 30, 30 );
// Object Definitions //
function Rect( x, y, width, height ) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}
function Point( x, y ) {
	this.x = x;
	this.y = y;
}
function Sprite( x, y, w, h, i, l ) {
	this.x = x; // x
	this.y = y; // y
	this.width = w; // width
	this.height = h; // height
	this.image = i; // image object index
	this.layer = l; // layer
}
function Layer( canvas ) {
	this.canvas = canvas;
	this.width  = canvas.canvas.width;
	this.height = canvas.canvas.height;
	this.update = true;
}

function main() {
	initialize();
	loop();
}

///////////////////////////////////////////////////////////////////////////////
// Main Functions.
///////////////////////////////////////////////////////////////////////////////
function initialize() {
	// Disable the ability to select text inside the window.
	document.onselectstart = function() { return false; }
	// Initialize image objects.
	images.push( loadImage( "grass.png" ) );	// 0
	images.push( loadImage( "floor-1.png" ) );	// 1
	images.push( loadImage( "wall-l.png" ) );	// 2
	images.push( loadImage( "wall-r.png" ) );	// 3
	images.push( loadImage( "mask.png" ) );		// 4
	// Initialize layers.
	layers.push( CreateLayer( "layer1" ) ); // background
	layers.push( CreateLayer( "layer2" ) ); // floor
	layers.push( CreateLayer( "layer3" ) ); // walls
	// Initialize sprites.
	// Create the ground.
	gw = 256; gh = 128;	gw2 = gw/2; gh2 = gh/2; // ground tile metrics
	for( var dy=0; dy <= world.height / gh2 - 1; dy++ ) {
		for( var dx=0; dx <= world.width / gw - 1; dx++ ) {
			sprites.push( ( dy % 2 == 0 ) ? new Sprite(dx*gw+gw2,dy*gh2,gw,gh,0,0) : new Sprite(dx*gw,dy*gh2,gw,gh,0,0) );
		}
	}
	// Create the floor.
	var jqxhr = $.get( "floor-map.ini" )
	.success( function(data) {
		var floor = data.split(',');
		var fw = 130; fh = 64; fw2 = fw/2; fh2 = fh/2;
		var ox = world.width/2;
		var oy = 32 + (world.height/2) - (fh * grid.height / 2);
		for( var dy=0; dy<grid.height; dy++ ) {
			for( var dx=0; dx<grid.width; dx++ ) {
				var i = parseInt(floor[dy*grid.width+dx]);
				if( i ) sprites.push( new Sprite((dx * fw2) - (dy * fw2) + ox,(dx * fh2) + (dy * fh2) + oy,fw,fh,i,1) );
			}
		}
	});
	// Create the walls.
	var jqxhr = $.get( "wall-map-l.ini" )
	.success( function(data) {
		var walls = data.split(',');
		var ww = 130; wh = 64; ww2 = ww/2; wh2 = wh/2;
		var wox = 0; // wall offset-x
		var woy = 112; // wall offset-y
		var ox = world.width/2;
		var oy = 32 + (world.height/2) - (fh * grid.height / 2);
		for( var dy=0; dy<grid.height; dy++ ) {
			for( var dx=0; dx<grid.width; dx++ ) {
				var i = parseInt(walls[dy*grid.width+dx]);
				if( i ) sprites.push( new Sprite((dx * ww2) - (dy * ww2) + ox - wox,(dx * wh2) + (dy * wh2) + oy - woy,ww,wh,i,2) );
			}
		}
	});
	var jqxhr = $.get( "wall-map-r.ini" )
	.success( function(data) {
		var walls = data.split(',');
		var ww = 130; wh = 64; ww2 = ww/2; wh2 = wh/2;
		var wox = -64; // wall offset-x
		var woy = 112; // wall offset-y
		var ox = world.width/2;
		var oy = 32 + (world.height/2) - (fh * grid.height / 2);
		for( var dy=0; dy<grid.height; dy++ ) {
			for( var dx=0; dx<grid.width; dx++ ) {
				var i = parseInt(walls[dy*grid.width+dx]);
				if( i ) sprites.push( new Sprite((dx * ww2) - (dy * ww2) + ox - wox,(dx * wh2) + (dy * wh2) + oy - woy,ww,wh,i,2) );
			}
		}
	});
	// Initialize camera.
	//camera = new Rect( (world.width/2+64)-(camera.width/2),(world.height/2)-(camera.height/2), layers[0].width, layers[0].height );
	camera = new Rect( world.width/2 - layers[0].width/2 + 128, world.height/2 - layers[0].height/2 + 64, layers[0].width, layers[0].height );
	console.log( layers[0].width );
	console.log( layers[0].height);
	//camera = initializeCamera( layers[0] );
	// Initialize mouse input.
	var touchable = $("#layer3").Touchable();
	touchable.bind('touchablemove', function(e, touch) {
		camera.x += (touch.startTouch.x - touch.previousTouch.x);
		camera.y += (touch.startTouch.y - touch.previousTouch.y);
		// Enforce Restrictions.
		if( camera.x < 128 ) camera.x = 128;
		if( camera.y < 64 ) camera.y = 64;
		if( camera.x > world.width  - layers[0].width ) camera.x = world.width  - layers[0].width;
		if( camera.y > world.height - layers[0].height) camera.y = world.height - layers[0].height;
		touch.startTouch.x = touch.previousTouch.x;
		touch.startTouch.y = touch.previousTouch.y;
		layers[0].update = true;
		layers[1].update = true;
		layers[2].update = true;
	});
	touchable.bind('touchableend', function(e, touch) {
		//
	});
	touchable.bind('doubleTap', function(e, touch) {
		//
	});
}

function loop() {
	// Main game timer.
	window.setTimeout( loop, 1 );
	// Calculate FPS.
	var now = Date.now();
	var delta = now - lastRun;
	lastRun = now;
	$("#fps").html( "FPS: " + ~~( 1000 / delta ) + "<br>Camera: " + camera.x + "," + camera.y  );
	// Repaint the scene.
	for( var l=0; l<3; l++ ) {
		if( layers[l].update ) paint( l, camera );
	}
	//layers[2].strokeStyle = "purple";
	//layers[2].canvas.strokeRect(0,0,camera.width/2,camera.height/2);
	// Persistent UI drawing here.
}

function paint( layer, camera ) {
	target = layers[layer];
	target.update = false;
	target.canvas.clearRect( 0, 0, target.width, target.height );

	target.canvas.save();
	target.canvas.translate( -camera.x, -camera.y );
	for( var i=0; i < sprites.length; i++ ) {
		if( sprites[i].layer == layer ) {
			if( intersectRect( sprites[i], camera ) ) {
				target.canvas.drawImage( images[sprites[i].image], sprites[i].x, sprites[i].y );
			}
		}
	}
	target.canvas.restore();
}

///////////////////////////////////////////////////////////////////////////////
// Helper Functions.
///////////////////////////////////////////////////////////////////////////////
function initializeCamera( viewport ) {
	return new Rect( 0, 0, viewport.width, viewport.height );
}

// Collision detection between two Rects //
function intersectRect(r1, r2) {
	var r1r = r1.x + r1.width;
	var r2r = r2.x + r2.width;	
	var r1b = r1.y + r1.height;
	var r2b = r2.y + r2.height;
	return (
			((r2.x <= r1.x) && (r1.x <= r2r))  || 
			((r2.x <= r1r ) && (r1r  <= r2r))
		) && (
			((r2.y <= r1.y) && (r1.y <= r2b)) || 
			((r2.y <= r1b ) && (r1b  <= r2b))
		);
}

// Is a point inside a Rect? //
function pointInRect( p, r ) {
	return p.x <= (r.x + r.width) && p.x >= r.x && p.y < (r.y + r.height) && p.y > r.y;
}

// Load Image //
function loadImage( filename ) {
	var img = new Image();
	img.src = filename;
	return img;
}

// Create Layer //
function CreateLayer( id ) {
	// Initialize Canvas.
	canvas = (document.getElementById( id )).getContext( "2d" );
	canvas.canvas.width  = window.innerWidth;
	canvas.canvas.height = window.innerHeight;
	var layer = new Layer( canvas );
	return layer;
}