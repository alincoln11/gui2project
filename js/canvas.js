/*
	Created on  : Jan 26 2014
	Author      : Daniel Kolsoi
	Description : Script for the canvas functions.
*/

function Node(x, y) {
	// Data structure variables:
	var pos = {x: x, y: y};
	var person = Person();

	//tmp:
	person.setFirstName("Test");
	person.setLastName("Name");

	// Getter function(s):
	function getPosition() {
		return pos;
	}

	function getData() {
		return person;
	}

	return {
		getData: getData,
		getPosition: getPosition
	};
}

function Canvas(id) {
	// Canvas and buffer variables:
	var mElement = document.getElementById(id),
		bElement = document.createElement('canvas'),
		mainBuffer = mElement.getContext("2d"),
		backBuffer = bElement.getContext("2d");

	// Flag variables:
	var redrawBuffer = false,
		scrolling = false;

	// Data Structure variables:
	var scroll = {x: 0, y: 0},
		selections = {left: null, right: null},
		nodes = [];

	// This is the function that will draw to the back buffer only when something new happens on screen:
	function draw() {
		var pos;

		// Start by clearing the screen:
		backBuffer.clearRect(0, 0, mElement.width, mElement.height);

		// Draw nodes and connections:
		for (var i = 0; i < nodes.length; i++) {
			pos = nodes[i].getPosition();

			backBuffer.beginPath();
			backBuffer.arc(pos.x, pos.y, 40, 2 * Math.PI, 0);
			backBuffer.fillStyle = "gray";

			// tmp, color TBD:
			if (selections.left == nodes[i] || selections.right == nodes[i])
				backBuffer.fillStyle = "green";

			backBuffer.fill();
			backBuffer.lineWidth = 5;
			backBuffer.strokeStyle = "black";

			// tmp, color TBD:
			if (selections.left == nodes[i] || selections.right == nodes[i])
				backBuffer.strokeStyle = "#003300";
			
			backBuffer.stroke();
		}
	}

	function update() {
		if (redrawBuffer) {
			draw();
		}

		// if scrolling, shift scrolled version of back buffer onto front:
		// --- scroll not tested in demo ---
		if (redrawBuffer) { // || scrolling) ?
			mainBuffer.drawImage(bElement, scroll.x, scroll.y);
			redrawBuffer = false;
		}
	}

	function scroll(xVelocity, yVelocity) {
		// not final nor essential to demo:
		scroll.x += xVelocity;
		scroll.y += yVelocity;
	}

	function resetCamera() {
		// Not sure if actually needed.
		scroll.x = 0;
		scroll.y = 0;
	}

	// Sets the width & height of the canvas:
	function resize(width, height) {
		mainBuffer.canvas.width  = width;
		mainBuffer.canvas.height = height;

		backBuffer.canvas.width  = width;
		backBuffer.canvas.height = height;

		redrawBuffer = true;
	}

	// This function will return the left and right selected nodes.
	function getSelections() {
		return selections;
	}

	// This function will handle updating the canvas and fps syncing:
	function animate() {
		var time = 0,
			inc = 0.1;

		// Immediate Anonymous Loop:
		(function loop() {
			requestAnimationFrame(loop);
			time += inc;
			update();
		}());
	}

	// Handle the canvas being clicked:
	$('#' + id).mousedown(function(event) {
		// x & y based on code from https://stackoverflow.com/questions/3067691/html5-canvas-click-event:
		var x = event.pageX - $('#' + id).offset().left;
		var y = event.pageY - $('#' + id).offset().top;

		var pos, pythag;

		// Create a node if placed in open space:
		for (var i = 0; i < nodes.length; i++) {
			pos = nodes[i].getPosition();

			// Ignore node if offscreen:
			if (pos.x < scroll.x || pos.y < scroll.y ||
				pos.x > mainBuffer.canvas.width + scroll.x ||
				pos.y > mainBuffer.canvas.height + scroll.y) {
				
				continue;
			}
			
			pythag = Math.pow((x - pos.x), 2) + Math.pow((y - pos.y), 2); // x^2 + y^2:
			// Node was selected.
			if (pythag < 1600) { // radius of 40^2 = 1600
				switch (event.which) {
					case 1: // Left mouse
						if (selections.left == nodes[i]) { // For future: Do not deselect if the detail panel is checked to stay open
							//$("#leftDetail").hide();
							$(window).resize();
							selections.left = null;
							redrawBuffer = true;
						}
						else {
							//$("#leftDetail").show();
							$(window).resize();
							selections.left = nodes[i];
							redrawBuffer = true;
						}
						return;
					case 2: // Middle mouse

					case 3: // Right Mouse
						return;
					default:
						break;
				}
			}
			// Tried placing a new node onto an existing node:
			else if (pythag < 7056) // (2*radius of 80 + small offset)^2 = 7056
				return;
		}
		switch (event.which) {
			case 3: // Right mouse
				var node = Node(x + scroll.x, y + scroll.y);
				nodes.push(node);
				redrawBuffer = true;

			default:
				break;
		}
	});

	// Here is the returned JSOL which allows public access of certain functions:
	return {
		animate: animate,
		getSelections: getSelections,
		resize: resize
		// more stuff
	};
}