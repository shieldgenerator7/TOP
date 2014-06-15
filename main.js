 //main.js
 //cleaned 1-23-2014
 //cloned for TOP 6-13-2014

var width = 1500,
height = 1000,
maxPonies = 10,//the amount of ponies in the ponyArray
newPony,//the latest "unlocked" pony
mouseX, mouseY,//stored mouse coordinates
gLoop,
c = document.getElementById('c'),
ctx = c.getContext('2d');
DIR = "Resources/";
PONY_DIR = DIR.concat("Ponies/");

var modeTime = 0;//counts the amount of time in any one gameMode
var gameMode = "title_screen";
var previousGameMode = "title_screen";//used to allow returning to previous game mode, mostly for the settings page because it can be called from two places
//title_screen: showing the title and the game dev marathon logo
//chest_inactive: the chest is closed and inactive
//chest_opening: the chest lid opening animation is playing
//chest_pony_up: the pony is rising out of the chest
//chest_pony_out: the pony is out and enlarging itself on the screen (is this going to be used?)
//chest_info: the pony's name, rarity, and picture are dispalyed on the screen until a mouse click
//chest_slide: the current chest (and pony and accompanying sprites) slide off the screen to make way for a new chest
//pony_info: state showing the ponies' info
//credits: the state showing the credits (I imagine it'll have to auto scroll through the long list)

c.width = window.innerWidth;//800
c.height = window.innerHeight;//500
var desiredHeight = 1000, desiredWidth = 1500;//the desired dimensions, which will be scaled down
var areaHeight = desiredHeight, areaWidth = desiredWidth;//the dimensions of the part of the canvas where the game will be drawn
var tcx = (c.width - desiredWidth)/2;//"true canvas x": the left most position of the part of the canvas we want to draw on
var canvasRatio = 1;//the ratio of desired to actual so you can scale all other images easily.

var setupCanvas = function(){//sets up the canvas dimensions 
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	areaHeight = c.height;
	areaWidth = (desiredWidth*areaHeight)/desiredHeight;//make the width proportional
	tcx = (c.width - areaWidth)/2;//set the true canvas x variable
	canvasRatio = areaHeight / desiredHeight;
	//
	//Set up ctx text settings
	ctx.textAlign="left"; 
	ctx.textBaseline="top"; 
	ctx.font = "15px Times New Roman"
	ctx.save();
}
setupCanvas();

window.onresize = setupCanvas;
document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only

var centerX = function(width){//returns the x value that will draw this image in the center of the canvas (does not use tcx, uses scalex)
	return (desiredWidth - width)/2;
}

var centerY = function(height){//returns the y value that will draw this image in the center of the canvas (does not use tcx, uses scaley)
	return (desiredHeight - height)/2;
}

var convertWidth = function(width){//returns the width that will scale this image down to fit on the canvas proportionally
	return width*canvasRatio;
}

var convertHeight = function(height){//returns the width that will scale this image down to fit on the canvas proportionally
	return height*canvasRatio;
}

var scaleImage = function(image, nW, nH){
	var newWidth = nW;
	var newHeight = nH;
	if (newWidth != 0 || newHeight != 0){
		if (newHeight == 0){//scale the image to the new width
			newHeight = newWidth/image.width*image.height;
		}
		else if (newWidth == 0){//scale the image to the new height
			newWidth = newHeight/image.height*image.width;
		}
		//else just set the new dimensions
			image.width = newWidth;
			image.height = newHeight;
		
	}
	//else if both are zero do nothing
}

var convertXPos = function(x){
	return x * canvasRatio + tcx;
}

var convertYPos = function(y){
	return y * canvasRatio;
}

var backGroundImg = new Image();
backGroundImg.src = DIR.concat("background.png");
var clear = function(){
	var img = new Image();
	img.src = DIR.concat("background.png");

	ctx.clearRect(0, 0, c.width, c.height);
	ctx.beginPath();
	ctx.rect(tcx, 0, areaWidth, areaHeight);
	ctx.closePath();
	//ctx.drawImage(img,0,0);
	if (backGroundImg.width > 0){scaleImage(backGroundImg, 0, areaHeight);}//backGroundImg.width = 100;}
	ctx.drawImage(backGroundImg,(areaWidth-backGroundImg.width)/2+tcx,0,backGroundImg.width, areaHeight);

	// ctx.fillStyle = 'black';
	// ctx.font="20px Arial";
	// ctx.fillText("Score: " + score,0,480);
}

var drawForeGround = function(){
	var prevFillStyle = ctx.fillStyle;
	ctx.fillStyle = 'black';//'#BAF1FA';
	ctx.beginPath();
	ctx.fillRect(0, 0, tcx, c.height);	
	ctx.closePath();
	ctx.beginPath();
	ctx.fillRect(tcx + areaWidth, 0, tcx, c.height);
	ctx.closePath();
	ctx.fillStyle = prevFillStyle;
}

var switchGameMode = function(mode){
	if (mode == "previous"){
		mode = previousGameMode;
	}
	previousGameMode = gameMode;
	gameMode = mode;
	modeTime = 0;
	if (!playerFiring){
		playerFired = false;
	}
}
//
// This section for loading an image with the image's original width and height
//
var imgHeight;
var imgWidth;
function findHHandWW() {
	imgHeight = this.height;imgWidth = this.width;
	if (this.width > desiredWidth){
		scaleImage(this, desiredWidth-10, 0);
	}
	return true;
}

function showImage(imgPath) {
    var myImage = new Image();
    myImage.name = imgPath;
    myImage.onload = findHHandWW;
    myImage.src = imgPath;
	return myImage;
}
  /////

