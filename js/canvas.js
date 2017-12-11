var WindowY = window.innerHeight;
var WindowX = window.innerWidth;

var mainCanvas;

function Canvas(canvasDiv){
	this.div = canvasDiv;
	this.canvasIsSet = false;
	this.canvasElem = null;
	this.drawingDifference = null;
	this.size = new Vector(1920,1080);
	this.animate = true;

	

}

Canvas.prototype.createCanvas = function(vectorSize) {
 	var thisCanvas = document.createElement("canvas");
 	this.canvasElem = thisCanvas;
 	thisCanvas.setAttribute("width", vectorSize.x);
 	thisCanvas.setAttribute("height", vectorSize.y);
 	this.div.body.innerHTML = "";
 	this.div.body.appendChild(thisCanvas);
}; 

Canvas.prototype.init = function(){
	window.addEventListener("resize", function(){
		this.onResize();
	});
	this.createCanvas(new Vector(
		this.divsDiv.innerWidth, 
		this.div.innerHeight
	));
	this.onResize();
};

Canvas.prototype.onResize = function(){
	this.canvasElem.width = this.div.width;
	this.drawingDifference = this.canvasElem.width / this.size.x;
	this.canvasElem.height = this.size.y * this.drawingDifference;



};


Canvas.prototype.background = function(color){
	var ctx = this.canvasElem.getContext("2d");
	ctx.fillStyle = color;
	ctx.fillRect(0,0,1920 * this.drawingDifference, 1080 * this.drawingDifference);


};


function loopFunction(){
	mainCanvas.background("#ff0000");
}

Canvas.prototype.loop = function(){
	console.log("looping");
	loopFunction();


	if (this.animate) {
		window.requestAnimationFrame(loop);
	}
}

window.onload = function(){
	console.log("window on load");
	mainCanvas = new Canvas(document.getElementById("canvas-container"));
	mainCanvas.loop();
}

