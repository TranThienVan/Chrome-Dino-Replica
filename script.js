// Create a canvas html tag to contain the background for playing
const canvas = document.createElement("canvas")
// Set the width, height, border for the canvas
canvas.width = 640
canvas.height = 500
canvas.style.border = "2px solid black"
canvas.style.borderRadius = "10px"

// The canvas get the drawing context "2D"
// Later to draw boxes..
const ctx = canvas.getContext("2d")
document.getElementById("canvas").appendChild(canvas)

// Create a variables for the gameplay
let score;          // Current Score
let scoreText;

let highscore;      // Highest Score
let highscoreText;

let player;         // Player
let gravity;        // Gravity for the falling effect
let obstacles = [];      // Obstacles for the player to pass
let gameSpeed;      // Increase gameSpeed eachtime player pass the obstacle
let keys = {};      // Setting up key for controlling the game

// Key functions to control the gameplay
document.addEventListener("keydown", function(e){
    keys[e.code] = true
})

document.addEventListener("keyup", function(e){
    keys[e.code] = false
})


// Create an class object named Player that can contains variables, methods,... 
class Player {
    //  Create a class constructor inside the big class Player
    constructor (x , y, width, height, color){
        // x: x dimension, y: y dimension, w: width, h: height, c: color 
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color

        this.dy = 0;
        this.jumpForce = 15;
        this.originalHeight = height

        // JumpTimer, if the key Space or W hold longer than will add more force to the jump
        this.jumpTimer = 0

        // Add a variable to detect if the player box touch the ground or not
        this.grounded = false
    }

    // Function ANIMATE to create a drop down effect of the player box 
    Animate(){
        // Animtate the JUMP fucntion with the SPACE or W key
        if (keys['Space'] || keys['KeyW'])
        {   console.log("jump")
            this.Jump();
        } else {
            this.jumpTimer = 0
        }

        // Animate the Crouching function of the player box
        if (keys['KeyS'] || keys['ShiftLeft']){
            this.height = this.originalHeight / 2
        } else {
            this.height = this.originalHeight
        }

        this.y += this.dy

        // Condition to calculate the distance of the box's spawn to the ground
        if (this.y + this.height < canvas.height){
            this.dy += gravity
            this.grounded = false
        } else {
            this.dy = 0 
            this.grounded = true
            this.y = canvas.height - this.height
        }


        this.Draw()
    }

    Jump(){
        if(this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1
            this.dy = -this.jumpForce
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15 ){
            this.jumpTimer += 1
            this.dy = -this.jumpForce - (this.jumpTimer / 50)
        }
    }

    // DRAW FUNCTION TO DRAW THE PLAYER'S MODEL
    Draw (){
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.closePath()
    }
}

// Create class Obstacles
class Obstacle {
    constructor(x, y, width, height, color){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color

        this.dx = -gameSpeed
    }

    Update(){
        this.x += this.dx
        this.Draw()
        this.dx = -gameSpeed
    }

    Draw (){
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.closePath()
    }
}

// Class Text to display score, highscore etc
class Text {
    constructor(text, x, y, align, color, size){
        this.text = text
        this.x = x
        this.y = y
        this.align = align
        this.color = color
        this.size = size
    }

    Draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.font = this.size + "px sans-serif"
        ctx.textAlign = this.align
        ctx.fillText(this.text, this.x, this.y)
        ctx.closePath()
    }
}

// Spawn obstacles
function SpawnObstacle(){
    let size = RandomInt(20, 70)
    let type = RandomInt(0, 1)
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, "#2484E4")

    if(type == 1){
        obstacle.y -= player.originalHeight - 10
    }
    obstacles.push(obstacle)
}

SpawnObstacle()

function RandomInt(min, max){
    return Math.round(Math.random() * (max -min) + min)
}

// Start function to set the score and the set position for the player to run
function Start(){

    ctx.font = "20px san-serif"

    gameSpeed = 3;
    gravity = 1;

    score = 0;
    highscore = 0;

    player = new Player(25, 0, 50, 50, "#FF5858")
    
    scoreText = new Text("Score: " + score, 25, 25, "left", "#212121")
    highscoreText = new Text ("Highscore: " +  highscore, canvas.width - 25, 25, "right", "#212121", "20")

    requestAnimationFrame(Update);
}

let initialSpawnTimer = 200
let spawnTimer = initialSpawnTimer

function Update(){
    requestAnimationFrame(Update)
    // Have to clear the old player box each time the new player box is rendered
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    spawnTimer--
    if(spawnTimer <= 0){
        SpawnObstacle()
        console.log(obstacles)
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if(spawnTimer < 60){
            spawnTimer = 60
        }
    }

    for(let i = 0; i < obstacles.length; i++){
        let o = obstacles[i];

        // If to remove the obstacles if it passed the player box
        if(o.x + o.width < 0){
            obstacles.splice(i, 1)
        }

        if(player.x < o.x + o.width && 
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y) {

            obstacles = []
            score = 0
            spawnTimer = initialSpawnTimer
            gameSpeed = 3
            window.localStorage.setItem('highscore', highscore)
        }

        o.Update()
    }

    player.Animate()

    // GameSpeed, make the game faster each time the box pass an obstacles
    gameSpeed += 0.003

    // Increasing the score constantly
    score++
    scoreText.text = "Score: " + score
    scoreText.Draw()
    highscoreText.Draw()

    // Save the highscore
    if(score > highscore){
        highscore = score
        highscoreText.text = "Highscore: " + highscore

        // Save the highscore to the localstorage of the Chrome console
        window.localStorage.setItem('highscore', highscore)
    }
  
}

Start()