//makes a button that switches gameModes when clicked
function Button(text, x, y, modeTo){
	var that = this;
	that.img = new Image();
	
	that.img = showImage(DIR.concat(text,".png"));
	that.width = imgWidth;
	that.height = imgHeight; 
	
	var overImg = showImage(DIR.concat(text,"_over.png"));//used just to preload the over image
	
	that.X = x;
	that.Y = y;
	that.text = text;
	that.modeTo = modeTo;
	that.mouseOver = false;
	
	//checks to see if it's been clicked
	that.checkClick = function(x, y, click){
		that.mouseOver = false;
		that.img.src = DIR.concat(text,".png");
			if (x > convertXPos(that.X)){//mouse-button collision detection
				if (x < convertXPos(that.X + that.img.width)){
					if (y > convertYPos(that.Y)){
						if (y < convertYPos(that.Y + that.img.height)){
							if (click){
								return that.onClick();
							}
							else
								that.onMouseOver();
						}
					}
				}
			}
		return false;
	}
	//activates the button when clicked
	that.onClick = function(){
		if (that.modeTo){
			switchGameMode(that.modeTo);
		}
		return true;
	}
	//paints the button differently when moused over
	that.onMouseOver = function(){
		that.mouseOver = true;
		that.img.src = DIR.concat(text,"_over.png");
	}
	//draws the button
	that.draw = function(){
		ctx.drawImage(that.img, convertXPos(that.X), convertYPos(that.Y), convertWidth(that.img.width), convertHeight(that.img.height));
	}
}






//
// Player
//
function Player(name, id){
	var that = this;
	
	that.name = name;
	that.id = id;
	
	that.pony = null;
	
	that.totalPoints = 0;
	that.roundWins = 0;
	
	that.setPony = function(pony){
		that.pony = pony;
	}
	
	//keys
	if (that.id == 1){
		that.up = 87;//W
		that.left = 65;//A
		that.down = 83;//S
		that.right = 68;//D
		that.A = 67;//C
		that.B = 70;//F
		that.C = 71;//G
		that.D = 66;//B
	}
	else if (that.id == 2){
		that.up = 38;//up arrow
		that.left = 37;//left arrow
		that.down = 40;//down arrow
		that.right = 39;//right arrow
		that.A = 74;//J
		that.B = 73;//I
		that.C = 79;//O
		that.D = 186;//";" key
	}
	
	that.acceptKeys = function(){
		var moveCode = 1;
		if (keyMap[that.up]){moveCode *= 2;}
		if (keyMap[that.left]){moveCode *= 3;}
		if (keyMap[that.down]){moveCode *= 5;}
		if (keyMap[that.right]){moveCode *= 7;}
		if (keyMap[that.A]){moveCode *= 11;}
		if (keyMap[that.B]){moveCode *= 13;}
		if (keyMap[that.C]){moveCode *= 17;}
		if (keyMap[that.D]){moveCode *= 19;}
		// ctx.fillText(that.name+"("+that.pony.name+").moveCode: "+moveCode, 20 + tcx, 50+(that.id*50));
		that.pony.acceptMoveCode(moveCode);
	}
	
	that.update = function(){
		that.pony.update();
	}
	
	that.draw = function(){
		that.pony.draw();
	}
}
var player1 = new Player("Player 1", 1);
var player2 = new Player("Player 2", 2);

function toOne(i){
	if (i > 0)return 1;
	else if (i < 0)return -1;
	else return 0;
}

