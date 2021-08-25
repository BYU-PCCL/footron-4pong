/**
 * Modified code from Steven Lambert (@straker) from CodePen
 * https://codepen.io/straker/pen/VazMaL
 * Used under MIT Licensing
 * 
 * Pong code taken from http://codegolf.stackexchange.com/questions/10713/pong-in-the-shortest-code
 * to demonstrate responsive canvas
 */


/**
 * TODO
 *  - async so you can pause for a couple seconds?
 *  - make code more efficient
 *  - manage disconnects
 *  - make controls better (colors? correct words? etc)
 *  - fix building the paddles (sometimes there's 2 of each and it looks bad)
 *  - Timer + countdown for timer (overall timer, countdown till you have to leave? etc)
 *  - fix controls logic
 */
/**
 * Later
 *  - Use images instead of drawing the paddles? 
 *  -- https://stackoverflow.com/questions/3057162/moving-an-image-across-a-html-canvas
 */

/**
 * Done
 *  - 
 *
 */

messaging = new FootronMessaging.Messaging();
messaging.mount();
messaging.setLock(4);

windowSize = window.innerHeight * .75;
wallSize = windowSize;
modifier = wallSize / 640;

class Player {
    constructor(name, connection){
        this.startState = false;
        this.startButton = false;
        this.lives = 3;
        this.name = name;
        this.connection = connection;
        this.moveState = 1;
        this.paddlePos = wallSize/2;
        this.paddleVel = 0;

    }

    isAlive(){
        return this.lives > 0;
    }

    displayLives(){
        var color = "";
        document.getElementById(this.name).textContent = this.lives;
        if(this.startState && !roundStarted){
            color = "#4ef542";
        } else {
            if(this.isAlive()){
                color = "white";
            } else {
                color = "black";
            }
            
            
        }
        document.getElementById(this.name).style.color = color;
    }
    
    moveHandler(message){
        this.moveState = message;
        this.startButton = message == 3 ? true : false; 
    }
    

    paddleMovement(){
        this.paddlePos += this.paddleVel;
        // wall stop
        this.paddlePos = this.paddlePos < 0 ? 0 : this.paddlePos;
        this.paddlePos = this.paddlePos > wallSize - 100 * modifier ? wallSize - 100 * modifier : this.paddlePos;
    }

    paddlePhysics(){
        this.paddleVel = 
            this.moveState == 0 ? -moveSpd :
            this.moveState == 1 ? 0 :
            this.moveState == 2 ? moveSpd :
            this.paddleVel; 
    }

    translateMoveState(){
        if(this.name == "left" || this.name == "right"){
            move1 = "up";
            move2 = "down";
        } else if(this.name == "up" || this.name == "down"){
            move1 = "left";
            move2 = "right";
        }
        return this.moveState == 0 ? move1 : this.moveState == 1 ? "stop" : this.moveState == 2 ? move2 : "error";
        
    }

    resetPosition(){
        this.paddlePos = 270 * modifier;
        this.paddleVel = 0;
        this.startState = false;
    }

    
}
let availablePlayers = ["left", "right", "up", "down"];
const playerMap = new Map();
activePlayers = [];

function messageHandler(jmsg){
    playerMap.get(jmsg.player).moveHandler(jmsg.movement);
}
    
async function connectionHandler(connection){
    console.log(connection.getId());
    // console.log(`roundStarted: ${roundStarted}`);
    if(availablePlayers.length > 0 && !gameStarted){
        ballX = ballY = 270 * modifier;
        ballVX = Math.abs(ballVX)
        const nextPlayer = availablePlayers.shift();
        connection.addLifecycleListener((paused) => paused || connection.sendMessage({player: nextPlayer}));
        await connection.accept();
        playerMap.set(nextPlayer, new Player(nextPlayer, connection));
        console.log(`connected player: ${nextPlayer}`);
        activePlayers.push(playerMap.get(nextPlayer));

        connection.addCloseListener(() => closeHandler(connection));

        resetPositions();

    }
     else {
        connection.deny();
        console.log("Too many connections???");
    }
}

function closeHandler(connection){
    // if we want the existing game to continue:
    newList = [];
    activePlayers.forEach(player => {
        if(connection.getId() != player.connection.getId()){
            newList.push(player);
        } else {
            console.log(`Player disconnected: ${player.name}`);
            player.lives = 0;
            player.displayLives()
            availablePlayers.push(player.name);
            playerMap.delete(player.name);
        }
    })
    // is this a hacky way to delete the player from the active players?
    activePlayers = newList;
    // should the game just be over? should the game just start over?
    // reopen lock?

    winCondition();

}

messaging.addMessageListener(messageHandler);
messaging.addConnectionListener(connectionHandler);

