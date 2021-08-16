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
 *  - confirm start from all players?
 *  - async so you can pause for a couple seconds?
 *  - make code more efficient
 */

/**
 * Done
 *  - Colors
 *
 */

messaging = new FootronMessaging.Messaging();
messaging.mount();

messaging.setLock(4);

class Player {
    constructor(name, connection){
        this.alive = true;
        this.startState = false;
        this.startButton = false;
        this.lives = 3;
        this.name = name;
        this.connection = connection;
        if(name == "left" || name == "right"){
            this.move1 = "up";
            this.move2 = "down";
        } else if(name == "up" || name == "down"){
            this.move1 = "up";
            this.move2 = "down";
        }
    }
}

moveL = moveR = moveU = moveD = "stop";
activeList = [];
lStart = rStart = uStart = dStart = false;
lStartButton = rStartButton = uStartButton = dStartButton = false;

// function messageHandler(left, right, up, down){
// each json message should be in this format:
// player: (left/right/up/down), movement: (left/right/up/down)
function messageHandler(jmsg){
    if(jmsg.player == "Left"){
        moveL = jmsg.movement == 0 ? "up" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "down" : moveL;
        lStartButton = jmsg.movement == 3 ? true : false;
    } else if(jmsg.player == "Right"){
        moveR = jmsg.movement == 0 ? "up" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "down" : moveR;
        rStartButton = jmsg.movement == 3 ? true : false;
    } else if(jmsg.player == "Up"){
        moveU = jmsg.movement == 0 ? "left" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "right" : moveU;
        uStartButton = jmsg.movement == 3 ? true : false;
    } else if(jmsg.player == "Down"){
        moveD = jmsg.movement == 0 ? "left" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "right" : moveD;
        dStartButton = jmsg.movement == 3 ? true : false;
    }

}
let availablePlayers = ["left", "right", "up", "down"]
const playerMap = new Map();    
// playerMap.set("left", null); // left
// playerMap.set("right", null); // right
// playerMap.set("up", null); // up
// playerMap.set("down", null); // down
async function connectionHandler(connection){
    console.log(connection.getId())
    if(availablePlayers.length > 0){
        await connection.accept();
        player.set(availablePlayers[0], new Player(availablePlayers[0]));
        console.log(`connected player: ${availablePlayers[0]}`);
        activeList.push(availablePlayers.shift())
    }
    
    // if(playerMap.get("left") == null){
    //     await connection.accept();
    //     playerMap.set("left", new Player("left", connection));
    //     connection.sendMessage({player: "Left"});
    //     activeList.push("left");
    //     console.log("left connected");

    // } else if(playerMap.get("right") == null){
    //     await connection.accept();
    //     playerMap.set("right", connection);
    //     connection.sendMessage({player: "Right"});
    //     activeList.push("right");
    //     console.log("right connected");

    // } else if(playerMap.get("up") == null){
    //     await connection.accept();
    //     playerMap.set("up", connection);
    //     connection.sendMessage({player: "Up"});
    //     activeList.push("up");
    //     console.log("up connected");

    // } else if(playerMap.get("down") == null){
    //     await connection.accept();
    //     playerMap.set("down", connection);
    //     connection.sendMessage({player: "Down"});
    //     activeList.push("down");
    //     console.log("down connected");
        
    // }
     else {
        connection.deny();
        console.log("Too many connections???")
    }
}

function checkStart(val){
    return val.startState;
}
// probably need 4 messageListeners
// or 1 message that is fed in from 4 connections

// this.messageHandler = this.messageHandler.bind(this);

messaging.addMessageListener(messageHandler);

messaging.addConnectionListener(connectionHandler);