//
// Pony
//
function Pony(name,initFunction){//Name of pony, also used for getting image. This is the actually sprite class in the game
	var that = this;
	
	that.initFunction = initFunction;
	initFunction(that);
	
	that.name = name;
	// that.rarity = "Rarity deprecated";
	// that.description = "Description deprecated";
	
	that.image = new Image();
	that.markForDeletion = false;
	
	// that.index = 0;//the index number that it is in the array
	// that.setIndex = function(index){
		// that.index = index;
	// }

	that.image = showImage(PONY_DIR.concat(name,".png"));
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = 0;
	that.Y = 0;//desiredHeight - that.image.height;
	that.velX = 0;//used for moving
	that.velY = 0;
	that.maxVel = 5;
	that.maxJumpFuel = 20;
	that.jumpFuel = that.maxJumpFuel;//the amount of jump fuel they have, resets when they land
	
	that.sound = new Audio(PONY_DIR.concat(name,".mp3"));
			
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	//returns the pony's index number + 1
	// that.getNumber = function(){
		// return that.index + 1;
	// }
	// this method checks to see if this pony has been clicked on
	// that.checkClick = function(x, y){
		// if (!that.markForDeletion){//if pony is still alive
			// if (x > that.X){//mouse-pony collision detection
				// if (x < that.X + that.width){
					// if (y > that.Y){
						// if (y < that.Y + that.height){
								// return that.onClick();//it has been clicked on, and activated
						// }
					// }
				// }
			// }
		// }
		// return false;//pony is not clicked on
	// }
	//Carry out onClick operations, depending on game state
	// that.onClick = function(){
	// //returns true as default unless otherwise specified
		// switch (gameMode){
			// case "play": 
				// that.hit(); 
				// break;
			// case "chooseSave": that.capture(); break;
		// }
		// return true;
	// }
	that.getBottom = function(){//returns the bottom y value
		return that.Y + that.image.height;
	}
	// gives pony orders from player
	that.acceptMoveCode = function(moveCode){
		var moveIncrease = 2;
		if (moveCode % 2 == 0 && that.canJump()){that.velY -= moveIncrease*3;}//up
		if (moveCode % 3 == 0){that.velX -= moveIncrease;}//left
		if (moveCode % 5 == 0){that.velY += moveIncrease;}//down
		if (moveCode % 7 == 0){that.velX += moveIncrease;}//right
	}
	// this makes the pony respond to a clock tick
	that.update = function(){
		that.move();
		
		that.gravity();
		
		if (that.velX > 0){that.velX--;}
		else if (that.velX < 0){that.velX++;}
		if (that.velX > that.maxVel){that.velX = that.maxVel;}
		else if (that.velX < that.maxVel*-1){that.velX = that.maxVel*-1;}
		
		// if (that.velY > 0){that.velY--;}
		// else if (that.velY < 0){that.velY++;}
		if (that.velY > that.maxVel){that.velY = that.maxVel;}
		else if (that.velY < that.maxVel*-1){that.velY = that.maxVel*-1;}
	}
	// this makes the pony move based on its direction
	that.move = function(){		
		var vx = that.velX, vy = that.velY;
		if (that.checkCollisionVelocity()){//if there's a collision
			var ol2 = that.X, or2 = that.X + that.image.width, ot2 = that.Y, ob2 = that.Y + that.image.height;
			var firstChecker = 1;
			while( ( ! level.checkCollision(that,ol2,ot2,or2,ob2)) && (that.X+vx != ol2 || that.Y+vy != ot2)){
				if (that.X+vx != ol2){ol2 += toOne(vx); or2 += toOne(vx);}
				else{
					if (firstChecker == 1 || firstChecker == 4){firstChecker += 2;}//(1+2)*4=12
				}
				if (that.Y+vy != ot2){ot2 += toOne(vy); ob2 += toOne(vy);}
				else{
					if (firstChecker == 1 || firstChecker == 3){firstChecker *= 4;}//(1*4)+2=6;
				}
			}
			if (firstChecker == 12 || firstChecker == 3){//if x finished first, meaning it's clear
				that.X += that.velX;
				that.Y = ot2 - toOne(vy);
				console.info("1y: ",that.Y,ot2);
			}
			else if (firstChecker == 6 || firstChecker == 4){//if y finished first, meaning it's clear	
				that.X = ol2 - toOne(vx);
				that.Y += that.velY;
				console.info("2x: ",that.X,ol2);
			}
			else{
				that.X = ol2 - toOne(vx);
				that.Y = ot2 - toOne(vy);
				// that.X += that.velX;
				// that.Y += that.velY;
				console.info("3x: ",that.X,ol2);
				console.info("3y: ",that.Y,ot2);
			}
			// that.velX = -ol2 + that.X - toOne(vx);
			// that.velY = -ot2 + that.Y - toOne(vy);
		}
		else{
			that.X += that.velX;
			that.Y += that.velY;
		}
	}
	//this function sees if the rect of movement is all clear
	that.checkCollisionVelocity = function(){
		var ol = that.X, or = that.X + that.image.width, ot = that.Y, ob = that.Y + that.image.height;
		var vx = that.velX, vy = that.velY;
		if (vx < 1){ol+=vx;}
		else{or+=vx;}
		if (vy < 1){ot+=vy;}
		else{ob+=vy;}
		return level.checkCollision(that, ol, ot, or, ob)
	}
	that.gravityAmount = 1;
	that.gravityThreshold = 4;
	//applies gravity to the pony
	that.gravity = function(){
		if ( ! that.isOnGround()){
			if (that.velY < that.gravityThreshold){that.velY += that.gravityAmount;}
			that.jumpFuel--;
		}
		else{
			if (that.velY > 0){that.velY = 0;}
			that.jumpFuel = that.maxJumpFuel;
		}
	}
	//returns true if the pony is standing on something
	that.isOnGround = function(){
		var ol = that.X, or = that.X + that.image.width, ot = that.Y, ob = that.Y + that.image.height;
		return level.checkCollision(that, ol, ot, or, ob);
		// return that.Y + that.image.height >= desiredHeight-1;
	}
	//returns true if the conditions are right for the character to jump
	that.canJump = function(){
		return that.isOnGround() || that.jumpFuel > 0;
	}
	// that.slideOff = function(){
		// that.velX = -10;
		// that.velY = 0;
		// that.move();
	// }
	that.isOffScreen = function(){//only determines if off left edge
		return that.X + that.image.width < 0;
	}
	
	//Function called when hit with magic blast
	that.remove = function(){
		that.markForDeletion = true;
	}

	//that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			// if (that.velX == 0){
				// that.X = centerX(that.image.width);
			// }
			try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(that.X), convertYPos(that.Y), convertWidth(that.image.width), convertHeight(that.image.height));
				// ctx.fillStyle = 'black';
				// ctx.font="20px Arial";
				// ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
			}
			catch (e) {
			};

			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;	
		}
	}
	that.drawScale = function(nW, nH){//"new width", "new height"
		var newWidth = nW,
		newHeight = nH;
		if (newWidth != 0 || newHeight != 0){
			if (newHeight == 0){//scale the image to the new width
				newHeight = newWidth/that.image.width*that.image.height;
			}
			else if (newWidth == 0){//scale the image to the new height
				newWidth = newHeight/that.image.height*that.image.width;
			}			
		}
		else {
			newWidth = that.image.width;
			newHeight = that.image.height;
		}
		if (!that.markForDeletion){
			// try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(centerX(newWidth)), convertYPos(that.Y), convertWidth(newWidth), convertHeight(newHeight));
			// }
			// catch (e) {
			// };		
		}
	}
}

var setDiscord = function(pony){
	pony.name = "Discord";
}

var setTrixie = function(pony){
	pony.name = "Trixie";
}

//SAVE: Adding to array
//ponyArray: the pony template array
var ponyArray = [
	new Pony("Discord",setDiscord),
	new Pony("Trixie",setTrixie)	
];
maxPonies = ponyArray.length;
// for (var i = 0; i < maxPonies; i++){
	// var pony = ponyArray[i];//new Pony("pinkies");//this makes new pinkies and handles adding it to the array
	// pony.setIndex(i);
// }
var ponyCollection = [];//the array that stores which ponies the player has obtained

// var pickRandomPony = function(){
	// if (forcedPony){
		// var pony = forcedPony;
		// forcedPony = 0;
		// return pony;
	// }
	// var ri = Math.floor(Math.random() * ((maxPonies) - 0 + 1)) + 0;//"random index"
	// if (ri == maxPonies){ri = Math.floor(Math.random() * ((maxPonies) - 0 + 1)) + 0; }//window.alert("ri = maxPonies!");}
	// if (ponyArray[ri]){
		// return new Pony(ponyArray[ri].name, ponyArray[ri].initFunction);
	// }
	// else{
		// return new Pony("Unknown",setDiscord);
	// }
// }

