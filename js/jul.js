var currentScene = 0;
var canvas;

var sceneVars = [];
var keysDown = [];


var scenes = [scene1, snowboardSanta, endGame];
var sceneInit = [scene1Setup, snowboardSantaSetup, endGameSetup];
var sceneOnKeyDown = [scene1OnKeyDown, snowboardSantaOnKeyDown, engGameKeyDown];

const snowString = "❄";
const obstacleString = "👾";
const giftString = "🎁";
const gemString = "💎";
const unicornString = "🦄";
const fireballString = "☄️";
const fireString = "🔥";
const trainString = "🚂";
const thunderCloudString = "🌩";

const deg2rad = 0.0174533;
const rad2deg = 57.2958;

var debugging = true;



window.onload = function () {
	canvas = document.getElementById("canvasElem");
	init();
}

function changeScene(sceneIndex, data){
	//console.log(data);
	currentScene = sceneIndex;
	
	sceneInit[sceneIndex](data);
}

function init() {
	sceneInit[currentScene]();
	window.addEventListener("keydown", function (e) {
		//console.log("keydown");
		keysDown.push(e.keyCode);
		sceneOnKeyDown[currentScene](e);

	});

	window.addEventListener("keyup", function(e){
		for (var i = keysDown.length - 1; i >= 0; i--) {
			if (e.keyCode == keysDown[i]) {
				keysDown.splice(i,1);
			}
			
		}
	});

	window.requestAnimationFrame(loop);
}

function loop(){
	scenes[currentScene]();
	window.requestAnimationFrame(loop);	
}

function scene1Setup() {
	sceneVars[currentScene] = {
		tick:0,
		fontSize: 64,
		snowflakes: []
	}

	sceneVars[currentScene].playButtonPos = new Vector(canvas.width/2,canvas.height/2);


}

function scene1OnKeyDown(e){
	if (e.keyCode == 13) {
		changeScene(1);
	}

}


function scene1(){
	//pynt juletræ
	var s = sceneVars[currentScene];
	
	var ctx = canvas.getContext("2d");

	background("#42bcf4");

	ctx.font = s.fontSize+"px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = "#000";
	ctx.fillText("PLAY", s.playButtonPos.x, s.playButtonPos.y);
	ctx.font = (s.fontSize/3) +"px Helvetica";
	ctx.fillText('Press "ENTER" to start the game', s.playButtonPos.x, s.playButtonPos.y + s.fontSize * 1.3);

	//spawn snowflakes

	if (s.tick % 8 == 0) {
		scene1SpawnSnowflake();
	}

	//update and snowflakes

	//ctx.fillStyle = "#000";



	for (var i = s.snowflakes.length - 1; i >= 0; i--) {
		s.snowflakes[i].update();
		var snowflakePos = s.snowflakes[i].pos;
		if (snowflakePos.y >= 550) {
			s.snowflakes.splice(i,1);
			continue;
		}
		ctx.fillText(snowString, snowflakePos.x, snowflakePos.y);
	}

	s.tick++;






}

function scene1SpawnSnowflake() {
	//console.log("snowflake spawned");
	var startPos = new Vector(Math.random() * 500, -50);
	var snowflake = new Scene1Snowflake(startPos);
	var s = sceneVars[currentScene];

	s.snowflakes.push(snowflake);

}




function snowboardSantaSetup(){
	delete sceneVars[0];
	sceneVars[currentScene] = {
		score: 0,
		difficulty: 1,
		tick: 0,
		moving: true,
		hitboxRadius: 45,
		santaPos: new Vector(75,100),
		santaImg: new Image(),
		santaSpeed: 4.5,
		objects: {
			obstacles: [],
			gifts: [],
			bosses: [],
			snowflakes: [],
			others: []
		},
		backgroundImg: new Image(),
		backgroundSpeed: 3,
		fontSize: 16,
		yPerX: 129.5/500,
		objectSize: 32,
		allowRandomSpawn: true,
		lastSpawnedObject: 0,
		bossFight: false,
		standardMovement: null,
		snowCharge: 0,
		santaAttackActive: false,
		santaAttackAngleV: new Vector(1,1),
		incDifficultyTick: 0,
		bossFightEndTick: 0

	};

	var s = sceneVars[currentScene];



	sceneVars[currentScene].standardMovement = new Vector(-s.backgroundSpeed, -s.backgroundSpeed * s.yPerX);

	sceneVars[currentScene].santaImg.src = "./img/snowboard-santa100x100.png";
	sceneVars[currentScene].backgroundImg.src = "./img/hill.png";


}