windowSize = window.innerHeight * .75;
wallSize = windowSize;
modifier = wallSize / 640;
context = document.getElementById('c').getContext('2d');
document.getElementById('c').width = wallSize;
document.getElementById('c').height = wallSize;
context.fillStyle = "#FFF";
context.font = "60px monospace";
paused = true;
livesL = livesR = livesU = livesD = 3;
resetPositions();
ballX = getRandomArbitrary(wallSize * .2, wallSize * .8);
ballY = getRandomArbitrary(wallSize * .2, wallSize * .8);
ballVX = 7 * modifier; 
ballVY = 7 * modifier;
if (ballX > wallSize/2){
    ballVX = - ballVX;
} 
if (ballY > wallSize/2){
    ballVY = - ballVY;
} 
// ballVX = -1 * getRandomArbitrary(4,8) * modifier; 
// ballVY = 1 * getRandomArbitrary(4,8) * modifier;




moveSpd = 10 * modifier;
aliveL = aliveR = aliveU = aliveD = true;
winner = "";
auto = false;


setInterval(function () {
    console.log(moveL);
    buildLines();
    buildPaddles();
    displayLives();
    controls();
    if(winner == ""){
        if (!activeList.every(checkStart) && paused && !auto && activeList.length > 0) return; 
        context.clearRect(0, 0, wallSize, wallSize);
        
        // dashed lines
        buildLines();

        // Paddle movement logic
        paddleYL += paddleVL; 
        paddleYR += paddleVR;
        paddleXU += paddleVU; 
        paddleXD += paddleVD;
        
        // stopping paddle at wall logic
        paddleYL = paddleYL < 0 ? 0 : paddleYL; 
        paddleYL = paddleYL > wallSize - 100 * modifier ? wallSize - 100 * modifier : paddleYL;
        
        paddleYR = paddleYR < 0 ? 0 : paddleYR; 
        paddleYR = paddleYR > wallSize - 100 * modifier ? wallSize - 100 * modifier : paddleYR;

        paddleXU = paddleXU < 0 ? 0 : paddleXU; 
        paddleXU = paddleXU > wallSize - 100 * modifier ? wallSize - 100 * modifier : paddleXU;

        paddleXD = paddleXD < 0 ? 0 : paddleXD; 
        paddleXD = paddleXD > wallSize - 100 * modifier ? wallSize - 100 * modifier : paddleXD;
        
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
        if(!restart()){
            context.beginPath();
            context.fillStyle = "white";
            context.fillText("Winner is: " + winner, 100 * modifier,200 * modifier);
            context.fillText("Play Again?", 170 * modifier,300 * modifier);
            context.closePath();

            if(auto){
                livesL = livesR = livesU = livesD = 3;
            resetPositions();
            winner = "";
            buildPaddles();
            }
        } else {
            livesL = livesR = livesU = livesD = 3;
            resetPositions();
            winner = "";
            buildPaddles();
        }
    }
    context.beginPath();
    context.fillStyle = "white";
    context.closePath();
    context.fillRect(ballX, ballY, 10 * modifier, 10 * modifier);
        if(winner != ""){
            context.beginPath();
            context.fillStyle = "white";
            context.fillText("Winner is: " + winner, 100 * modifier,200 * modifier);
            context.closePath();
        }
        // location
        // context.fillText(Math.floor(ballX) + "," + Math.floor(ballY), 340 * modifier, 550 * modifier);
        
        // speed
        context.fillText(Math.floor(ballVX) + "," + Math.floor(ballVY), 400 * modifier, 610 * modifier);
    
    
}, 15) // Speed 15

// controls

// foomsg

function controls(){
    paddleVL = moveL == "up" ? -moveSpd : moveL == "down" ? moveSpd : moveL == "stop" ? 0 : paddleVL; 
    paddleVR = moveR == "up" ? -moveSpd : moveR == "down" ? moveSpd : moveR == "stop" ? 0 : paddleVR;
    paddleVU = moveU == "right" ? moveSpd : moveU == "left" ? -moveSpd : moveU == "stop" ? 0 : paddleVR;
    paddleVD = moveD == "right" ? moveSpd : moveD == "left" ? -moveSpd : moveD == "stop" ? 0 : paddleVD;
    
    // if(
    //     moveL != "stop" ||
    //     moveR != "stop" ||
    //     moveU != "stop" ||
    //     moveD != "stop"
    //     ){
    //         console.log("not paused");
    //         paused = false;
    //     } else {
    //         console.log("uhh");
    //     }
    // }
    if(lStartButton == true){
        lStart = true;
        lStartButton == false;
        console.log("START");
    }
    if(rStartButton == true){
        rStart = true;
        rStartButton == false;
    }
    if(uStartButton == true){
        uStart = true;
        uStartButton == false;
    }
    if(dStartButton == true){
        dStart = true;
        dStartButton == false;
    }
    


}