context = document.getElementById('c').getContext('2d');
document.getElementById('c').width = wallSize;
document.getElementById('c').height = wallSize;
context.fillStyle = "#FFF";
context.font = "60px monospace";
paused = true;
// resetPositions();
ballX = getRandomArbitrary(wallSize * .3, wallSize * .7);
ballY = getRandomArbitrary(wallSize * .3, wallSize * .7);
ballVX = 5;
ballVY = 5;
if (ballX > wallSize/2) ballVX = - ballVX;
if (ballY > wallSize/2) ballVY = - ballVY;
// ballVX = -1 * getRandomArbitrary(4,8) * modifier; 
// ballVY = 1 * getRandomArbitrary(4,8) * modifier;




moveSpd = 9 * modifier;
winner = "";
auto = false;
gameStarted = false;
roundStarted = false;
gameMode = "multi";
gameOver = false;


const interval = setInterval(function () {
    // if(playerMap.get("left")){
    //     console.log(playerMap.get("left").moveState)
    // }
    buildLines();
    buildBall();
    buildPaddles();
    displayLives();
    controls();
    if(winner == ""){
        if (!checkStart() && !auto){
            roundStarted = false;
            if ( availablePlayers.length != 4) return;
        } 
        else {
            if(!roundStarted){
                if(activePlayers.length == 1){
                    gameMode = "single";
                } else {
                    gameMode = "multi";
                }
            }
            messaging.setLock(true);
            roundStarted = true;
            gameStarted = true;
        }
        context.clearRect(0, 0, wallSize, wallSize);
        
        // dashed lines
        buildLines();

        // Paddle movement logic
        activePlayers.forEach(player => {
            player.paddleMovement();
        })
        
        
        // Ball physics
        ballX += ballVX; 
        ballY += ballVY;


        // autoplay
        // autoplay();
        // crazymode();
        
        // Scoring
        lifeTracking();

        // Bouncing
        bouncing();    

        // Display Lives
        displayLives();

        // Build paddles + ball
        buildPaddles();
        winCondition();

        
        
    } else {
        // clearInterval(interval);
        context.beginPath();
        context.fillStyle = "white";
        context.fillText("Winner is: " + winner, 100 * modifier,200 * modifier);
        context.fillText("Thanks for Playing!", 170 * modifier,300 * modifier);
        context.closePath();
        endGame();
        clearInterval(interval);
    }
    context.beginPath();
    context.fillStyle = "white";
    context.closePath();
    buildBall();

    // display ball location
    context.fillText(Math.floor(ballX) + "," + Math.floor(ballY), 340 * modifier, 550 * modifier);
    
    // display speed
    // context.fillText(Math.floor(ballVX) + "," + Math.floor(ballVY), 400 * modifier, 610 * modifier);
    
    // for timer
    // publishEndTime();
}, 16) // Speed 15

const delay = ms => new Promise(res => setTimeout(res, ms));

function bouncing(){
    lBounce = rBounce = uBounce = dBounce = false;
    if(playerMap.get("left")){
        if(playerMap.get("left").isAlive()){
        }
    } else {
        lBounce = true;
    }
    if(playerMap.get("right")){
        if(playerMap.get("right").isAlive()){
        }
    } else {
        rBounce = true;
    }
    if(playerMap.get("up")){
        if(playerMap.get("up").isAlive()){
        }
    } else {
        uBounce = true;
    }
    if(playerMap.get("down")){
        if(playerMap.get("down").isAlive()){
        }
    } else {
        dBounce = true;
    }
    
    if(lBounce){
        if (ballX <= 0) {
            ballX = 0; 
            ballVX = -ballVX;
        }
    } else {
        // TODO
        // paddleBounce(){
        //     if(this.name == "left" || this.name == "right"){
        //         if(ballX <= this.val1 * modifier && ballX >= this.val2 * modifier && ballY < this.paddlePos + 110 * modifier && ballY > this.paddlePos - 10 * modifier){
        //             ballVX = -ballVX + (0.05 * this.sideMod); 
        //             ballVY += (ballY - this.paddlePos - 45 * modifier) / 20;
        //         }
        //     }
        // }
        if (ballX <= 40 * modifier && ballX >= 20 * modifier && ballY < playerMap.get("left").paddlePos + 110 * modifier && ballY > playerMap.get("left").paddlePos - 10 * modifier) {
            ballVX = -ballVX + 0.05; 
            ballVY += (ballY - playerMap.get("left").paddlePos - 45 * modifier) / 20;
        }
    }
    
    if(rBounce){
        if (ballX >= wallSize - 10) {
            ballX = wallSize - 10; 
            ballVX =-ballVX;
        }
    } else {
        if (ballX <= 610 * modifier && ballX >= 590 * modifier && ballY < playerMap.get("right").paddlePos + 110 * modifier && ballY > playerMap.get("right").paddlePos - 10 * modifier) {
            ballVX = -ballVX - 0.05; 
            ballVY += (ballY - playerMap.get("right").paddlePos - 45 * modifier) / 20;
        }
    }

    if(uBounce){
        if (ballY <= 0) {
            ballY = 0; 
            ballVY = -ballVY;
        }
    } else {
        if (ballY <= 40 * modifier && ballY >= 20 * modifier && ballX < playerMap.get("up").paddlePos + 110 * modifier && ballX > playerMap.get("up").paddlePos - 10 * modifier) {
            ballVY = -ballVY + 0.05; 
            ballVX += (ballX - playerMap.get("up").paddlePos - 45 * modifier) / 20;
        }
    }

    if(dBounce){
        if (ballY >= wallSize - 10) {
            ballY = wallSize - 10; 
            ballVY = -ballVY;
        }
    } else {
        if (ballY <= 610 * modifier && ballY >= 590 * modifier && ballX < playerMap.get("down").paddlePos + 110 * modifier && ballX > playerMap.get("down").paddlePos - 10 * modifier) {
            ballVY = -ballVY - 0.05; 
            ballVX += (ballX - playerMap.get("down").paddlePos - 45 * modifier) / 20;
        }
    }
    
    
    
}