function snowboardSanta() {

	var ctx = canvas.getContext("2d");

	var s = sceneVars[currentScene];
	santaSnowBoardBackground()


	if (s.moving) {

		//draw background
		//move 5 pixels per tick
		//y(x) = (415 - 280)x / 500
		
		sceneVars[currentScene].tick ++;
	}

	ctx.drawImage(sceneVars[currentScene].santaImg, 
		sceneVars[currentScene].santaPos.x, 
		sceneVars[currentScene].santaPos.y);



	if (keysDown.indexOf(40) !== -1) {
		moveSanta(1);
	}
	if (keysDown.indexOf(38) !== -1) {
		moveSanta(-1);
	}

	ctx.textAlign = "left";
	ctx.font = s.fontSize+"px Helvetica";
	ctx.fillStyle = "black";
	ctx.fillText("score: " + s.score + " " + giftString, 5,s.fontSize + 5);


	if (s.allowRandomSpawn) {
		if (Math.random() > 0.99) {
			spawnMonster();
		}else if (Math.random() > 0.99) {
			spawnGift();
		}
	}

	//move monsters and gifts
	updateObjects();

	ctx.font = s.objectSize + "px Helvetica";


	//check collision
	var santaRealPos = s.santaPos.add(new Vector(45,52));
	s.santaRealPos = santaRealPos;
	if (debugging) {

		ctx.fillRect(santaRealPos.x,santaRealPos.y,1,1);
		circleH(santaRealPos.x,santaRealPos.y, s.hitboxRadius);

	}

	ctx.textAlign = "center";

	for (var i = s.objects.gifts.length - 1; i >= 0; i--) {
		var distanceToGift = s.objects.gifts[i].pos.subtract(santaRealPos).getMagnitude();

		if(distanceToGift < s.hitboxRadius + (s.objectSize/2)){
			//tilføj point
			s.score++;

			//fjern pakken
			s.objects.gifts.splice(i,1);
		}		

	}

	for (var i = s.objects.snowflakes.length - 1; i >= 0; i--) {
		var distanceToSnowflake = s.objects.snowflakes[i].pos.subtract(santaRealPos).getMagnitude();
		if (distanceToSnowflake < s.hitboxRadius + (s.objectSize/2)) {
			s.snowCharge++;
			s.objects.snowflakes.splice(i,1);
		}
	}

	for (var i = s.objects.obstacles.length - 1; i >= 0; i--) {
		var distanceToObstacle = s.objects.obstacles[i].pos.subtract(santaRealPos).getMagnitude();

		if(distanceToObstacle < s.hitboxRadius + (s.objectSize/2)){
			
			changeScene(2, s);

		}		

	}


	// draw objects

	drawObjects();

	if (s.tick >= s.bossFightEndTick + 600 && !s.bossFight) {
		//spawn boss
		s.bossFight = true;
		s.allowRandomSpawn = false;
		spawnUnicornBoss(s);

	}

	if (s.bossFight) {
		if (s.lastSpawnedObject + 200 <= s.tick && (!s.objects.bosses[0].movingIntoScreen && !s.objects.bosses[0].ready)) {
			s.objects.bosses[0].moveIntoScreen(60);
		}

		if (s.snowCharge >= 1 && !s.santaAttackActive) {
			s.santaAttackActive = true;
			//set angle between -5 and 40 degree
			var angle = getRandomAngle(-30, 15);
			var vect = new Vector(1000,0);
			s.santaAttackAngleV = vect.setDirection(angle);
			//console.log(s.santaAttackAngleV.getDirection(), vect.getDirection(), angle, vect);


		}

		if (Math.random() >= 0.99) {
			spawnSnowflake();
		}

		if (s.santaAttackActive) {
			//draw line for attack
			var vect = s.santaAttackAngleV.copy().setMagnitude(500);
			drawLineRel(santaRealPos, vect);

			//draw emoji
			ctx.fillText(gemString, santaRealPos.x, santaRealPos.y);

			if (keysDown.indexOf(32) != -1) {
				
				s.santaAttackActive = false;
				s.snowCharge--;

				//santa shoots
				santaShoot();

			}


		}

		drawHealthBar(s.objects.bosses[0]);
	}


}