/* Variable index:
livesL -> left player score
livesR -> right player score
context -> context
event -> event
lineCounter -> counter for dashed line
keycode -> keycode
paddleYL -> left paddle ballY
paddleYR -> right paddle ballY
paddleVL -> left paddle ballY velocity
paddleVR -> right paddle ballY velocity
ballVX -> ball ballX velocity
ballVY -> ball ballY velocity
paused -> game is waiting (paused)
ballX -> ball ballX
ballY -> ball ballY
*/

function buildLines(){
    context.beginPath();
    context.fillStyle = "white";
    for (lineCounter = 5; lineCounter < wallSize; lineCounter += 20)
        context.fillRect(wallSize/2, lineCounter, 4, 10);

    for (lineCounter = 5; lineCounter < wallSize; lineCounter += 20)
        context.fillRect(lineCounter , wallSize/2, 10, 4);
        
    context.closePath();
}

function resetPositions(){
    paused = true;
    paddleYL = paddleYR = paddleXU = paddleXD= 270 * modifier;
    paddleVL = paddleVR = paddleVU = paddleVD = 0;
    // restart = false;
}

function bouncing(){
    if(livesL > 0 && playerMap.get("left") != null){
        if (ballX <= 40 * modifier && ballX >= 20 * modifier && ballY < paddleYL + 110 * modifier && ballY > paddleYL - 10 * modifier) {
            ballVX = -ballVX + 0.05; 
            ballVY += (ballY - paddleYL - 45 * modifier) / 20;
        }
    } else {
        if (ballX <= 0) {
            ballX = 0; 
            ballVX = -ballVX;
        }
    }

    if(livesR > 0 && playerMap.get("right") != null){
        if (ballX <= 610 * modifier && ballX >= 590 * modifier && ballY < paddleYR + 110 * modifier && ballY > paddleYR - 10 * modifier) {
            ballVX = -ballVX - 0.05; 
            ballVY += (ballY - paddleYR - 45 * modifier) / 20;
        }
    } else {
        if (ballX >= wallSize - 10) {
            ballX = wallSize - 10; 
            ballVX =-ballVX;
        }
    }

    if(livesU > 0 && playerMap.get("up") != null){
        if (ballY <= 40 * modifier && ballY >= 20 * modifier && ballX < paddleXU + 110 * modifier && ballX > paddleXU - 10 * modifier) {
            ballVY = -ballVY + 0.05; 
            ballVX += (ballX - paddleXU - 45 * modifier) / 20;
        }
    } else {
        if (ballY <= 0) {
            ballY = 0; 
            ballVY = -ballVY;
        }
    }
    if(livesD > 0 && playerMap.get("down") != null){
        if (ballY <= 610 * modifier && ballY >= 590 * modifier && ballX < paddleXD + 110 * modifier && ballX > paddleXD - 10 * modifier) {
            ballVY = -ballVY - 0.05; 
            ballVX += (ballX - paddleXD - 45 * modifier) / 20;
        }
    } else {
        if (ballY >= wallSize - 10) {
            ballY = wallSize - 10; 
            ballVY = -ballVY;
        }
    }
}