function buildBall(){
    context.beginPath();
    context.fillStyle = "white";
    context.fillRect(ballX, ballY, 10 * modifier, 10 * modifier);
    context.closePath();
}

function buildLines(){
    context.beginPath();
    context.fillStyle = "white";
    for (lineCounter = 5; lineCounter < wallSize; lineCounter += 20)
        context.fillRect(wallSize/2, lineCounter, 4, 10);

    for (lineCounter = 5; lineCounter < wallSize; lineCounter += 20)
        context.fillRect(lineCounter , wallSize/2, 10, 4);
        
    context.closePath();
}

function buildPaddles(){
    if(playerMap.get("left")){
        if(playerMap.get("left").isAlive()){
            context.beginPath();
            context.fillStyle = "#6166ff"; // blue
            context.fillRect(20 * modifier, playerMap.get("left").paddlePos, 20 * modifier, 100 * modifier);
            context.closePath();
        }
    }
    if(playerMap.get("right")){
        if(playerMap.get("right").isAlive()){
            context.beginPath();
            context.fillStyle = "#3de364"; // green
            context.fillRect(600 * modifier, playerMap.get("right").paddlePos, 20 * modifier, 100 * modifier);
            context.closePath();
        }
    }
    if(playerMap.get("up")){
        if(playerMap.get("up").isAlive()){
            context.beginPath();
            context.fillStyle = "#ff6161"; // red
            context.fillRect(playerMap.get("up").paddlePos, 20 * modifier, 100 * modifier, 20 * modifier);
            context.closePath();
        }
    }
    if(playerMap.get("down")){
        if(playerMap.get("down").isAlive()){
            context.beginPath();
            context.fillStyle = "#fffc61"; // yellow
            context.fillRect(playerMap.get("down").paddlePos, 600 * modifier, 100 * modifier, 20 * modifier);
            context.closePath();
        }
    }
}

function checkStart(){
    if(activePlayers.length > 0){

        return activePlayers.every(player => {return player.startState});
    } else {
        return false;
    }
}

function controls(){
    activePlayers.forEach(player => {
        player.paddlePhysics();
        if(player.startButton){
            player.startState = true;
            player.startButton = false;
            console.log(`Ready: " ${player.name}`);
        }

    });
    
}

function displayLives(){
    activePlayers.forEach(player => {
        player.displayLives();
    })
    
}

async function endGame(){
    await delay(5000)
    messaging.setLock(false);
    console.log("lock released");
    // console.log("it worked");

}

// TODO
function lifeTracking(){
    activePlayers.forEach(player => {
        if(player.isAlive()){
            if(player.name == "left"){
                if (ballX < -10 * modifier) {
                    player.lives--; 
                    if(player.isAlive()){
                        resetBall("left"); // TODO change this somehow to "player.name"
                        resetPositions();
                    }
                }
            } else if (player.name == "right"){
                if (ballX > 630 * modifier) {
                    player.lives--; 
                    if(player.isAlive()){
                        resetBall("right");
                        resetPositions();
                    }
                }
            } else if (player.name == "up"){
                if (ballY < -10 * modifier) {
                    player.lives--; 
                    if(player.isAlive()){
                        resetBall("up");
                        resetPositions();
                    }
                }
            } else if (player.name == "down"){
                if (ballY > 630 * modifier) {
                    player.lives--; 
                
                    if(player.isAlive()){
                        resetBall("up");
                        resetPositions();
                    }
                }
            }
        }
    });
}