//
// Block
//
function Block(imgName, x, y){//Blocks that the players can interact with
	var that = this;
	
	
	
	that.imgName = imgName;
	// that.rarity = "Rarity deprecated";
	// that.description = "Description deprecated";
	
	that.image = new Image();
	that.markForDeletion = false;
	
	// that.index = 0;//the index number that it is in the array
	// that.setIndex = function(index){
		// that.index = index;
	// }

	that.image = showImage(DIR.concat(imgName,".png"));
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = x;
	that.Y = y;//desiredHeight - that.image.height;
	
	that.sound = new Audio(PONY_DIR.concat(name,".mp3"));
			
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	that.getBottom = function(){//returns the bottom y value
		return that.Y + that.image.height;
	}
	that.isOffScreen = function(){//only determines if off left edge
		return that.X + that.image.width < 0;
	}	
	//Function called when it needs removed (left over, I don't think I'll need it for blocks)
	that.remove = function(){
		that.markForDeletion = true;
	}

	//that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(that.X), convertYPos(that.Y), convertWidth(that.image.width), convertHeight(that.image.height));
				// ctx.fillStyle = 'black';
				// ctx.font="20px Arial";
				// ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
			}
			catch (e) {
			};

			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;	
		}
	}
	that.drawScale = function(nW, nH){//"new width", "new height"
		var newWidth = nW,
		newHeight = nH;
		if (newWidth != 0 || newHeight != 0){
			if (newHeight == 0){//scale the image to the new width
				newHeight = newWidth/that.image.width*that.image.height;
			}
			else if (newWidth == 0){//scale the image to the new height
				newWidth = newHeight/that.image.height*that.image.width;
			}			
		}
		else {
			newWidth = that.image.width;
			newHeight = that.image.height;
		}
		if (!that.markForDeletion){
			// try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(centerX(newWidth)), convertYPos(that.Y), convertWidth(newWidth), convertHeight(newHeight));
			// }
			// catch (e) {
			// };		
		}
	}
}


//
// Level
//
function Level(){
	var that = this;
	
	that.backgroundImage = new Image();
	
	that.blocks = [];
	that.initBlocks = function(){
		for(var i = 0; i < desiredWidth; i += 50){
			var block = new Block("ground",i,desiredHeight-50);
			that.blocks[that.blocks.length] = block;
		}
		for(var i = 0; i < 3; i++){
			var ri = Math.floor(Math.random() * ((desiredWidth-50) - 0 + 1)) + 0;
			var block = new Block("ground",ri,desiredHeight-100);
			that.blocks[that.blocks.length] = block;
		}
	}
	that.initBlocks();
	
	that.update = function(){//updates the level and all its objects
		player1.update();
		player2.update();
	}
	
	that.checkCollision = function(obj, ol, ot, or, ob){//checks if the given rect will collide with any game objects
		// ol += 1; ot += 1; or -= 1; ob -= 1;//giving it the benefit of the doubt
		// var ol = x, or = x + w, ot = y, ob = y + h;
		// if (vx < 1){ol+=vx;}
		// else{or+=vx;}
		// if (vy < 1){ot+=vy;}
		// else{ob+=vy;}
		
		for (var i=0; i < that.blocks.length; i++){
			var b = that.blocks[i];
			var bl = b.X, br = b.X + b.image.width, bt = b.Y, bb = b.Y + b.image.height;
			if (ol < br && or > bl && ot < bb && ob > bt){//if they intersect
				return true;
			}
		}
		return false;
	}
	
	that.draw = function(){//draws the level and all its objects
		//blocks
		for (var i=0; i < that.blocks.length; i++){
			that.blocks[i].draw();
		}
		//players, ponies
		player1.draw();
		player2.draw();
		
	}
}
var level = new Level();



{//commented out Chest class 2014-06-14
// function Chest(){//Chest class
	// //copied from Pony() 2013-12-22
	// var that = this;
	
	// that.image = new Image();
	// that.frontImage = new Image();
	// that.markForDeletion = false;
	
	// that.image = showImage(DIR.concat("chest_anim.png"));
	// that.width = 590;
	// that.height = 579;
	// that.frontImage = showImage(DIR.concat("chest_front.png"));
	// that.frames = 1;
	// that.actualFrame = 0;
	// that.X = 0;
	// that.Y = desiredHeight/2;//position of top of front
	// that.velX = 0;//used for moving
	// that.velY = 0;
	// that.animateOpening = false;
	
	// that.numFrame = new TextFrame("#"+(ponyCollection.length+1),"numFrame",0,that.Y+61);
	// that.numFrame.centerable = true;
	// that.numFrame.drawImageLast = true;
	// that.numFrame.textFont = "#827741";
	
	// //that.sparkleEffect moved below because it required other methods
				
	// that.setPosition = function(x, y){
		// that.X = x;
		// that.Y = y;
	// }
	// that.getTop = function(){//get the actual top where the back part of the chest is located
		// return that.Y - (that.height - that.frontImage.height);
	// }
	// that.getStateTop = function(){//get the top of the back part depending on what state it is (open or closed)
		// if (that.actualFrame == 0){
			// return that.getTop() + 99;
		// }
		// else {
			// return that.getTop();
		// }
	// }
	// that.getFrontTop = function(){
		// return that.Y;
	// }
	
	// that.sparkleEffect = new SpecialEffect("sparkle",that.X,that.getStateTop(),that.width,that.frontImage.height+(that.Y-that.getStateTop()));
	
	// that.playAnimation = function(){
		// that.animateOpening = true;
	// }
	// that.atLastFrame = function(){
		// return that.frames == that.actualFrame;
	// }
	// that.move = function(){
		// that.X += that.velX;
		// that.Y += that.velY;
	// }
	// that.slideOff = function(){
		// that.velX = -10;
		// that.velY = 0;
		// that.move();
	// }
	// that.isOffScreen = function(){//only determines if off left edge
		// return that.X + that.image.width < 0;
	// }

	// that.interval = 0;
	// that.draw = function(){//draws the whole thing
		// if (that.velX == 0){
			// that.X = centerX(that.width);
			// that.numFrame.centerable = true;
		// }
		// else{
			// that.numFrame.centerable = false;
		// }
		// try {
			// ctx.drawImage(that.image, 
			// that.width * that.actualFrame, 0, that.width, that.height,
			// convertXPos(that.X), convertYPos(that.getTop()), convertWidth(that.width), convertHeight(that.height));
			// that.numFrame.X = that.X+(that.width-that.numFrame.image.width)/2;
			// that.numFrame.draw();
			// // ctx.fillStyle = 'black';
			// // ctx.font="20px Arial";
			// // ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
			// that.sparkleEffect.defineArea(that.X,that.getStateTop(),that.width,that.frontImage.height+(that.Y-that.getStateTop()));
			// that.sparkleEffect.evaluate();
			// that.sparkleEffect.draw();
		// }
		// catch (e) {
		// };
		// if (that.animateOpening){
			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// // that.actualFrame = 0;
					// that.animateOpening == false;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;
		// }			
	// }
	// that.drawFront = function(){//only draws the front
		// if (that.velX == 0){
			// that.X = centerX(that.width);
			// that.numFrame.centerable = true;
		// }
		// else{
			// that.numFrame.centerable = false;
		// }
		// try {
			// ctx.drawImage(that.frontImage, 
			// convertXPos(that.X), convertYPos(that.Y), convertWidth(that.width), convertHeight(that.frontImage.height));
			// //numFrame
			// that.numFrame.X = that.X+(that.width-that.numFrame.image.width)/2;
			// that.numFrame.draw();
			// //sparkleEffect
			// that.sparkleEffect.defineArea(that.X,that.getStateTop(),that.width,that.frontImage.height+(that.Y-that.getStateTop()));
			// that.sparkleEffect.evaluate();
			// that.sparkleEffect.draw();
			// }
			// catch (e) {
			// };
	// }
// }
}