function santaShoot() {
	var s = sceneVars[currentScene];


	//create a thicc 👌👌 line
	var thiccLine = new ThiccLine(s.santaRealPos, s.santaAttackAngleV, 10);
	s.objects.others.push(thiccLine);
	

	//SICK ALGORITHM FOR DAMAGING THE BOSS
	//did we hit?
	var bossObj = s.objects.bosses[0];
	var santaP = s.santaRealPos;
	var bossP = bossObj.pos;


	var diffVect = bossP.subtract(santaP);
	var xDiff = Math.abs(diffVect.x);
	var yDiff = Math.abs(diffVect.y);
	var newYPerX = s.santaAttackAngleV.y/s.santaAttackAngleV.x;



	var santaAttackAtBoss = new Vector(xDiff+ santaP.x, santaP.y + xDiff*newYPerX);

	var distanceFromBoss = Math.abs(santaAttackAtBoss.y - bossP.y);


	//console.log(distanceFromBoss);
	if (distanceFromBoss <= bossObj.size) {
		var maxDmg = 1000 * Math.pow(1.25, s.snowCharge) ;
		var actualDmg = maxDmg * (1-distanceFromBoss/ bossObj.size);
		console.log(maxDmg, actualDmg);

		bossObj.dealDamage(actualDmg);
		bossObj.shake(60);
	}
	


	//snowcharge goes down
	s.snowCharge = 0;



}


function endBossFight() {
	var s = sceneVars[currentScene];
	s.objects.bosses = [];

	s.bossFight = false;
	s.snowCharge = 0;
	s.allowRandomSpawn = true;
	s.bossFightEndTick = s.tick;
}


function ThiccLine(pos, vector, width) {
	this.pos = pos;
	this.vector = vector;
	this.width = width;



}

ThiccLine.prototype.update = function() {
	this.width -= 0.5;
	if (this.width <= 0) {
		return false;
	}


	
};

ThiccLine.prototype.draw = function() {
	var ctx = canvas.getContext("2d");
	//var s = sceneVars[currentScene];

	ctx.lineWidth = this.width;
	drawLineRel(this.pos, this.vector);

};




function santaSnowBoardBackground(){
	var s = sceneVars[currentScene];
	var ctx = canvas.getContext("2d");
	background("#fff");
	var speed = difficultySpeed(s.difficulty);


	var imgAbsX = ((s.tick * speed) % (700 / s.backgroundSpeed )) * s.backgroundSpeed;
	var imgAbsY = imgAbsX * s.yPerX;
	

	var img1y = -20 - imgAbsY;
	ctx.drawImage(s.backgroundImg
		, 500 - imgAbsX 
		, img1y);//*/

	var img2y = -200 - imgAbsY;
	var img2x = -200 - imgAbsX;

	ctx.drawImage(s.backgroundImg
		, img2x
		, img2y);//*/
}

function endGameSetup(snowboardSantaVars){
	//console.log(snowboardSantaVars);
	var s = sceneVars[currentScene];
	sceneVars[currentScene] = snowboardSantaVars;
	for (var i = sceneVars.length - 2; i >= 0; i--) {
		delete sceneVars[i];
	}
}