function buildPaddles(){
    if(livesL > 0 && playerMap.get("left") != null){
        context.beginPath();
        context.fillStyle = "#6166ff"; // blue
        context.fillRect(20 * modifier, paddleYL, 20 * modifier, 100 * modifier);
        context.closePath();
    }
    if(livesR > 0 && playerMap.get("right") != null){
        context.beginPath();
        context.fillStyle = "#3de364"; // green
        context.fillRect(600 * modifier, paddleYR, 20 * modifier, 100 * modifier);
    }
    if(livesU > 0 && playerMap.get("up") != null){
        context.beginPath();
        context.fillStyle = "#ff6161"; // red
        context.fillRect(paddleXU, 20 * modifier, 100 * modifier, 20 * modifier);
        context.closePath();
    }
    if(livesD > 0 && playerMap.get("down") != null){
        context.beginPath();
        context.fillStyle = "#fffc61"; // yellow
        context.fillRect(paddleXD, 600 * modifier, 100 * modifier, 20 * modifier);
        context.closePath();
    }
}

function displayLives(){
    if(livesL > 0 && playerMap.get("left") != null){
        document.getElementById("left").textContent = livesL;
        // context.fillText(livesL, 250 * modifier, 350 * modifier);
    }
    if(livesR > 0 && playerMap.get("right") != null){
        document.getElementById("right").textContent = livesR;
        // context.fillText(livesR, 360 * modifier, 350 * modifier);
    // } else{
    //     document.getElementById("right").textContent = "0";
    }
    if(livesU > 0 && playerMap.get("up") != null){
        document.getElementById("up").textContent = livesU;
        // context.fillText(livesU, 284 * modifier, 100 * modifier);
    // } else{
    //     document.getElementById("up").textContent = "0";
    }
    if(livesD > 0 && playerMap.get("down") != null){
        document.getElementById("down").textContent = livesD;
        // context.fillText(livesD, 284 * modifier, 500 * modifier);
    // } else{
    //     document.getElementById("down").textContent = "0";
    }
    
}

function lifeTracking(){
    if(livesL > 0 && playerMap.get("left") != null){
        if (ballX < -10 * modifier) {
            livesL--; 
            if(livesL > 0 && playerMap.get("left") != null){
                ballX = 90; 
                ballY = wallSize/2;
                ballVX = 5;
                ballVY = ballVY >= 0 ? 5 : -5;
                resetPositions();
            }
            
        }
    }

    if(livesR > 0 && playerMap.get("right") != null){
        if (ballX > 630 * modifier) {
            livesR--; 
            if(livesR > 0 && playerMap.get("right") != null){
                ballX = 540; 
                ballY = wallSize/2; 
                ballVX = -5; 
                ballVY = ballVY >= 0 ? 5 : -5;
                resetPositions();
            }
        }
    } 

    if(livesU > 0 && playerMap.get("up") != null){
        if (ballY < -10 * modifier) {
            livesU--; 
            if(livesU > 0 && playerMap.get("up") != null){
                ballX = wallSize/2; 
                ballY = 90; 
                ballVY = 5; 
                ballVX = ballVX >= 0 ? 5 : -5;
                resetPositions();
            }
        }
    } 

    if(livesD > 0 && playerMap.get("down") != null){
        if (ballY > 630 * modifier) {
            livesD--; 
        
            if(livesD > 0 && playerMap.get("down") != null){
                ballX = wallSize/2; 
                ballY = 540; 
                ballVY = -5; 
                ballVX = ballVX >= 0 ? 5 : -5;
                resetPositions();
            }
        }
    }
}

function winCondition(){
    if (activeList.length > 1){
        oneAlive = false;
        moreAlive = false;
        if (livesL > 0){
            winner = "L";
        } 
        if (livesR > 0){
            if(winner != ""){
                moreAlive = true;
            } else {
                winner = "R";
            }
            
        } 
        if (livesU > 0){
            if(winner != ""){
                moreAlive = true;
            } else {
                winner = "U";
            }
            
        } 
        if (livesD > 0){
            if(winner != ""){
                moreAlive = true;
            } else {
                winner = "D";
            }
            
        }
        if(moreAlive){
            winner = "";
        } else {
            lStart = rStart = uStart = dStart = false;
        }
    } else if (activeList.length == 1){
        if (livesL == 0){
            winner = "L"
            lStart = false;
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

function restart(){
    if (activeList.every(checkStart)){
        return true;
    } else {
        return false;
    }
}