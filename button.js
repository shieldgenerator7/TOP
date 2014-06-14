/*Requires:
DIR: a global variable that is the resource directory.
Two images with names [text].png and [text]_over.png, where [text] is the value of the "text" parameter
It also implies you need a mode switching system, however, you can disable that
	It requires you to have a method named switchGameMode(gameMode) if you use it, else change the name of the method or change what happens there
You have to have a method to capture mouse events
*/


//makes a button that switches gameModes when clicked
function Button(text, x, y, modeTo){//text: used for getting image names; x,y: top left coordinates of button; modeTo: the name of the mode to switch to when clicked (set to 0 to deactivate this feature)
	var that = this;
	that.img = new Image();
	that.img.src = DIR+text+".png";
	that.X = x;
	that.Y = y;
	//the following two lines restrict the image size to the given dimensions
	that.width = 100;//text.length + 20;
	that.height = 50;
	that.text = text;
	that.modeTo = modeTo;
	that.mouseOver = false;
	
	//checks to see if it's been clicked
	//returns true if clicked on, returns false if moused-over or mouse not over it
	that.checkClick = function(x, y, click){//x,y: the coordinates of the mouse (whether on this button or not); click: whether or not the mouse is currently being clicked
		that.mouseOver = false;
		that.img.src = DIR+text+".png";
			if (x > that.X){//mouse-button collision detection
				if (x < that.X + that.width){
					if (y > that.Y){
						if (y < that.Y + that.height){
							if (click){
								return that.onClick();
							}
							else
								that.onMouseOver();
						}
					}
				}
			}
		return false;//button is not clicked on
	}
	//activates the button when clicked
	that.onClick = function(){
		if (that.modeTo){
			switchGameMode(that.modeTo);//switches game modes, this is a global method we have elsewhere
		}
		return true;
	}
	//paints the button differently when moused over
	that.onMouseOver = function(){
		that.mouseOver = true;
		that.img.src = DIR+text+"_over.png";
	}
	//draws the button
	that.draw = function(){
		ctx.drawImage(that.img, that.X, that.Y, that.width, that.height);
	}
}

//
// EXAMPLE USAGE
//

//CREATING AND USING THE BUTTON
var btnPlay = new Button("Play", 100, 100, "play");//here, we have two images called "play.png" and "play_over.png" already; the coordinates are (100,100); and "play" is the name of the mode to switch to
if (btnPlay.checkClick(mouseX, mouseY, playerFiring)){
	//here, we have two variables that store the mouse coordinates (mouseX, mouseY), which are set in a mouse event listener method (below);
	//and playerFiring, which is also set in a mouse event listener method, it stores the click state of the mouse
	setUp();//this is the name of a method we have that we have decided to call when this button is clicked
}
btnPlay.draw();//here we call the draw method, which draws the button

//EXAMPLE MOUSE EVENT LISTENERS
//(c is the canvas)
//(document is the document)
c.addEventListener('mousemove', function(e){
		mouseX = e.pageX;
		mouseY = e.pageY;
});
var playerFiring = false;//this says whether or not the player is firing
document.addEventListener('mousedown', function(e){
		playerFiring = true;//the mouse is clicked
});

document.addEventListener('mouseup', function(e){
		playerFiring = false;//the mouse is not clicked
});