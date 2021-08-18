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
 *  - stop connections when game has started
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

    isAlive(){
        return this.lives > 0;
    }

    displayLives(){
        if(this.isAlive()){
            document.getElementById(this.name).textContent = this.lives;
            if(this.startState && !roundStarted){
                document.getElementById(this.name).style.color = 'green';
            } else {
                document.getElementById(this.name).style.color = 'white';
            }
        }
    }
}

function setZLives(player, num){
    player.setLives(num);
}

moveL = moveR = moveU = moveD = "stop";
activeList = [];
lStart = rStart = uStart = dStart = false;
lStartButton = rStartButton = uStartButton = dStartButton = false;

// function messageHandler(left, right, up, down){
// each json message should be in this format:
// player: (left/right/up/down), movement: (left/right/up/down)
function messageHandler(jmsg){
    if(jmsg.player == "left"){
        moveL = jmsg.movement == 0 ? "up" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "down" : moveL;
        // TODO: THIS IS BAD PLS FIX
        playerMap.get("left").startButton = jmsg.movement == 3 ? true : false; 
    } else if(jmsg.player == "right"){
        moveR = jmsg.movement == 0 ? "up" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "down" : moveR;
        playerMap.get("right").startButton = jmsg.movement == 3 ? true : false; 
    } else if(jmsg.player == "up"){
        moveU = jmsg.movement == 0 ? "left" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "right" : moveU;
        playerMap.get("up").startButton = jmsg.movement == 3 ? true : false; 
    } else if(jmsg.player == "down"){
        moveD = jmsg.movement == 0 ? "left" : jmsg.movement == 1 ? "stop" : jmsg.movement == 2 ? "right" : moveD;
        playerMap.get("down").startButton = jmsg.movement == 3 ? true : false; 
    }

}
let availablePlayers = ["left", "right", "up", "down"];
const playerMap = new Map();    
async function connectionHandler(connection){
    console.log(connection.getId());
    if(availablePlayers.length > 0){
        const newPlayer = availablePlayers.shift();
        connection.addLifecycleListener((paused) => paused || connection.sendMessage({player: newPlayer}));
        await connection.accept();
        playerMap.set(newPlayer, new Player(newPlayer, connection));
        // connection.sendMessage({player: availablePlayers[0]});
        console.log(`connected player: ${newPlayer}`);
        activeList.push(playerMap.get(newPlayer));
        resetPositions();
    }
     else {
        connection.deny();
        console.log("Too many connections???");
    }
}

function checkStart(player){
    // console.log(`player.startState: ${player.startState}`);
    if(!player.isAlive()) return true;
    return player.startState;
}

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
winner = "";
auto = false;
gameStarted = false;
roundStarted = false;


setInterval(function () {
    // activeList.forEach(player => {
    //     console.log(`${player.name}: online`);
    // })
    // console.log(moveL);
    buildLines();
    buildPaddles();
    displayLives();
    controls();
    if(winner == ""){
        if (!activeList.every(checkStart) && paused && !auto){
            roundStarted = false;
            return;
        } 
        else {
            // gameStarted = true;
            roundStarted = true;
        }
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
                activeList.forEach(player => {player.setLives(3);
                });
                // livesL = livesR = livesU = livesD = 3;
            resetPositions();
            winner = "";
            buildPaddles();
            }
        } else {
            activeList.forEach(player => {player.setLives(3);
            });
            // livesL = livesR = livesU = livesD = 3;
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
            context.fillText("Winner is: " + winner, 100 * modifier, 200 * modifier);
            context.closePath();
        }
        // location
        // context.fillText(Math.floor(ballX) + "," + Math.floor(ballY), 340 * modifier, 550 * modifier);
        
        // speed
        context.fillText(Math.floor(ballVX) + "," + Math.floor(ballVY), 400 * modifier, 610 * modifier);
    
    
}, 16) // Speed 15

// controls

// foomsg

