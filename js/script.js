"use strict";

class Game {
    constructor() {
        this.scoreTag = document.querySelector('#score');
        this.score = 0;
        this.stopped = true;
        this.animationID;

        this.court = new Canvas(900, 600, 50);
        this.paddle = new Paddle(375, 570, 150, 30, "#fff", this.court.ctx, this.court.borderWidth);
        this.ball = new Ball(450, 10, 10, "#fff", 5, this.court.ctx, this.paddle);
      
        window.addEventListener("keydown", this.handleControls.bind(this));
        window.addEventListener("mousemove", this.handleControls.bind(this));
              
    }

    start() {
        this.reset();
        this.stopped = false;
        this.displayScore();
        this.paddle.draw();
        this.ball.draw();
        this.refresh();
    }

    reset() {
        this.court.clear();
        this.paddle.reset();
        this.ball.reset();
        this.score = 0;
       
    }
    
    handleControls(event) {
        if (event.type === "keydown" || event.type === "mousemove") {
            if(!this.stopped) {
                this.paddle.move(event);  
            }   
        }
        if (event.code === "Space") {
            this.start();
        }     
    }

    refresh() {
        if (!this.stopped) {
            let collisionTest = this.ball.move();
    
            if (collisionTest === "bottom") {
                this.gameOver();
            } else {
                if (collisionTest === "paddle") {
                    this.updateScore();
                    this.updateSpeed();
                }
            }
            this.animationID = requestAnimationFrame(this.refresh.bind(this));
        }
    }

    displayScore() {
        this.scoreTag.innerHTML = this.score; 
    }

    updateScore() {
        this.score++;
        this.displayScore();
    }

    updateSpeed() {
        if (this.score === 5 || this.score === 10) {
            this.ball.speedInPixel += 3;
            this.ball.setSpeedToDirection();
        }
    }

    gameOver() {
        console.log("Game Over");
        this.court.displayGameOver();
        if (this.animationID) {
            cancelAnimationFrame(this.animationID);
        }
        this.stopped = true;
    }
}
  
class Canvas {
    constructor(width, height, borderWidth) {
        this.borderWidth = borderWidth;

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.border = "30px solid grey";
        this.canvas.style.margin = "50px auto";
        this.canvas.style.display = "block";
        this.canvas.style.backgroundColor = "black";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  
    }

    displayGameOver() {
        this.clear();
        this.ctx.strokeStyle = "#fff";
        this.ctx.font = '6rem Arial';
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Game Over', 446, 300);
    }
}

class Paddle {
    constructor(x, y, width, height, color, ctx, canvasBorder) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.ctx = ctx;
        this.canvasBorder = canvasBorder;

        this.speedInPixel = 80;
        this.midWidth = this.width/2;
        this.leftEdge =  0;
        this.rightEdge = this.ctx.canvas.width - this.width;

    }

    clear() {
        this.ctx.clearRect(this.x, this.y, this.width, this.height);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.closePath();
    }

    resetCoordinates(event) {
        let nextX;
        
        if (event.type === "keydown") {
            nextX = event.code === "ArrowRight" ? this.x + this.speedInPixel : this.x - this.speedInPixel;
        } else {// event.type === "mousemove"
            nextX = event.clientX - this.ctx.canvas.offsetLeft - this.canvasBorder - this.midWidth;
        }
        
        if (nextX < this.leftEdge) nextX = this.leftEdge;;
        if (nextX > this.rightEdge) nextX = this.rightEdge;

        this.x = nextX;
     
    }

    move(event) {
        this.clear();
        this.resetCoordinates(event);
        this.draw();
    }

    reset() {
        //TODO: voir si on peut ecrire this.x = x; en faisant appel aux paramètres du constructeur en dehors du constructeur pour eviter d'écrire 375 en dur
        this.x = 375;
        this.y = 570;
    }
}

class Ball {
    constructor (x, y, radius, color, speed, ctx, paddle) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speedInPixel = speed;
        this.ctx = ctx;
        this.paddle = paddle;
     
        this.directionX = - this.speedInPixel;
        this.directionY = this.speedInPixel;
        this.leftEdge = this.radius;
        this.rightEdge = this.ctx.canvas.width - this.radius;
        this.topEdge = this.radius;
        this.bottomEdge = this.ctx.canvas.height - this.radius;

    }
    clear() {
        this.ctx.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    resetCoordinates() {
        let newCoordinates = this.calculateNextPosition();

        let collisionTest = this.detectCollision(newCoordinates);

        
        if (collisionTest === "bottom") { 
            return collisionTest;
        } else {
            // Si la balle dépasse le canvas on inverse le sens pour générer l'effet de rebond
            if (collisionTest === "left" || collisionTest === "right") {
                this.directionX = - this.directionX;
            }
            if (collisionTest === "top" || collisionTest === "paddle"){
                this.directionY = - this.directionY;
            }
            
            this.x += this.directionX;
            this.y += this.directionY;

            return collisionTest;
        }
        
    }

    calculateNextPosition() {
        return {x: this.x + this.directionX, y: this.y + this.directionY};
    }

    detectCollision(newCoordinates) {
       
        const isOnPaddle = newCoordinates.x >= this.paddle.x && newCoordinates.x <= this.paddle.x + this.paddle.width && newCoordinates.y >= this.bottomEdge - this.paddle.height;
            
        if (newCoordinates.x <= this.leftEdge) return "left";
        if (newCoordinates.x >= this.rightEdge) return "right";
        if (newCoordinates.y <= this.topEdge) return "top";
        if (newCoordinates.y >= this.bottomEdge) return "bottom";
        if (isOnPaddle) return "paddle";
        return "ok";
    }

    move() {
        this.clear();
        let collisionTest = this.resetCoordinates();
        this.draw();
        return collisionTest;
    }

    reset() {
        this.x = 450;
        this.y = 10; 
        this.speedInPixel = 5;
        this.directionX = - this.speedInPixel;
        this.directionY = this.speedInPixel;   
    }

    setSpeedToDirection() { 
        this.directionX = this.directionX > 0 ? this.speedInPixel : - this.speedInPixel;
        this.directionY = this.directionY > 0 ? this.speedInPixel : - this.speedInPixel;
    }

}



window.addEventListener('load', function() {
    const game = new Game();
    game.start();
});   
