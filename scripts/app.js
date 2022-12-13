//@ts-check
/** @type {HTMLCanvasElement} */ //@ts-ignore canvas is an HTMLCanvasElement
const canvas = document.getElementById("game-canvas");
/** @type {CanvasRenderingContext2D} */ //@ts-ignore canvas is an HTMLCanvasElement
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const MOVE_UP ="up";
const MOVE_DOWN ="down";
const MOVE_LEFT ="left";
const MOVE_RIGHT ="right";

let game = {
	gridSize: 20,
	refreshRate: 200, // milliseconds
};
class Player {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {game} game
	 */
	constructor(x, y, ctx, game) {
		this.x = x;
		this.y = y;
		this.game = game;
		this.ctx = ctx;

		this.currentDirection = "MOVE_DOWN";
		this.requestedDirection = "MOVE_DOWN";
		this.head = new Segment(this.x, this.y, "purple", this.ctx);
		/** @type {Array<Segment>} */
		this.segments = [];
		this.sneakCount = 0;
		this.isDead = false;
		this.lastUpdate = 0;
		this.wireUpEvents();
	}

	isReverseMove(){
		if(this.requestedDirection == MOVE_RIGHT && this.currentDirection == MOVE_LEFT)
		return true;
		if(this.requestedDirection == MOVE_LEFT && this.currentDirection == MOVE_RIGHT)
		return true;
		if(this.requestedDirection == MOVE_DOWN && this.currentDirection == MOVE_UP)
		return true;
		if(this.requestedDirection == MOVE_UP && this.currentDirection == MOVE_DOWN)
		return true;
		 return false;
	}
	/**
	 * @param {number} elapsedTime
	 */
	update(elapsedTime) {
		this.lastUpdate += elapsedTime;
		if (this.lastUpdate < this.game.refreshRate) return;
		this.lastUpdate = 0;

		if(this.isReverseMove()){
			if(this.sneakCount > 0){
				this.sneakCount--;

				let reversSegments = [];

				for(let i = this.segments.length -1; i == 0 ; i --){
					reversSegments.push(this.segments[i]);
				}
				this.segments = reversSegments;
			}
		} else{
			this.currentDirection = this.requestedDirection;
		}
	

		for(let i = this.segments.length - 1; i >= 1; i--){
			this.segments[i].x = this.segments[i -1].x;
			this.segments[i].y = this.segments[i -1].y;
		}

		if(this.segments.length > 0){
			this.segments[0].x = this.head.x;
			this.segments[0].y = this.head.y;
		}
		
		switch (this.currentDirection) {
			case "MOVE_DOWN":
				this.head.y += this.game.gridSize;
				break;
			case "MOVE_UP":
				this.head.y -= this.game.gridSize;
				break;
			case "MOVE_RIGHT":
				this.head.x += this.game.gridSize;
				break;
			case "MOVE_LEFT":
				this.head.x -= this.game.gridSize;
				break;
		}

		//check for DEATH
		if(this.head.x < 0 ||
			 this.head.y < 0 ||
			  this.head.x >= canvas.width 
			  || this.head.y >= canvas.height ||
			  this.segments.some((s) => s.x == this.head.x && s.y == this.head.y)){
				this.isDead = true;
			  }

	}

	draw() {
		//if (this.isDead) return;
		this.head.draw();
		this.segments.forEach((s) => {
			s.draw();
		});
	}
	
	wireUpEvents(){
		document.addEventListener("keydown", (e) =>{
			//console.log(e.code);
			switch(e.code){
				case "ArrowUp":
					this.requestedDirection = "MOVE_UP";
					break;
				case "ArrowDown":
					this.requestedDirection = "MOVE_DOWN";
					break;
				case "ArrowLeft":
					this.requestedDirection = "MOVE_LEFT";
					break;
				case "ArrowRight":
					this.requestedDirection = "MOVE_RIGHT";
					break;
				
			}
		});
	}
	grow(gorwBy){
		for(let i = 0; i < gorwBy; i ++){
			this.segments.push(new Segment(this.head.x, this.head.y, "red", this.ctx));
		}
		this.sneakCount++;
	}
}
class Segment {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} color
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor(x, y, color, ctx) {
		this.x = x;
		this.y = y;
		this.w = game.gridSize;
		this.h = this.w;
		this.color = color;
		this.ctx = ctx;
	}

	update() {}

	draw() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.x, this.y, this.w, this.h);
	}
}
class Food {
	/**
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	constructor(ctx){
		this.ctx = ctx;
		this.x = 0;
		this.y = 0;
		this.radius = game.gridSize / 2;
		this.color = "red";
		this.gorwBy = 1;
		this.isEaten = true; 
	}
	spawn(){
		this.isEaten = false;
		let foodType = Math.floor(Math.random()* 3 + 1);
		switch(foodType){
			case 1:
				this.color = "red";
				this.gorwBy = 1;
				break;
			case 2:
				this.color = "blue";
				this.gorwBy = 2;
				break;
			case 3:
				this.color = "gold";
				this.gorwBy = 3;
				break;
			}
		let xGridMaxValue = canvas.width / game.gridSize; 
		let yGridMaxValue = canvas.height / game.gridSize; 
		let randomx = Math.floor(Math.random() * xGridMaxValue);
		let randomy = Math.floor(Math.random() * yGridMaxValue)
		this.x = randomx * game.gridSize;
		this.y = randomy * game.gridSize;
	}
	update(){}
	draw(){
		if(this.isEaten) return;
		this.ctx.beginPath()
		this.ctx.fillStyle = this.color;
		this.ctx.arc(
			this.x + this.radius, 
			this.y + this.radius, 
			this.radius,
			 0,
			Math.PI * 2);
		this.ctx.fill();
		this.ctx.closePath();
	}
}

let p1 = new Player(5 * game.gridSize, 5 * game.gridSize, ctx, game);
let food =[new Food(ctx),new Food(ctx),new Food(ctx),new Food(ctx)]

/**
 * @param {Array<Player>} players
 * @param {Array<Food>} food
 */
function CheckIfFoodIsComsumend(players, food){
	food.forEach((f) =>{
		players.forEach((p) => {
			if(p.head.x == f.x && p.head.y == f.y){
				f.isEaten = true;
				p.grow(f.gorwBy);
			}
		});
	});
}

//let f1= new Food(ctx);
//f1.spawn();
let currentTime = 0;

/**
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
	let elapsedTime = timestamp - currentTime;
	currentTime = timestamp;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	p1.update(elapsedTime);
	p1.draw();
	food.forEach((f) => {
		f.draw()
	});
	CheckIfFoodIsComsumend([p1], food);
	food.filter((f) => f.isEaten).forEach((f) => {
		f.spawn()
	});

	let isGameOver = [p1].some((p) => p.isDead);
	if (isGameOver){
		return
	}
	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);