function TextFrame(text, filename, x, y){//the class that contains the text for the pony's name, rarity, and description (but not all ponies at once)
	var that = this;
	
	that.text = text;
	that.filename = filename;
	
	that.image = new Image();
	that.markForDeletion = false;
	
	that.image = showImage(DIR.concat(filename,".png"));
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = x;
	that.Y = y;
	that.velX = 0;//used for moving
	that.velY = 0;
	that.centerable = true;//whether or not to allow automatic centering: true = allow, false = don't allow
	that.centerText = true;//whether or not it should align its text center
	that.textSize = 50;
	that.textFont = "black";
	that.typeFace = "Times New Roman";
	that.X2 = that.X + 20 + ctx.measureText(that.text).width;//X2 is used to get the end of the line (if it is a one-liner)
	that.rotate = 0;
	that.drawImageLast = false;
			
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	//returns the pony's index number + 1
	that.getNumber = function(){
		return that.index + 1;
	}
	// this method checks to see if this pony has been clicked on
	that.checkClick = function(x, y){
		if (!that.markForDeletion){//if pony is still alive
			if (x > that.X){//mouse-pony collision detection
				if (x < that.X + that.width){
					if (y > that.Y){
						if (y < that.Y + that.height){
								return that.onClick();//it has been clicked on, and activated
						}
					}
				}
			}
		}
		return false;//pony is not clicked on
	}
	//Carry out onClick operations, depending on game state
	that.onClick = function(){
	//returns true as default unless otherwise specified
		switch (gameMode){
			case "play": 
				that.hit(); 
				break;
			case "chooseSave": that.capture(); break;
		}
		return true;
	}

	//that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			if (that.centerable){
				that.X = centerX(that.image.width);
			}
			try {			
				ctx.save();
				if (that.rotate != 0){
					ctx.translate(convertXPos(that.X+that.image.width/2), convertYPos(that.Y+that.image.height/2));
					ctx.rotate(that.rotate*Math.PI/180);
					ctx.translate(-convertXPos(that.X+that.image.width/2), -convertYPos(that.Y+that.image.height/2));
				}
				if (!that.drawImageLast){
					ctx.drawImage(that.image, 
					//0, that.height * that.actualFrame, that.width, that.height, 
					convertXPos(that.X), convertYPos(that.Y), convertWidth(that.image.width), convertHeight(that.image.height));
				}
				ctx.fillStyle = that.textFont;
				ctx.font= convertHeight(that.textSize)+"px "+that.typeFace;
				that.usedY = that.Y + 20;		
				var widthThing = (ctx.measureText(that.text).width)/canvasRatio;
				that.X2 = that.X + centerX(widthThing) + widthThing;
				if (that.centerText){
					that.usedY = (that.image.height - that.textSize)/2 + that.Y;//- that.textSize/2;
				}
				wrapText(ctx, that.text, that.X + 20, that.usedY, that.image.width-40, that.textSize *1.25, that.centerText);		
				if (that.drawImageLast){	
					var buffer = 30;
					ctx.drawImage(that.image, 
					//0, that.height * that.actualFrame, that.width, that.height, 
					convertXPos(wrapTextData.getX()-buffer), convertYPos(wrapTextData.getY()-buffer), convertWidth(wrapTextData.getWidth()+buffer*2), convertHeight(wrapTextData.getHeight()+buffer*2));
					wrapText(ctx, that.text, that.X + 20, that.usedY, that.image.width-40, that.textSize *1.25, that.centerText);
				}
				ctx.restore();
			}
			catch (e) {
			window.alert(e);
			};

			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;	
		}
	}
	that.drawScale = function(nW, nH){//"new width", "new height"
		var newWidth = nW,
		newHeight = nH;
		if (newWidth != 0 || newHeight != 0){
			if (newHeight == 0){//scale the image to the new width
				newHeight = newWidth/that.image.width*that.image.height;
			}
			else if (newWidth == 0){//scale the image to the new height
				newWidth = newHeight/that.image.height*that.image.width;
			}			
		}
		else {
			newWidth = that.image.width;
			newHeight = that.image.height;
		}
		if (!that.markForDeletion){
			// try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(centerX(newWidth)), convertYPos(that.Y), convertWidth(newWidth), convertHeight(newHeight));
			// }
			// catch (e) {
			// };		
		}
	}
}