function controls(){
    paddleVL = moveL == "up" ? -moveSpd : moveL == "down" ? moveSpd : moveL == "stop" ? 0 : paddleVL; 
    paddleVR = moveR == "up" ? -moveSpd : moveR == "down" ? moveSpd : moveR == "stop" ? 0 : paddleVR;
    paddleVU = moveU == "right" ? moveSpd : moveU == "left" ? -moveSpd : moveU == "stop" ? 0 : paddleVR;
    paddleVD = moveD == "right" ? moveSpd : moveD == "left" ? -moveSpd : moveD == "stop" ? 0 : paddleVD;
    
    activeList.forEach(player => {
        if(player.startButton){
            player.startState = true;
            player.startButton = false;
            console.log(`Ready: " ${player.name}`);
        }

    });
    
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

function resetPositions(){
    paused = true;
    paddleYL = paddleYR = paddleXU = paddleXD= 270 * modifier;
    paddleVL = paddleVR = paddleVU = paddleVD = 0;
    activeList.forEach(player => {
        player.startState = false;
    })
    // restart = false;
}

function bouncing(){
    lBounce = rBounce = uBounce = dBounce = false;
    if(playerMap.get("left")){
        if(playerMap.get("left").lives > 0){
        }
    } else {
        lBounce = true;
    }
    if(playerMap.get("right")){
        if(playerMap.get("right").lives > 0){
        }
    } else {
        rBounce = true;
    }
    if(playerMap.get("up")){
        if(playerMap.get("up").lives > 0){
        }
    } else {
        uBounce = true;
    }
    if(playerMap.get("down")){
        if(playerMap.get("down").lives > 0){
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
        if (ballX <= 40 * modifier && ballX >= 20 * modifier && ballY < paddleYL + 110 * modifier && ballY > paddleYL - 10 * modifier) {
            ballVX = -ballVX + 0.05; 
            ballVY += (ballY - paddleYL - 45 * modifier) / 20;
        }
    }
    
    if(rBounce){
        if (ballX >= wallSize - 10) {
            ballX = wallSize - 10; 
            ballVX =-ballVX;
        }
    } else {
        if (ballX <= 610 * modifier && ballX >= 590 * modifier && ballY < paddleYR + 110 * modifier && ballY > paddleYR - 10 * modifier) {
            ballVX = -ballVX - 0.05; 
            ballVY += (ballY - paddleYR - 45 * modifier) / 20;
        }
    }

    if(uBounce){
        if (ballY <= 0) {
            ballY = 0; 
            ballVY = -ballVY;
        }
    } else {
        if (ballY <= 40 * modifier && ballY >= 20 * modifier && ballX < paddleXU + 110 * modifier && ballX > paddleXU - 10 * modifier) {
            ballVY = -ballVY + 0.05; 
            ballVX += (ballX - paddleXU - 45 * modifier) / 20;
        }
    }

    if(dBounce){
        if (ballY >= wallSize - 10) {
            ballY = wallSize - 10; 
            ballVY = -ballVY;
        }
    } else {
        if (ballY <= 610 * modifier && ballY >= 590 * modifier && ballX < paddleXD + 110 * modifier && ballX > paddleXD - 10 * modifier) {
            ballVY = -ballVY - 0.05; 
            ballVX += (ballX - paddleXD - 45 * modifier) / 20;
        }
    }
    
    
    
}

// function bouncing(){
//     activeList.forEach(player => {
//         if(player.isAlive()){
//             if(player.name == "left"){
//                 if (ballX <= 40 * modifier && ballX >= 20 * modifier && ballY < paddleYL + 110 * modifier && ballY > paddleYL - 10 * modifier) {
//                     ballVX = -ballVX + 0.05; 
//                     ballVY += (ballY - paddleYL - 45 * modifier) / 20;
//                 } else if (ballX <= 0) {
//                     ballX = 0; 
//                     ballVX = -ballVX;
//                 }
//             } else if (player.name == "right") {
//                 if (ballX <= 610 * modifier && ballX >= 590 * modifier && ballY < paddleYR + 110 * modifier && ballY > paddleYR - 10 * modifier) {
//                     ballVX = -ballVX - 0.05; 
//                     ballVY += (ballY - paddleYR - 45 * modifier) / 20;
//                 } else if (ballX >= wallSize - 10) {
//                     ballX = wallSize - 10; 
//                     ballVX =-ballVX;
//                 }
//             } else if (player.name == "up"){
//                 if (ballY <= 40 * modifier && ballY >= 20 * modifier && ballX < paddleXU + 110 * modifier && ballX > paddleXU - 10 * modifier) {
//                     ballVY = -ballVY + 0.05; 
//                     ballVX += (ballX - paddleXU - 45 * modifier) / 20;
//                 } else if (ballY <= 0) {
//                     ballY = 0; 
//                     ballVY = -ballVY;
//                 }
//             } else if (player.name == "down"){
//                 if (ballY <= 610 * modifier && ballY >= 590 * modifier && ballX < paddleXD + 110 * modifier && ballX > paddleXD - 10 * modifier) {
//                     ballVY = -ballVY - 0.05; 
//                     ballVX += (ballX - paddleXD - 45 * modifier) / 20;
//                 } else if (ballY >= wallSize - 10) {
//                     ballY = wallSize - 10; 
//                     ballVY = -ballVY;
//                 }
//             }
//         }
//     })
//     if (ballX <= 0) {
//         ballX = 0; 
//         ballVX = -ballVX;
//     }
//     if (ballX >= wallSize - 10) {
//         ballX = wallSize - 10; 
//         ballVX =-ballVX;
//     }
//     if (ballY <= 0) {
//         ballY = 0; 
//         ballVY = -ballVY;
//     }
//     if (ballY >= wallSize - 10) {
//         ballY = wallSize - 10; 
//         ballVY = -ballVY;
//     }
//     // availablePlayers.forEach(playerName => {
//     //     if(playerName == "left"){
//     //         if (ballX <= 0) {
//     //             ballX = 0; 
//     //             ballVX = -ballVX;
//     //         }
//     //     } else if (playerName == "right") {
//     //         if (ballX >= wallSize - 10) {
//     //             ballX = wallSize - 10; 
//     //             ballVX =-ballVX;
//     //         }
//     //     } else if (playerName == "up"){
//     //         if (ballY <= 0) {
//     //             ballY = 0; 
//     //             ballVY = -ballVY;
//     //         }
//     //     } else if (playerName == "down"){
//     //         if (ballY >= wallSize - 10) {
//     //             ballY = wallSize - 10; 
//     //             ballVY = -ballVY;
//     //         }
//     //     }
//     // })
// }

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
    activeList.forEach(player => {
        player.displayLives();
    })
    
}

function lifeTracking(){
    activeList.forEach(player => {
        if(player.isAlive()){
            if(player.name == "left"){
                if (ballX < -10 * modifier) {
                    player.lives--; 
                    if(player.isAlive()){
                        ballX = 90; 
                        ballY = wallSize/2;
                        ballVX = 5;
                        ballVY = ballVY >= 0 ? 5 : -5;
                        resetPositions();
                    }
                }
            } else if (player.name == "right"){
                if (ballX > 630 * modifier) {
                    player.lives--; 
                    if(player.isAlive()){
                        ballX = 540; 
                        ballY = wallSize/2; 
                        ballVX = -5; 
                        ballVY = ballVY >= 0 ? 5 : -5;
                        resetPositions();
                    }
                }
            } else if (player.name == "up"){
                if (ballY < -10 * modifier) {
                    player.lives--; 
                    if(player.isAlive()){
                        ballX = wallSize/2; 
                        ballY = 90; 
                        ballVY = 5; 
                        ballVX = ballVX >= 0 ? 5 : -5;
                        resetPositions();
                    }
                }
            } else if (player.name == "down"){
                if (ballY > 630 * modifier) {
                    player.lives--; 
                
                    if(player.isAlive()){
                        ballX = wallSize/2; 
                        ballY = 540; 
                        ballVY = -5; 
                        ballVX = ballVX >= 0 ? 5 : -5;
                        resetPositions();
                    }
                }
            }
        }
    });
}

function winCondition(){
    if (activeList.length > 1){
        oneAlive = false;
        moreAlive = false;
        activeList.forEach(player => {
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
            activeList.forEach(player => {
                player.startState = false;
            })
        }
    } else if (activeList.length == 1){
        if (!activeList[0].isAlive()){
            winner = "L"
            activeList[0].startState = false;
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