function endGame() {
	var s = sceneVars[currentScene];
	var ctx = canvas.getContext("2d");
	//console.log(s);

	//draw scene
	//draw background
	background("#fff");

	santaSnowBoardBackground();

	//draw santa
	ctx.drawImage(sceneVars[currentScene].santaImg, 
		sceneVars[currentScene].santaPos.x, 
		sceneVars[currentScene].santaPos.y);

	//draw objects
	ctx.textAlign = "center";
	ctx.font = s.objectSize + "px Helvetica";
	drawObjects();

	//draw you died
	
	ctx.font = s.fontSize + "px Helvetica";
	var text1 = {
		str:"Santa died!...",
		pos: new Vector( 250, 100)
	}
	var text2 = {
		str:"No children will have gifts this christmas...",
		pos: new Vector(250, 100+s.fontSize) 
	}
	var text3 = {
		str: "You collected: " + s.score + giftString,
		pos: new Vector(250, 200)
	}

	ctx.fillStyle = "#fff";

	ctx.fillRect(text1.pos.x - (ctx.measureText(text1.str).width/2) - 2, text1.pos.y - s.fontSize,
		ctx.measureText(text1.str).width + 4, s.fontSize + 4 );
	ctx.fillRect(text2.pos.x - (ctx.measureText(text2.str).width/2) - 2, text2.pos.y - s.fontSize,
		ctx.measureText(text2.str).width + 4, s.fontSize + 4 );
	ctx.fillRect(text3.pos.x - (ctx.measureText(text3.str).width/2) - 2, text3.pos.y - s.fontSize,
		ctx.measureText(text3.str).width + 4, s.fontSize + 4 );

	ctx.fillStyle = "#000";

	ctx.fillText(text1.str, text1.pos.x, text1.pos.y);
	ctx.fillText(text2.str, text2.pos.x, text2.pos.y);




	//draw score

	//	ctx.strokeText(text3.str, text3.pos.x, text3.pos.y);
	ctx.fillText(text3.str, text3.pos.x, text3.pos.y);



}

function engGameKeyDown(e) {
	// body...
}



function spawnMonster() {

	var s = sceneVars[currentScene];

	spawnObstacle(new Vector(500,Math.random()*415 + 280), s.standardMovement, obstacleString);
	sceneVars[currentScene].lastSpawnedObject = sceneVars[currentScene].tick + 0;
}

function spawnObstacle(pos, movement, emoji) {
	sceneVars[currentScene].objects.obstacles.push(new Obstacle(pos,movement,emoji));
}

function spawnUnicornBoss(thisScene){
	var s = thisScene;
	s.objects.bosses.push(new UnicornBoss(thisScene));

}

function Scene1Snowflake(pos) {
	this.tick = 0;
	this.pos = pos;
	this.movement = new Vector(0,2);
	this.random = Math.round(Math.random()*30+15);

}

Scene1Snowflake.prototype.update = function () {
	this.pos.addTo(this.movement);
	this.updateMovement();
	this.tick++;
}

Scene1Snowflake.prototype.updateMovement = function () {
	this.movement.x = Math.sin(this.tick/this.random);
}

//////////////////////
//	  OBSTACLE	    //
//////////////////////

function Obstacle (pos, movement, emoji) {
	this.pos = pos;
	this.movement = movement;
	this.emoji = emoji;
}

Obstacle.prototype.update = function(speed) {
	this.pos = this.pos.add(this.movement.multiply(speed));
};

//////////////////////
//	 COLLECTITEM	//
//////////////////////


function CollectItem(pos, movement, emoji) {
	this.pos = pos;
	this.movement = movement;
	this.emoji = emoji;
}

CollectItem.prototype.update = function (speed) {
	this.pos = this.pos.add(this.movement.multiply(speed));
}

//////////////////////
//		BOSS 		//
//////////////////////

function UnicornBoss(thisScene){
	this.health = 5000;
	this.maxHealth = 5000;
	this.size = 86;
	this.pos = new Vector(500 + this.size/2 + 10, 250);

	this.sceneVars = thisScene;
	this.shakeDuration = 0;
	this.lastShakeLeft = false;
	this.spawnTick = this.sceneVars.tick + 0;
	this.movingIntoScreen = false;
	this.normalAttackEmoji = fireballString;
	this.lastAttackTick = 0;
}

UnicornBoss.prototype.shake = function(duration) {
	//duration in ticks
	this.shakeDuration = duration;
};