var wrapTextDataClass = function(){//variable used for storing info from wrapText method
	var that = this;
	
	that.left;
	that.right;
	that.top;
	that.bottom;
	
	that.valued = false;
	
	that.clear = function(){
		that.valued = false;
	}
	
	that.update = function(x,y,x2,y2){//pass in the left,top,right,bottom, NOT width, height
		if (!that.valued || x < that.left){
			that.left = x;
		}
		if (!that.valued || x2 > that.right){
			that.right = x2;
		}
		if (!that.valued || y < that.top){
			that.top = y;
		}
		if (!that.valued || y2 > that.bottom){
			that.bottom = y2;
		}
		that.valued = true;
	}
	
	that.getX = function(){
		return that.left;
	}
	that.getY = function(){
		return that.top;
	}
	that.getWidth = function(){
		return that.right - that.left;
	}
	that.getHeight = function(){
		return that.bottom - that.top;
	}
};
var wrapTextData = new wrapTextDataClass();
function wrapText(context, text, x, y, maxWidth, lineHeight, centerText) {
		//copied from Colin Wiseman (http://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks) on 1-6-2013
		//modified 1-6-2013
		
		wrapTextData.clear();
		
        var cars = text.split("\n");

        for (var ii = 0; ii < cars.length; ii++) {

            var line = "";
            var words = cars[ii].split(" ");

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > convertWidth(maxWidth)) {
					line = line.trim();
					if (!centerText){context.fillText(line.trim(), convertXPos(x), convertYPos(y));}
                    else{
						usedWidth = ctx.measureText(line).width;
						var usedX = x+ ((maxWidth - (usedWidth/canvasRatio)) / 2);
						context.fillText(line.trim(), convertXPos(usedX), convertYPos(y));
						wrapTextData.update(usedX, y+lineHeight, usedX + (usedWidth/canvasRatio), y + lineHeight*2);
					}
                    line = words[n] + " ";
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }
			line = line.trim();
			if (!centerText){context.fillText(line.trim(), convertXPos(x), convertYPos(y));}
			else{
				usedWidth = ctx.measureText(line).width;
				var usedX = x+ ((maxWidth - (usedWidth/canvasRatio)) / 2);
				context.fillText(line.trim(), convertXPos(usedX), convertYPos(y));
				wrapTextData.update(usedX, y, usedX + (usedWidth/canvasRatio), y + lineHeight);
			}
            y += lineHeight;
        }
     }

function SpecialEffect(filename,x,y,width,height){//copied 1-12-2014 from Particle
	var that = this;
	
	that.particleArray = new Array();
	
	that.markForDeletion = false;	
	that.makeNewParticles = 1;
	
	that.filename = filename;
	that.width = width;
	that.height = height; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = x;
	that.Y = y;
	that.velX = 0;//used for moving
	that.velY = 0;
	
	that.defineArea = function(x,y,width,height){
		that.X = x;
		that.Y = y;
		that.width = width;
		that.height = height; 
	}
	
	that.interval = 0;
	that.evaluate = function(){
		for (var i=0; i < that.particleArray.length-1;i++){
			var p = that.particleArray[i];
			p.evaluate();
			if (p.markForDeletion){
				that.particleArray.splice(i,1);
			}
		}
		if (that.interval == 0){
			for (var i = 0; i < that.makeNewParticles; i++){
				var rx = Math.floor(Math.random() * ((that.X+that.width) - that.X + 1)) + that.X;
				var ry = Math.floor(Math.random() * ((that.Y+that.height) - that.Y + 1)) + that.Y;
				that.particleArray.push(new Particle(that.filename,rx,ry));
			}
			that.interval = 4;
		}
		else {that.interval -= 1;}
	}
				
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	
	that.end = function(){
		that.makeNewParticles = 0;
	}
	
	that.getBottom = function(){//returns the bottom y value
		return that.Y + that.image.height;
	}
	that.setVelocity = function(dx,dy){
		that.velX = dx;
		that.velY = dy;
	}
	// this makes the pony move based on its direction
	that.move = function(){
		that.X += that.velX;
		that.Y += that.velY;
	}	
	
	//Function called when it disappears
	that.remove = function(){
		that.markForDeletion = true;
	}

	that.draw = function(){
		if (!that.markForDeletion){
			for (var i=0; i < that.particleArray.length-1;i++){
				that.particleArray[i].draw();
			}
		}
	}
}

function Particle(filename, x, y){//1-12-2013 copied from Pony class
	var that = this;
	
	that.image = new Image();
	that.markForDeletion = false;	

	that.image = showImage(DIR.concat(filename,".png"));
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = x;
	that.Y = y;
	// that.velX = 0;//used for moving
	// that.velY = 0;
	that.scale = 0.0;
	that.maxScale = 1;
	that.velZ = 0.035;//amount that it grows or shrinks
	
	that.evaluate = function(){
		that.scale += that.velZ;
		if (that.scale >= that.maxScale){
			that.velZ = -0.035;
		}
		else if (that.scale <= 0 && that.velZ < 0){
			that.remove();
		}
	}
	
	that.shift = function(x,y){
		that.X += x;
		that.Y += y;
	}
				
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	
	
	that.getBottom = function(){//returns the bottom y value
		return that.Y + that.image.height;
	}
	// this makes the pony move based on its direction
	// that.move = function(){
		// that.X += that.velX;
		// that.Y += that.velY;
	// }	
	
	//Function called when it disappears
	that.remove = function(){
		that.markForDeletion = true;
	}

	//that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			try {
				var width = that.image.width * that.scale;
				var height = that.image.height * that.scale;
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(that.X - width/2), convertYPos(that.Y - height/2), convertWidth(width), convertHeight(height));
				// convertXPos(that.X), convertYPos(that.Y), convertWidth(that.image.width), convertHeight(that.image.height));
				// ctx.fillStyle = 'black';
				// ctx.font="20px Arial";
				// ctx.fillText("P", convertXPos(that.X), convertYPos(that.Y));
			}
			catch (e) {
			};

			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;	
		}
	}
}
	 
document.onkeydown = function(e){
	e.stopPropagation();
	if ((e.keyCode==8)){
		return false;
	}
}
var keyMap = [];//the array that holds the current keys being pressed
var keyPressed = false;
document.addEventListener('keydown', function(event) {
	if (event.keyCode == 13){//enter key was pressed
		keyValue = 13;
		keyPressed = true;
	}
	else if (event.keyCode == 8){//backspace
		keyValue = 8;
		keyPressed = true;
	}
	//keyMap array idea taken from http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once on 2014-06-14
	keyMap[event.keyCode] = (event.type == 'keydown');
});

document.addEventListener('keyup', function(event) {
    keyPressed = false;
	keyMap[event.keyCode] = (event.type == 'keydown');
});

var keyValue = "0";
document.addEventListener('keypress', function(event) {    
	if (event.which!=0 && event.charCode!=0&&keyPressed==false){
		keyValue = String.fromCharCode(event.charCode);
		keyPressed = true;
	}
});