// TODO
function publishEndTime(){
    if (gameOver) {
        if (winner = ""){
            gameOver = false;
        } else {
            return;
        }
    }

    let endTime;
    // TODO fix when you know what increment it is (seconds, miliseconds)
    if(winner = ""){
        endTime = (Date.now() / 1000) + 10000;
    } else {
        gameOver = true;
        endTime = (Date.now() / 1000) + 100;
    }
    
    fetch('http://localhost:8000/current', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"id": "pong4", "end_time": Math.floor(endTime)}), // change pong4 to 4pong sometime
    })
}

function resetBall(player = ""){
    if(player == ""){
        ballX = wallSize/2; 
        ballY = wallSize/2;
        // make this random velocity
        ballVX = ballVY = 5;
    } else if(player == "left"){
        ballX = wallSize * .1; 
        ballY = wallSize/2;
        ballVX = 5;
        ballVY = ballVY >= 0 ? 5 : -5;
    } else if (player == "right"){
        ballX = wallSize * .9; 
        ballY = wallSize/2; 
        ballVX = -5; 
        ballVY = ballVY >= 0 ? 5 : -5;
    } else if (player == "up"){
        ballX = wallSize/2; 
        ballY = wallSize * .1; 
        ballVY = 5; 
        ballVX = ballVX >= 0 ? 5 : -5;
    } else if (player == "down"){
        ballX = wallSize/2; 
        ballY = wallSize * .9; 
        ballVY = -5; 
        ballVX = ballVX >= 0 ? 5 : -5;
    }
}

function resetPositions(){
    paused = true;
    activePlayers.forEach(player => {
        player.resetPosition();
        player.startState = false;
    });
}

function winCondition(){
    if(roundStarted){
        // if (activePlayers.length > 1){
        if (gameMode == "multi"){
            oneAlive = false;
            moreAlive = false;
            activePlayers.forEach(player => {
                if(player.isAlive()){
                    if(winner != ""){
                        moreAlive = true;
                    } else {
                        winner = player.name;
                    }
                }
            })
            if(moreAlive){
                winner = "";
            } else {
                roundStarted = false;
                activePlayers.forEach(player => {
                    player.startState = false;
                })
            }
        } else if (gameMode = "single"){
            if (!activePlayers[0].isAlive()){
                winner = activePlayers[0].name;
                activePlayers[0].startState = false;
                roundStarted = false;
            }
        }
    }
    
    

    
}    
    
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}    

function autoplay(){
    auto = true;
    range = 25
        // && ballVX > 0 TODO: fix this for scaling
        if(paddleYL + 50 - range < ballY && paddleYL + 50 + range > ballY){
            paddleVL = 0;
        } else 
        if(paddleYL + 50 + range >= ballY){
            paddleVL = -moveSpd;
        } else if (paddleYL + 50 - range <= ballY){
            paddleVL = moveSpd;
        }

        if(paddleYR + 50 - range < ballY && paddleYR + 50 + range > ballY){
            paddleVR = 0;
        } else 
        if (paddleYR + 80 > ballY){
            paddleVR = -moveSpd;
        } else if(paddleYR + 20 <= ballY){
            paddleVR = moveSpd;
        }

        if(paddleXU + 50 - range < ballX && paddleXU + 50 + range > ballX){
            paddleVU = 0;
        } else 
        if(paddleXU + 50 + range >= ballX){
            paddleVU = -moveSpd;
        } else if (paddleXU + 50 - range <= ballX){
            paddleVU = moveSpd;
        }

        if(paddleXD + 50 - range < ballX && paddleXD + 50 + range > ballX){
            paddleVD = 0;
        } else 
        if (paddleXD + 80 > ballX){
            paddleVD = -moveSpd;
        } else if(paddleXD + 20 <= ballX){
            paddleVD = moveSpd;
        }

        // go back to center of wall
        // if(ballVX > 0){
        //     if(paddleYL + 50 - 25 < wallSize/2 && paddleYL + 50 + 25 > wallSize/2){
        //         paddleVL = 0;
        //     } else if(paddleYL + 50 - 40 > wallSize/2){
        //         paddleVL = -5;
        //     } else if(paddleYL + 50 + 40 < wallSize/2){
        //         paddleVL = 5
        //     }
        // } 
}

function crazymode(){
    auto = true;
    paddleYL = paddleYR = ballY - (50 * modifier);
    paddleXU = paddleXD = ballX - 50 * modifier;
}