UnicornBoss.prototype.normalAttack = function() {

	spawnObstacle(
		this.pos.copy(), 
		this.sceneVars.santaPos.add(new Vector(50,50)).subtract(
			this.pos.copy()).setMagnitude( 
				difficultySpeed( this.sceneVars.difficulty) * this.sceneVars.backgroundSpeed * 0.8 ),
		this.normalAttackEmoji
	); 
	this.lastAttackTick = this.sceneVars.tick + 0;
	
};


UnicornBoss.prototype.specialAttack1 = function () {





	
	this.lastAttackTick = this.sceneVars.tick + 0;
}

UnicornBoss.prototype.moveIntoScreen = function(time) {
	//time in ticks
	console.log("boss moving into screen");
	this.startMoveIntoScreen = this.sceneVars.tick;
	this.startPos = this.pos.copy();
	this.movingIntoScreen = true;
	this.moveIntoScreenTime = time;

};

UnicornBoss.prototype.dealDamage = function(amount) {
	this.health -= amount;
	return this.health > 0
};

UnicornBoss.prototype.update = function (updatedScene) {
	this.sceneVars = updatedScene;
	if (this.shakeDuration > 0) {
		this.shakeDuration--;
		this.lastShakeLeft = !this.lastShakeLeft;
		if (this.lastShakeLeft) {
			this.pos.x += 3;
		} else {
			this.pos.x -= 3;
		}
	}

	if (this.movingIntoScreen) {
		var timeMoved = this.sceneVars.tick - this.startMoveIntoScreen ;
		//console.log(timeMoved, this.moveIntoScreenTime);
		if (timeMoved >= this.moveIntoScreenTime || this.pos.x <= this.startPos.x - 1.5 * this.size) {
			this.movingIntoScreen = false;
			this.ready = true;
		}



		this.pos = new Vector(this.startPos.x - 1.5 * this.size * (timeMoved / (this.moveIntoScreenTime) ), this.pos.y);
	}

	if (this.ready) {
		var timeSinceLastAttack = this.sceneVars.tick - this.lastAttackTick;
		if (timeSinceLastAttack >= 120) {
			this.normalAttack();
		}
	}
	
};

function drawHealthBar(boss) {
	var s = sceneVars[currentScene];
	var healthBarXCenter = 250;
	var fullSizeX = 200 ;
	var startX = healthBarXCenter - fullSizeX/2;
	var ctx = canvas.getContext("2d");
	//draw name
	var name = "Dexter: ";
	
	ctx.lineWidth = 1;
	ctx.font = s.fontSize + "px Helvetica";
	ctx.textAlign = "left";
	ctx.fillText(name, startX, s.fontSize + 5);
	//draw bar
	var nameWX = ctx.measureText(name).width;
	ctx.fillStyle = "#f00";
	ctx.strokeStyle = "#000";
	ctx.strokeRect(startX + nameWX, 5, fullSizeX - nameWX, s.fontSize);
	ctx.fillRect(startX + nameWX, 5,  (boss.health/boss.maxHealth) *  (fullSizeX- nameWX) , s.fontSize);


}



function updateObjects() {
	var s = sceneVars[currentScene];

	for(var thing in s.objects){
		if (thing == "others") {
			for (var i = s.objects[thing].length - 1; i >= 0; i--) {
				var object = s.objects[thing][i]
				var updateBool = object.update();
				if (updateBool === false) {
					s.objects[thing].splice(i,1);
				}
			}
			
				
		} else if (thing != "bosses") {
			for (var i = s.objects[thing].length - 1; i >= 0; i--) {
				var object = s.objects[thing][i];
				if (object.pos.x <= -s.objectSize) {
					s.objects[thing].splice(i,1);
					continue;
				}

				var speed = difficultySpeed(s.difficulty);
				
				object.update(speed);

			}
		}else{
			for (var i = s.objects[thing].length - 1; i >= 0; i--) {
				var object = s.objects[thing][i];
				object.update(s);

				//if boss is dead
				if (object.health <= 0) {
					//drop gifts
					for (var i = 10 - 1; i >= 0; i--) {
						spawnGift();
					}

					//end bossfight
					endBossFight();
					s.difficulty++;
				}
				

			}
		}
	}
}