c.addEventListener('mousemove', function(e){
		mouseX = e.pageX;
		mouseY = e.pageY;
});

//making the payer shoot
var playerFiring = false;//this says whether or not the player is firing
var playerFired = false;//if the player has taken a shot already, is meant to keep one click from taking out multiple pinkies
document.addEventListener('mousedown', function(e){
		playerFiring = true;
});

document.addEventListener('mouseup', function(e){
		playerFiring = false;
		playerFired = false;
});
c.addEventListener('touchmove', function(e){		
		e.preventDefault();
		mouseX = e.changedTouches[0].pageX;
		mouseY = e.changedTouches[0].pageY;
		playerFiring = true;
}, false);
c.addEventListener('touchstart', function(e){
		e.preventDefault();
		playerFiring = true;
		mouseX = e.changedTouches[0].pageX;
		mouseY = e.changedTouches[0].pageY;
		if (gameMode == "play"){
			hitsAttempted += 1;
		}	
}, false);

c.addEventListener('touchend', function(e){
		e.preventDefault();
		playerFiring = false;
		playerFired = false;
}, false);

//sets all the necessary variables to their initial values
function setUp(){
	//Ponies
	for (var i = 0; i < maxPonies; i++){
		var pony = ponyArray[i];
		pony.markForDeletion = false;
		pony.index = i;
	}
	numberText = 0;
	//Player
	playerFiring = false;
	playerFired = false;
}

var GameLoop = function(){
	clear();
	switch(gameMode){
		case "title_screen": title_screen(); break;
		case "settings": settings(); break;
		case "credits": credits(); break;
		case "setup_playerselect": setup_playerselect(); break;
		case "setup_levelselect": setup_levelselect(); break;
		case "setup_setup": setup_setup(); break;
		case "play_countdown": play_countdown(); break;
		case "play_play": play_play(); break;
		case "play_pause": play_pause(); break;
		case "play_win": play_win(); break;
		case "play_results": play_results(); break;
	}
	modeTime += 1;
	gLoop = setTimeout(GameLoop, 1000 / 500);
	// ctx.fillText("("+mouseX+", "+mouseY+") "+playerFiring,areaWidth-100+tcx,20);
	// ctx.fillText(gameMode,areaWidth-100+tcx,40);
	// ctx.fillText((cpi+1)+" / "+ponyCollection.length,areaWidth-100+tcx,60);
	drawForeGround();
}

//
//title_screen
//
	var logo = new Image();
	logo.src = DIR.concat("titlescreen.png");
	logo.onload = function(){scaleImage(logo, desiredWidth, desiredHeight);};
function title_screen(){//title screen	
	ctx.drawImage(logo, tcx, 0, convertWidth(logo.width), convertHeight(logo.height));//convertXPos(centerX(logo.width)), convertYPos(desiredHeight - logo.height)
	var btnPlay = new Button ("button_play",centerX(100),800,"setup_playerselect");
	if (!playerFired && btnPlay.checkClick(mouseX, mouseY, playerFiring)){
		setUp();
	}	
	btnPlay.draw();
	var btnSettings = new Button ("button_settings",1300,850,"settings");
	if (!playerFired && btnSettings.checkClick(mouseX, mouseY, playerFiring)){
		setUp();
	}	
	btnSettings.draw();
	
	ctx.fillStyle = 'white';
	ctx.fillText("#CrystalGamesChallenge June 2014", 5 + tcx, areaHeight - 20);
	ctx.fillStyle = 'black';
}
//
//settings
//
function settings(){
	ctx.drawImage(logo, tcx, 0, convertWidth(logo.width), convertHeight(logo.height));//convertXPos(centerX(logo.width)), convertYPos(desiredHeight - logo.height)
	
	if (keyMap[27]){//ESC
		switchGameMode("previous");
		keyMap[27] = false;
	}
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("SETTINGS", 20 + tcx, 20);
	ctx.fillStyle = 'black';
}
//
//credits
//
var logoImg = new Image();
logoImg.src = DIR.concat("tmapge.png");
var creditsText = "Hello!";
{
creditsText = "CREATED BY shieldgenerator7\n\n"+
	
	"WRITTEN BY\nPheonix Dino\nshieldgenerator7\n\n"+
	
	"VECTORED BY\n"+
	"pikn2\n"+
	"xPesifeindx\n"+
	"Nethear\n"+
	"muzzen\n"+
	"Takua770\n"+
	"Tim015\n"+
	"CherryGrove\n"+
	"PinkiePie30\n"+
	"qazwsx302\n"+
	"uxyd\n"+
	"monsterhighghoul101\n"+
	"90Sigma\n"+
	"alexiy777\n"+
	"aeroyTechyon-X\n"+
	"Mozlin\n"+
	"tootootaloo\n"+
	"Spaceponies\n"+
	"TheEvilFlashAnimator\n"+
	"SierraEx\n"+
	"MoongazePonies\n"+
	"Moonbrony\n"+
	"BronyB34r\n"+
	"Ispincharles\n"+
	"Pheonix Dino\n"+
	"Wishdream\n"+
	
	"\nVOICED BY\n"+
	"Natalie Van Sistine & Alina Alberto (via DILeak Studios)\n"+
	"Nowacking (via Alligator Tub Productions)\n"+
	"Keikoandgilly\n"+
	"Pierce Smoulder\n"+
	"TheRobotButterfly\n"+
	"MEMJ0123 (via TehJadeh)\n"+
	"Rina-Chan (via AnimatedJames)\n"+
	
	"\nTYPEFACED BY\n"+
	"Kiwi Media\n"+
	"Eliot Truelove\n"+
	
	"\nSPECIAL THANKS\n\n"+
	
	"FOR SOUND CLIPS\n"+
	"kyrospawn\n"+
	"SunnySandStorm\n"+
	"EpicGteGuy\n"+
	"Michoss9\n"+
	"Frozen Pony\n"+
	"SelfAwarePedant\n"+
	
	"\nFOR CODE SNIPPETS\n"+
	"Binod Suman\n"+
	"Colin Wiseman\n"+
	"elico3000\n"+
	
	"\nFOR PLAYTESTING\n"+
	"Pheonix Dino\n"+
	"Vanni\n"+
	"Xinef\n"+
	"Wishdream\n"+
	
	"\nFOR FLASH PUPPETS\n"+
	"Zachary Rich and the Double Rainboom team\n"+
	
	"\nFOR MLP:FiM\n"+
	"Lauren Faust\n"+
	"Hasbro\n"+
	"DHX\n"+
	"Studio B\n"+
	
	"\nFOR BEING AWESOME\n"+
	"Jesus\n"+
	
	"\nFOR PLAYING THE GAME AND MAKING THIS WHOLE THING WORTHWHILE\n"+
	"You! Thanks for playing!\n"+
	
	"\nDECEMBER 2013 - JANUARY 2014 shieldgenerator7\nMade for the MLGD Mareathon Part 2\n"+
	"\n\n\n#NoSkinnerBoxes";
}
var credFrame = new TextFrame(creditsText,"credFrame",0,desiredHeight-200);
function setUpCredits(){
	credFrame = new TextFrame(creditsText,"button_clear",0,desiredHeight-200);
}
function credits(){//FUTURE CODE: need to make this text instead of image and have it scroll
	credFrame.Y -= 1;
	ctx.drawImage(logoImg, convertXPos(centerX(logoImg.width)), convertYPos(credFrame.Y-logoImg.height+40), convertWidth(logoImg.width),convertHeight(logoImg.height));
	var mainMenu = new Button("button_title", 5, 5, "title_screen");
	if (mainMenu.checkClick(mouseX, mouseY, playerFiring)){
		playerFired = true;
	}
	mainMenu.draw();
	credFrame.draw();
	if (wrapTextData.bottom < 0){//if credits go all the way to the top
		switchGameMode("title_screen");
	}
}
//
//setup_playerselect
//
function setup_playerselect(){
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("setup_playerselect", 20 + tcx, 20);
	ctx.fillStyle = 'black';
	player1.setPony(new Pony(ponyArray[0].name, ponyArray[0].initFunction));
	player2.setPony(new Pony(ponyArray[1].name, ponyArray[1].initFunction));
	switchGameMode("setup_levelselect");
}

