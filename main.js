 //main.js
 //cleaned 1-23-2014

var width = 800,
height = 500,
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
var desiredHeight = 1000, desiredWidth = 800;//the desired dimensions, which will be scaled down
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

var scaleImage = function(image, newWidth, newHeight){
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
	ctx.drawImage(backGroundImg,tcx,0,areaWidth, areaHeight);

	// ctx.fillStyle = 'black';
	// ctx.font="20px Arial";
	// ctx.fillText("Score: " + score,0,480);
}

var drawForeGround = function(){
	var prevFillStyle = ctx.fillStyle;
	ctx.fillStyle = '#BAF1FA';
	ctx.beginPath();
	ctx.fillRect(0, 0, tcx, c.height);	
	ctx.closePath();
	ctx.beginPath();
	ctx.fillRect(tcx + areaWidth, 0, tcx, c.height);
	ctx.closePath();
	ctx.fillStyle = prevFillStyle;
}

var switchGameMode = function(mode){
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
// Pony
//
function Pony(name,rarity,description){//Name of pony, also used for getting image
	var that = this;
	
	that.name = name;
	that.rarity = rarity;
	that.description = description;
	
	that.image = new Image();
	that.markForDeletion = false;
	
	that.index = 0;//the index number that it is in the array
	that.setIndex = function(index){
		that.index = index;
	}

	that.image = showImage(PONY_DIR.concat(name,".png"));
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = 0;
	that.Y = desiredHeight - that.image.height;
	that.velX = 0;//used for moving
	that.velY = 0;
	
	that.sound = new Audio(PONY_DIR.concat(name,".mp3"));
			
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
	that.getBottom = function(){//returns the bottom y value
		return that.Y + that.image.height;
	}
	// this makes the pony move based on its direction
	that.move = function(){
		that.X += that.velX;
		that.Y += that.velY;
	}
	that.slideOff = function(){
		that.velX = -10;
		that.velY = 0;
		that.move();
	}
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
			if (that.velX == 0){
				that.X = centerX(that.image.width);
			}
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


//SAVE: Adding to array
//ponyArray: the pony template array
var ponyArray = [
	//Mane 6
	new Pony("Twilight Sparkle","RARE","Ah, Twilight Sparkle... What can I say about you? Except that you are a magnificent purple unicorn with a magical cutiemark. I should probably let you get back to your homework before you start freaking out about deadlines."),
	new Pony("Pinkie Pie","RARE","Pinkie Pie is a hyperactive earth pony who throws parties everyday to satisfy her goal of becoming Equestria's #1 party thrower. And she's well on her way with her balloon cutiemark as proof. YEAH! PARTY! PARTY! PARTY!"),
	new Pony("Applejack","RARE","Well howdy there!  I'm Applejack, but ya'll can call me AJ if you like!  I'm the most hardworking pony around these parts and produce the best apple cider in all of Equestria!  I got some delicious apple fritters, apple pies, apple tarts, zap apple jam, etc. to get a makin'.  I'll see ya'll later!"),
	new Pony("Rainbow Dash","RARE","Rainbow Dash is the best most awesomest pony ever. As one filly said, she's \"super-ultra-extreme-awesomazing.\" She can fly really fast and is the only pony to ever pull off a Sonic Rainboom. She is loyal to her friends and is going to become the captain of the Wonderbolts some day. So awesome /)^3^(\\	"),
	new Pony("Rarity","DEFINITION OF RARE","I may be the most lady-like and delicate out of my pony friends, but that most certainly doesn't mean that I cannot defend myself.  I was easily able to outwit the diamond dogs and get all those jewels that they slaved me to dig out.  I simply must go! This treasure chest has left my beautiful hair in rugged condition!  Ohhh my hair!"),
	new Pony("Fluttershy","RARE","Um hi there I'm... Fluttershy.  If you haven't noticed by now I'm the shyest of my pony friends.  I may be the shyest and most sensitive, but that doesn't mean that I'm useless, or... I don't think I am... *eee*.  I help little critters from far and wide and keep them super healthy and happy...  *yay*"),
	//CMC
	new Pony("Apple Bloom","RARE","Howdy there!  My name is Apple Bloom and I'm a cute little filly with a pink bow in my hair. I think I look adorable in it!  I have a big sis, a big bro, a granny, and much more family spread all throughout Equestria! I don't have my cutie mark yet, but I'm sure will soon. There's no way my special ingredient pie scheme won't do the trick!"),
	new Pony("Sweetie Belle","RARE","Sweetie Belle is a sweet little filly who often corrects her friend's vocabulary and apparently has the largest vocabulary out of the three CMC's.  This is why she is therefore proclaimed as being a dictionary.  Her and her friends also dream of getting their awesome cutie marks; and hey, maybe they'll get them in being a pony vector!"),
	new Pony("Scootaloo","RARE","Wee!  Although she cannot fly (because she is a chicken hehe), she makes use of her wings and is very speedy on her one-of-a-kind scooter!  She especially loves to impress her all time hero Rainbow Dash with her sweet moves!"),
	new Pony("Babs Seed","RARE","A small little filly from Manehatten that is soon to start her own branch of the CMCs in Manehatten. She also almost fell out of a golden apple and into a mud puddle."),
	//Royalty
	new Pony("Princess Celestia","ROYALLY RARE","Ahh the life of being a princess!  I get to lounge around in my castle balcony all day while Twilight and her friends do all of my dirty work.  It gets boring sometimes so I occupy my time by looking out onto other ponies' lives and seeing what they're up to. Oh goodie!  I just saw a mare throw up on her fiance!"),
	new Pony("Princess Luna","ROYALLY RARE","Why hello there fellow people.  I am the princess of the night and I once displayed horrifying darkness upon the land of Equestria where my sister and I now rule over.  It is now my duty to go into dreams of little ones and counsel them on how to defeat their deepest of fears."),
	new Pony("Princess Cadance","ROYALLY RARE","This is her majesty Princess Cadance of the Crystal Empire.  She once had to defeat an \"evil twin\" who was later found out to be Queen of the Changlings."),
	new Pony("Shining Armor","ROYALLY RARE","Twilight's faithful brother who marries Princess Cadance and then becomes not only Captain of the Royal Guard, but also the Prince of the Crystal Kingdom."),
	//Villians
	new Pony("Discord","CHAOTICALLY UNCOMMON","Mwahaha!  Chaos is such a wonderful place to live in!  Too bad Celestia and her friends had to ruin it for me.  I am the master of all things chaos and if you're not careful, I just might make your life chaotic as well by making you addicted to this pony game mwahaha!"),
	//Background
	new Pony("Vinyl Scratch","RADICALLY RARE","WUB! WUB! WUB! WUB!  I love my music wubs!  Dubstep is the stuff!  Who am I?  I'm the master of mixing up music yeah baby!"),
	new Pony("Octavia Melody","RARE","Oh hello there my fellow game players.  As you all know I am Octavia and I am the most appealing Cello player.  I apologize for making my introduction short, however I must get downstairs immediately otherwise Vinyl Scratch just may bust out the windows with her Wub Dishwasher!  Goodbye!"),
	new Pony("Dr. Hooves","INTERTEMPORALLY RARE","Oh now this is rather odd don't you think Miss Hooves?  We are apparently on some sort of monitor screen and there is a human watching us come out of a weird treasure chest... I was almost certain that we walked directly into the Tardis just now, but we must have somehow gotten into this chest.  Hmm..."),
	new Pony("Ditzy Doo","DERPILY COMMON","Hi there!  Helloooo... do you have any muffins??  I'm really getting the muffin craves right now and I could use some you got some?  Oooo pretty treasure chest!  I wonder if there are any muffins in here! Nope no muffins :c  that's very disappointing."),
	new Pony("Lyra Heartstrings","COMMON","OMG I'm being watched by a human!  A real human!  I knew that they were real!  And oh my gosh are those hands you're using to play this game! I've always loved hands!"),
	new Pony("Bon Bon","CANDIDLY COMMON","Hi there!  If you haven't watched the show yet, I have to warn you that I apparently have many twin sisters or something because whenever there's a crowd, I tend to see them all over the place!"),
	new Pony("Colgate Minuette","MINTY FRESHLY RARE","Brushie! Brushie! Brushie!  I'm just brushing my teeth which are so white and shiny!  That's because I take really good care of them!  I do wish that my cutie mark was a toothbrush or a tooth instead of a time glass, but cutie marks are just marks.  That doesn't mean that they have to define my personality!"),
	new Pony("Golden Harvest","CARROTLY COMMON","Well, that might not be scientifically accurate, but personally I think it's true. I used to wear glasses, and now, since I've been eating carrots, my sight is almost 20/20!\nOw! I should really watch where I'm going. Eat more vegetables!"),
	//OCs
	new Pony("Shield Generator VII","INTERDIMENSIONALY RARE","Hello, I am Shield Generator VII, and I created this game. As a unicorn, I specialize my magic in portals and shields. You think I'd be able to finish this game in a day or two, but I'm kind of slow at programming :P"),
	new Pony("Pheonix Dino","JURASSICALLY RARE","Hi my name is Pheonix Dino (and yes I do know that Phoenix is spelled wrong).  The reason I'm in here is because I am the OC of the description writer!  I get to where I need to go really fast because my wings turn to a bursting flame (sort of like a built-in rocket booster) when I am flying at top speed!"),
	new Pony("Skinner Box","CREEPILY COMMON","So I heard you like to play games? Well, I have a game for you. Here, press this button. Press it again. It's a game. It's not fun, but it's addicting. Why would you want a game to be fun... when you can want a game to be addicting? WoW. This game IS addicting. Heh Heh."),
	new Pony("Phi","DIGITALLY RARE","This is Phi, the energetic My Little Game Dev mascot. She likes action games and is always looking for a new challenge."),
	new Pony("Techna","DIGITALLY RARE","This is Techna, the calm My Little Game Dev mascot. She likes RPGs and puzzles game and enjoys figuring things out.")
];
maxPonies = ponyArray.length;
for (var i = 0; i < maxPonies; i++){
	var pony = ponyArray[i];//new Pony("pinkies");//this makes new pinkies and handles adding it to the array
	pony.setIndex(i);
}
var ponyCollection = [];//the array that stores which ponies the player has obtained

var pickRandomPony = function(){
	if (forcedPony){
		var pony = forcedPony;
		forcedPony = 0;
		return pony;
	}
	var ri = Math.floor(Math.random() * ((maxPonies) - 0 + 1)) + 0;//"random index"
	if (ri == maxPonies){ri = Math.floor(Math.random() * ((maxPonies) - 0 + 1)) + 0; }//window.alert("ri = maxPonies!");}
	if (ponyArray[ri]){
		return new Pony(ponyArray[ri].name, ponyArray[ri].rarity, ponyArray[ri].description);
	}
	else{
		return new Pony("Unknown","Not possible","You're not supposed to be able to get this pony!\n\n#UnknownPony");
	}
}

// var layoutPinkies = function(){
	// var maxColumns = 5;//the max amount of columns
	// var cx = 0,
	// cy = 0;//the counter variables for rows and columns
	// var padding = 10;//pading between rows and columns
	// var rowHeight = pinkieArray[0].height + padding,
	// columnWidth = pinkieArray[0].width + padding;//the dimensions of each individual row/column
	// var offsetX = (width - (maxColumns * columnWidth - padding)) / 2;
	// var offsetY = padding;
	// for (var i = 0; i < howManyPinkies; i++){
		// if (pinkieArray[i] != savedPinkie){// || howManyPinkiesAlive == 2)//don't want to reposition the saved pinkie
			// pinkieArray[i].setPosition(cx * columnWidth + offsetX, cy * rowHeight + offsetY);
		// }
		// else {//if (pinkieArray[i].X != 10){
			// pinkieArray[i].X = 10;
			// pinkieArray[i].Y = height - pinkieArray[i].height - 10;
			//ctx.fillText((height), 0, 60);
		// }
		// cx++;
		// if (cx == maxColumns){
			// cx = 0;
			// cy++;
		// }
	// }
// }

function Chest(){//Chest class
	//copied from Pony() 2013-12-22
	var that = this;
	
	that.image = new Image();
	that.frontImage = new Image();
	that.markForDeletion = false;
	
	that.image = showImage(DIR.concat("chest_anim.png"));
	that.width = 590;
	that.height = 579;
	that.frontImage = showImage(DIR.concat("chest_front.png"));
	that.frames = 1;
	that.actualFrame = 0;
	that.X = 0;
	that.Y = desiredHeight/2;//position of top of front
	that.velX = 0;//used for moving
	that.velY = 0;
	that.animateOpening = false;
	
	that.numFrame = new TextFrame("#"+(ponyCollection.length+1),"numFrame",0,that.Y+61);
	that.numFrame.centerable = true;
	that.numFrame.drawImageLast = true;
	that.numFrame.textFont = "#827741";
	
	//that.sparkleEffect moved below because it required other methods
				
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	that.getTop = function(){//get the actual top where the back part of the chest is located
		return that.Y - (that.height - that.frontImage.height);
	}
	that.getStateTop = function(){//get the top of the back part depending on what state it is (open or closed)
		if (that.actualFrame == 0){
			return that.getTop() + 99;
		}
		else {
			return that.getTop();
		}
	}
	that.getFrontTop = function(){
		return that.Y;
	}
	
	that.sparkleEffect = new SpecialEffect("sparkle",that.X,that.getStateTop(),that.width,that.frontImage.height+(that.Y-that.getStateTop()));
	
	that.playAnimation = function(){
		that.animateOpening = true;
	}
	that.atLastFrame = function(){
		return that.frames == that.actualFrame;
	}
	that.move = function(){
		that.X += that.velX;
		that.Y += that.velY;
	}
	that.slideOff = function(){
		that.velX = -10;
		that.velY = 0;
		that.move();
	}
	that.isOffScreen = function(){//only determines if off left edge
		return that.X + that.image.width < 0;
	}

	that.interval = 0;
	that.draw = function(){//draws the whole thing
		if (that.velX == 0){
			that.X = centerX(that.width);
			that.numFrame.centerable = true;
		}
		else{
			that.numFrame.centerable = false;
		}
		try {
			ctx.drawImage(that.image, 
			that.width * that.actualFrame, 0, that.width, that.height,
			convertXPos(that.X), convertYPos(that.getTop()), convertWidth(that.width), convertHeight(that.height));
			that.numFrame.X = that.X+(that.width-that.numFrame.image.width)/2;
			that.numFrame.draw();
			// ctx.fillStyle = 'black';
			// ctx.font="20px Arial";
			// ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
			that.sparkleEffect.defineArea(that.X,that.getStateTop(),that.width,that.frontImage.height+(that.Y-that.getStateTop()));
			that.sparkleEffect.evaluate();
			that.sparkleEffect.draw();
		}
		catch (e) {
		};
		if (that.animateOpening){
			if (that.interval == 4 ) {
				if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
					that.animateOpening == false;
				}
				else {
					that.actualFrame++;
				}
				that.interval = 0;
			}
			that.interval++;
		}			
	}
	that.drawFront = function(){//only draws the front
		if (that.velX == 0){
			that.X = centerX(that.width);
			that.numFrame.centerable = true;
		}
		else{
			that.numFrame.centerable = false;
		}
		try {
			ctx.drawImage(that.frontImage, 
			convertXPos(that.X), convertYPos(that.Y), convertWidth(that.width), convertHeight(that.frontImage.height));
			//numFrame
			that.numFrame.X = that.X+(that.width-that.numFrame.image.width)/2;
			that.numFrame.draw();
			//sparkleEffect
			that.sparkleEffect.defineArea(that.X,that.getStateTop(),that.width,that.frontImage.height+(that.Y-that.getStateTop()));
			that.sparkleEffect.evaluate();
			that.sparkleEffect.draw();
			}
			catch (e) {
			};
	}
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

var keyPressed = false;
document.addEventListener('keydown', function(event) {
	if (event.keyCode == 13){//enter key was pressed
		keyValue = 13;
		keyPressed = true;
	}
	else if (event.keyCode == 8){
		keyValue = 8;
		keyPressed = true;
	}
});

document.addEventListener('keyup', function(event) {
    keyPressed = false;
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
		case "chest_inactive": chest_inactive(); break;
		case "chest_opening": chest_opening(); break;
		case "chest_pony_up": chest_pony_up(); break;
		case "chest_pony_out": chest_pony_out(); break;
		case "chest_info": chest_info(); break;
		case "chest_slide": chest_slide(); break;
		case "pony_info": pony_info(); break;
		case "credits": credits(); break;
	}
	modeTime += 1;
	gLoop = setTimeout(GameLoop, 1000 / 500);
	// ctx.fillText("("+mouseX+", "+mouseY+") "+playerFiring,areaWidth-100+tcx,20);
	// ctx.fillText(gameMode,areaWidth-100+tcx,40);
	// ctx.fillText((cpi+1)+" / "+ponyCollection.length,areaWidth-100+tcx,60);
	drawForeGround();
}

	//SAVE: scrolling background
	var logo = new Image();
	logo.src = DIR.concat("logo.png");
	logo.onload = function(){scaleImage(logo, desiredWidth-10, 0);};
function title_screen(){//title screen	
	var btnPlay = new Button("button_tmapge", 0, 0, "chest_inactive");
	if (!playerFired && btnPlay.checkClick(mouseX, mouseY, playerFiring)){
		setUp();
	}
	
	btnPlay.draw();
	ctx.drawImage(logo, convertXPos(centerX(logo.width)), convertYPos(desiredHeight - logo.height - 10), convertWidth(logo.width), convertHeight(logo.height));
	ctx.fillText("#MLGDMarathon December 2013", 5 + tcx, areaHeight - 20);
}
var chest = new Chest();
var hasPast100 = 0;//set to 1 when the 100 splashscreen has been shown, set to 2 after it's been shown (and not going to be shown again)
function chest_inactive(){
	btnOpen = new Button ("button_chest",chest.X-54,chest.Y-248,"chest_opening");
	btnPony = new Button ("button_pony",215,5,"pony_info");
	btnTitle = new Button ("button_title",5,5,"title_screen");	
	btnCredits = new Button ("button_credits",110,5,"credits");
	btnTri = new Button("button_triangle",desiredWidth-114,desiredHeight-165,0);
	if (hasPast100 >= 1 && hasPast100 <= 2){}//just to here to keep other buttons from activating when 100 splashscreen is displayed
	else if (btnOpen.checkClick(mouseX, mouseY, playerFiring)){
		chest.playAnimation();//tells the chest to start playing the animation
		chest.sparkleEffect.end();
	}
	else if (ponyCollection.length > 0 && !playerFired && btnPony.checkClick(mouseX, mouseY, playerFiring)){
		playerFired = true;
		setUpPonyInfo();
	}
	else if (!playerFired && btnTitle.checkClick(mouseX, mouseY, playerFiring)){
		playerFired = true;
	}
	else if (!playerFired && btnCredits.checkClick(mouseX, mouseY, playerFiring)){
		setUpCredits();
		playerFired = true;
	}
	else if (!playerFired && btnTri.checkClick(mouseX,mouseY,playerFiring)){
		playerFired = true;
		openTextBox();
	}
	btnOpen.draw();//this button doesn't appear on screen, it's just an overlay
	if (ponyCollection.length > 0){
		btnPony.draw();
	}
	btnTitle.draw();
	btnCredits.draw();
	btnTri.draw();
	chest.draw();//draw the whole chest
	if (textBoxOpened){
		evaluateTextBox();
	}
	if (hasPast100 < 3 && ponyCollection.length >= 100){//all the way down here to make sure it's drawn on top
		if (hasPast100 == 0){hasPast100 = 1;}
		var reText = "CONGRATULATIONS!\nYou've collected 100 ponies!\n\nThank you so much for playing this game!\nIt's difficult to go alone. Here, take this:\n#GrindingForLife\n\nNow, go check out all the other awesome games from the Mareathon! Have fun!\n-shieldgenerator7";
		var reFrame = new TextFrame(reText,"reFrame",0,-300);//CODE HAZARD: relies on a bug to get in correct position
		reFrame.drawImageLast = true;
		reFrame.draw();
		if (!playerFired && playerFiring){
			hasPast100 += 1;
			playerFired = true;
		}
	}
};
function chest_opening(){
	if (chest.atLastFrame()){
		switchGameMode("chest_pony_up");
		newPony = pickRandomPony();//sets newPony to a new instance of a randomly chosen pony
		newPony.velY = -5;
	}
	chest.draw();	
};
function chest_pony_up(){//he pony moving up out of the chest
	newPony.velY -= 0.25;
	newPony.move();
	if (newPony.getBottom() <= chest.getFrontTop()){
		newPony.velY = 0;
		pw = 500;
		pwv = 1;
		switchGameMode("chest_pony_out");
	}
	else if (newPony.Y <= chest.getFrontTop()-10){
		ponySoundChannel = newPony.sound.play();
	}
	chest.draw();
	//draw the pony, but with a mask
	var nc = document.createElement('canvas');//"new canvas"
	nc.width  = areaWidth+tcx;
	nc.height = areaHeight;
	var nctx = nc.getContext('2d');//"new ctx"
	nctx.fillRect(tcx,0,areaWidth,convertYPos(chest.getFrontTop()));
	nctx.globalCompositeOperation="source-in";
	var oldctx = ctx;
	ctx = nctx;
	newPony.draw();
	ctx = oldctx;
	ctx.drawImage(nc, 0, 0);
	chest.drawFront();
};
var pw = 500,
pwv = 1;//how much to increment pw by
function chest_pony_out(){
	chest.draw();
	if (newPony.Y < 0){
		newPony.velY = 5;
		newPony.move();
	}
	newPony.drawScale(pw,0);
	pw += pwv;
	pwv += 0.125;
	if (pw >= desiredWidth - 50){
		scaleImage(newPony.image,pw,0);
		ponyCollection.push(newPony);
		titleFrame = new TextFrame(newPony.name, "titleFrame", 0, 0);
		descFrame = new TextFrame(newPony.description, "descFrame", 0, desiredHeight/2);
		descFrame.centerText = false;
		descFrame.textSize = 40;
		rareFrame = new TextFrame(newPony.rarity, "rareFrame", titleFrame.X2, 0);
		rareFrame.centerable = false;
		rareFrame.rotate = -20;		
		rareFrame.drawImageLast = true;
		switchGameMode("chest_info");
	}
};
var titleFrame, descFrame, rareFrame;
var ponySoundChannel;
function chest_info(){
	chest.draw();
	btnNext = new Button ("button_chest_open",chest.X-33,chest.Y-325,"chest_slide");
	if (btnNext.checkClick(mouseX, mouseY, playerFiring)){
		newChest = new Chest();
		newChest.X = desiredWidth + centerX(chest.image.width);//start it off screen
		newPony.sound.pause();
	}
	else if (playerFiring && !playerFired){
		newChest = new Chest();
		newChest.X = desiredWidth + centerX(chest.image.width);//start it off screen
		newPony.sound.pause();
		switchGameMode("chest_slide");
	}
	if (newPony.Y < 0){
		newPony.velY = 1;
		newPony.move();
	}
	btnNext.draw();
	newPony.draw();
	titleFrame.draw();
	descFrame.draw();
	rareFrame.X = titleFrame.X2;
	rareFrame.draw();
};
var newChest = new Chest();
function chest_slide(){
	chest.slideOff();
	newPony.slideOff();
	newChest.slideOff();
	if (newChest.velX != 0 && newChest.X < centerX(newChest.width)){
		newChest.velX = 0;
	}
	if (chest.isOffScreen() && newPony.isOffScreen()){
		setUp();
		chest = newChest;
		chest.velX = 0;
		switchGameMode("chest_inactive");
	}
	chest.draw();
	newPony.draw();
	newChest.draw();
};
function setUpPonyInfo(){
	cpi = ponyCollection.length - 1;
}
var cpi = 0;//"current pony index"
var hidePonyInfo = false;
function pony_info(){
	var currentPony = ponyCollection[cpi];
	currentPony.X = centerX(currentPony.image.width);
	currentPony.draw();
	if (!hidePonyInfo){
		titleFrame = new TextFrame(currentPony.name, "titleFrame", 0, 0);
		descFrame = new TextFrame(currentPony.description, "descFrame", 0, desiredHeight/2);
		descFrame.centerText = false;
		descFrame.textSize = 40;
		rareFrame = new TextFrame(currentPony.rarity, "rareFrame", 0, 0);
		rareFrame.centerable = false;
		rareFrame.rotate = -20;
		rareFrame.drawImageLast = true;
		titleFrame.draw();
		rareFrame.X = titleFrame.X2;
		rareFrame.draw();
		descFrame.draw();
		
	btnLeft = new Button ("arrow_left",0,desiredHeight/2-160,0);
	btnRight = new Button ("arrow_right",desiredWidth - 100,desiredHeight/2-160,0);
	btnChest = new Button("button_chestT",5,105,"chest_inactive");
	btnSound = new Button("button_ponysound",110,105,0);
	//the following two controls may seem switched, but that's just to create the illusion that the newest pony is the first in the list (when internally it's the last)
	if (cpi < (ponyCollection.length - 1) && !playerFired && btnLeft.checkClick(mouseX, mouseY, playerFiring)){
		cpi += 1;
		playerFired = true;
		currentPony.sound.pause();
	}
	else if (cpi > 0 && !playerFired && btnRight.checkClick(mouseX, mouseY, playerFiring)){
		cpi -= 1;
		playerFired = true;
		currentPony.sound.pause();
	}
	else if (!playerFired && btnChest.checkClick(mouseX,mouseY,playerFiring)){
		playerFired = true;
		currentPony.sound.pause();
	}
	else if (!playerFired && btnSound.checkClick(mouseX,mouseY,playerFiring)){
		playerFired = true;
		currentPony.sound.currentTime = 0;
		currentPony.sound.play();
	}
	else if (!playerFired && playerFiring){
		playerFired = true;
		hidePonyInfo = !hidePonyInfo;
	}
	if (cpi < 0){
		cpi = 0;
	}
	if (cpi > ponyCollection.length - 1){
		cpi = ponyCollection.length - 1;
	}
	if (cpi < (ponyCollection.length - 1)){btnLeft.draw();}
	if (cpi > 0){btnRight.draw();}
	btnChest.draw();
	btnSound.draw();
	}
	else if (!playerFired && playerFiring){
		playerFired = true;
		hidePonyInfo = !hidePonyInfo;
	}
};
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

var forcedPony = 0;
forceNextPony = function(pony){
	forcedPony = pony;
}

var TextBuilder = function(){//copied from highScoreTable() from main.js from ShiftItOneAndUp(Railguns and Dragons)
	var that = this;
	that.buildName = "";
	
	that.acceptKeys = function(charN){//returns true when input line is finished
		if (charN == 13 || that.buildName.length >= 20){//enter keyCode passed through
			return true;
		}
		else if (charN == 8 && that.buildName.length > 0){
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