function drawObjects() {
	var s = sceneVars[currentScene];
	var ctx = canvas.getContext("2d");
	for (var i = s.objects.obstacles.length - 1; i >= 0; i--) {
		var object = s.objects.obstacles[i];
		var objectPos = object.pos;
		ctx.fillText(object.emoji, objectPos.x, objectPos.y);
	}

	for (var i = s.objects.gifts.length - 1; i >= 0; i--) {
		var objectPos = s.objects.gifts[i].pos;
		ctx.fillText(giftString, objectPos.x, objectPos.y);
	}

	for (var i = s.objects.snowflakes.length - 1; i >= 0; i--) {
		var objectPos = s.objects.snowflakes[i].pos;
		ctx.fillText(snowString, objectPos.x, objectPos.y);
	}

	for (var i = s.objects.bosses.length - 1; i >= 0; i--) {
		var boss = s.objects.bosses[i];
		ctx.font = boss.size + "px Helvetica";
		ctx.fillText(unicornString, boss.pos.x, boss.pos.y);
		if (debugging) {
			ctx.fillStyle = "#f00";
			point(boss.pos.x, boss.pos.y);	
			point(boss.pos.x-1, boss.pos.y-1);
			point(boss.pos.x+1, boss.pos.y+1);
		}
		

	}

	for (var i = s.objects.others.length - 1; i >= 0; i--) {
		s.objects.others[i].draw();
	}
}

function spawnGift(){
	var s = sceneVars[currentScene];

	var gift = new CollectItem(new Vector(500,Math.random()*415 + 280), s.standardMovement, giftString);
	s.objects.gifts.push(gift);

	sceneVars[currentScene].lastSpawnedObject = sceneVars[currentScene].tick + 0;
}


function spawnSnowflake() {
	var s = sceneVars[currentScene];
	var snowflake = new CollectItem(
		new Vector(500,Math.random()*415 + 280),
		s.standardMovement, snowString
	);

	s.objects.snowflakes.push(snowflake);

}




function moveSanta(direction) {
	//direction up = 1, down = -1
	if (sceneVars[currentScene].santaPos.y + sceneVars[currentScene].santaSpeed > 400 && direction == 1) {
		return;
	} else if (sceneVars[currentScene].santaPos.y - sceneVars[currentScene].santaSpeed < 60 & direction == -1) {
		return;
	}
	sceneVars[currentScene].santaPos.y += (direction * sceneVars[currentScene].santaSpeed);
	sceneVars[currentScene].santaPos.x -= (direction * sceneVars[currentScene].santaSpeed/3); 

}

function snowboardSantaOnKeyDown(e){


}



function background(color){
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = color;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
}

function point(x,y){
	var ctx = canvas.getContext("2d");
	ctx.fillRect(x,y,1,1);

}


function circle(x,y,radius) {
	var ctx = canvas.getContext("2d");

	ctx.beginPath();
	ctx.arc(x,y,radius,0,2*Math.PI, false);
	ctx.fill();

}

function circleH(x,y,radius) {
	var ctx = canvas.getContext("2d");

	ctx.beginPath();
	ctx.arc(x,y,radius,0,2*Math.PI, false);
	ctx.stroke();

}

function drawLineRel(pos, vector) {
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(pos.x,pos.y);
	var vectorToPos = pos.add(vector); 
	ctx.lineTo(vectorToPos.x,vectorToPos.y);
	ctx.stroke();

}

function difficultySpeed(difficulty){
//	var s = sceneVars[currentScene];
	var newDifficulty = difficulty;/*
	if (s.tick -500 <= s.incDifficultyTick) {
		newDifficulty = difficulty * ((s.tick - s.incDifficultyTick)/500)
	}*/
	return 0.6666*Math.pow(Math.E, 0.405 * newDifficulty);
}


function getRandomAngle(start, end){
	var r = Math.random();
	var angle = r * (end - start) * deg2rad + start * deg2rad;
	//console.log(r * (end - start) + start, r * (end - start));
	//console.log(angle, angle* rad2deg);
	return angle;
}



//*/