//
//setup_levelselect
//
function setup_levelselect(){
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("setup_levelselect", 20 + tcx, 20);
	ctx.fillStyle = 'black';
	switchGameMode("setup_setup");
}

//
//setup_setup
//
function setup_setup(){
	level = new Level();

	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("setup_setup", 20 + tcx, 20);
	ctx.fillStyle = 'black';
	switchGameMode("play_countdown");
}

//
//play_countdown
//
function play_countdown(){
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("play_countdown", 20 + tcx, 20);
	ctx.fillStyle = 'black';
	switchGameMode("play_play");
}

//
//play_play
//

function play_play(){
	player1.acceptKeys();
	player2.acceptKeys();
	level.update();
	level.draw();
	
	if (keyMap[27]){//ESC
		switchGameMode("play_pause");
		keyMap[27] = false;
	}
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("play_play", 20 + tcx, 20);
	ctx.fillStyle = 'black';
}

//
//play_pause
//
function play_pause(){
	var btnResume = new Button ("button_resume",centerX(100),200,"play_play");
	if (!playerFired && btnResume.checkClick(mouseX, mouseY, playerFiring)){
		// setUp();
	}	
	btnResume.draw();
	
	var btnMenu = new Button ("button_title",1300,850,"title_screen");
	if (!playerFired && btnMenu.checkClick(mouseX, mouseY, playerFiring)){
		// setUp();
	}	
	btnMenu.draw();
	
	var btnSettings = new Button ("button_settings",1300,850,"settings");
	if (!playerFired && btnSettings.checkClick(mouseX, mouseY, playerFiring)){
		// setUp();
	}	
	btnSettings.draw();
	
	if (keyMap[27]){//ESC
		switchGameMode("play_play");
		keyMap[27] = false;
	}
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("play_pause", 20 + tcx, 20);
	ctx.fillStyle = 'black';
}

//
//play_win
//
function play_win(){
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("play_win", 20 + tcx, 20);
	ctx.fillStyle = 'black';
	switchGameMode("play_results");
}

//
//play_results
//
function play_results(){
	ctx.fillStyle = 'white';
	ctx.font = "50px Times New Roman";
	ctx.fillText("play_results", 20 + tcx, 20);
	ctx.fillStyle = 'black';
	switchGameMode("play_play");
}


//
//cheat code stuff
//
var forcedPony = 0;
forceNextPony = function(pony){
	forcedPony = pony;
}

var TextBuilder = function(){//copied from highScoreTable() from main.js from ShiftItOneAndUp(Railguns and Dragons)
	var that = this;
	that.buildName = "";
	that.cursorBlink = -5;//cB < 0 = no cursor shown; cB > 0 = cursor shown//this prob doesnt go here :?
	
	that.acceptKeys = function(charN){//returns true when input line is finished
		if (charN == 13 || that.buildName.length >= 20){//enter keyCode passed through
			return true;
		}
		else if (charN == 8 && that.buildName.length > 0){//backspace
			that.buildName = that.buildName.substr(0,that.buildName.length-1);
		}
		else {
			that.buildName += charN;
		}
	}
};
var textBuilder = new TextBuilder();

var textFrame = new TextFrame("","textFrame",50,desiredHeight - 200);
var textBoxOpened = false;
function openTextBox(){
	textFrame = new TextFrame("","textFrame",50,desiredHeight - 200);
	textBuilder = new TextBuilder();
	textBoxOpened = true;
}
var charUsed = false;
function evaluateTextBox(){
	if (!charUsed){
		if (keyPressed){
			if (textBuilder.acceptKeys(keyValue)){
				if (textBuilder.buildName == "#PinkieSecretService"){
					forceNextPony(new Pony("Pinkie Spy","Invisibly Rare","Shhh! I'm on a mission! How can you see me anyways? I'm wearing night vision goggles! You mean you can see? You mean I'm not invisible? Hey...! They told me this would make me invisible! I want my bits back!"));
				}
				textBoxOpened = false;
			}
			textFrame.text = textBuilder.buildName;
			charUsed = true;
		}
	}
	else if (!keyPressed){
		charUsed = false;
	}
	textFrame.draw();
}
GameLoop();