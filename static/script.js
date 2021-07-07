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
 *  - URGENT: Fix the bouncing boundaries
 *  - Have border
 *  - Colors?
 *  - implement pauses before restart
 *  - Equalize X and Y movement
 */

/**
 * Done
 *  - Kiosk/Display Mode
 *  - Crazy Miode
 *
 */

wallSize = 1200;
modifier = wallSize / 640;
context = document.getElementById('c').getContext('2d');
document.getElementById('c').width = wallSize;
document.getElementById('c').height = wallSize;
context.fillStyle = "#FFF";
context.font = "60px monospace";
paused = start = 1;
livesL = livesR = livesU = livesD = 3;
resetPositions();
ballX = ballY = wallSize;
ballVX = -5; ballVY = 3;




moveSpd = 10;
aliveL = aliveR = aliveU = aliveD = true;
winner = "";
auto = false;
setInterval(function () {
    if(winner == ""){
        if (paused && !start && winner == "" && !auto) return; 
        start = 0;
        context.clearRect(0, 0, wallSize, wallSize);
        
        // dashed lines
        for (lineCounter = 5; lineCounter < wallSize; lineCounter += 20)
            context.fillRect(wallSize/2, lineCounter, 4, 10);

        for (lineCounter = 5; lineCounter < wallSize; lineCounter += 20)
            context.fillRect(lineCounter , wallSize/2, 10, 4);
            
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
        crazymode();
        
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
        if(!restart){
            context.fillText("Winner is: " + winner, 100 * modifier,200 * modifier);
            delay(6)
            context.fillText("Play Again?", 170 * modifier,300 * modifier);
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
    context.fillRect(ballX, ballY, 10 * modifier, 10 * modifier);
        if(winner != ""){
            context.fillText("Winner is: " + winner, 100 * modifier,200 * modifier);
        }
        // context.fillText(Math.floor(ballX) + "," + Math.floor(ballY), 340 * modifier, 550 * modifier);
        // context.fillText(Math.floor(ballVX) + "," + Math.floor(ballVY), 400 * modifier, 610 * modifier);
    
    
}, 15) // Speed 15

// controls
q = '81';
a = '65';
up = '38';
dwn = '40';
lft = '37'
rght = '39'
w = '87';
e = '69';
s = '83';
d = '68';
space = '32';

lUp = w;
lDown = s;
rUp = up;
rDown = dwn;
uLeft = a;
uRight = d;
dLeft = lft;
dRight = rght;


document.onkeydown = function (event) { 
    keycode = (event || window.event).keyCode; 
    paused = paused ? 0 : keycode == '27' ? 1 : 0; 
    // paddleVL = keycode == lDown ? moveSpd : keycode == lUp ? -moveSpd : paddleVL; 
    // paddleVR = keycode == rDown ? moveSpd : keycode == rUp ? -moveSpd : paddleVR; 
    // paddleVU = keycode == uRight ? moveSpd : keycode == uLeft ? -moveSpd : paddleVU; 
    // paddleVD = keycode == dRight ? moveSpd : keycode == dLeft ? -moveSpd : paddleVD; 
}
document.onkeyup = function (event) { 
    keycode = (event || window.event).keyCode; 
    // paddleVL = keycode == lDown || keycode == lUp ? 0 : paddleVL; 
    // paddleVR = keycode == rUp || keycode == rDown ? 0 : paddleVR; 
    // paddleVU = keycode == uRight || keycode == uLeft ? 0 : paddleVU; 
    // paddleVD = keycode == dLeft || keycode == dRight ? 0 : paddleVD;
    restart = keycode == space;
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
start -> is start of game
ballVX -> ball ballX velocity
ballVY -> ball ballY velocity
paused -> game is waiting (paused)
ballX -> ball ballX
ballY -> ball ballY
*/

function resetPositions(){
    // paused = 1;
    paddleYL = paddleYR = paddleXU = paddleXD= 270 * modifier;
    paddleVL = paddleVR = paddleVU = paddleVD = 0;
}

function bouncing(){
    if(livesL > 0){
        if (ballX <= (40 * modifier && ballX >= 20 * modifier && ballY < paddleYL + 110 * modifier && ballY > paddleYL - 10 * modifier)) {
            ballVX = -ballVX + 0.2; 
            ballVY += (ballY - paddleYL - 45) / 20;
        }
    } else {
        if (ballX <= 0) {
            ballX = 0; 
            ballVX = -ballVX;
        }
    }

    if(livesR > 0){
        if (ballX <= 610 * modifier && ballX >= 590 * modifier && ballY < paddleYR + 110 * modifier && ballY > paddleYR - 10 * modifier) {
            ballVX = -ballVX - 0.2; 
            ballVY += (ballY - paddleYR - 45) / 20;
        }
    } else {
        if (ballX >= wallSize - 10) {
            ballX = wallSize - 10; 
            ballVX =-ballVX;
        }
    }

    if(livesU > 0){
        if (ballY <= 40 * modifier && ballY >= 20 * modifier && ballX < paddleXU + 110 * modifier && ballX > paddleXU - 10 * modifier) {
            ballVY = -ballVY + 0.2; 
            ballVX += (ballX - paddleXU - 45) / 20;
        }
    } else {
        if (ballY <= 0) {
            ballY = 0; 
            ballVY = -ballVY;
        }
    }
    if(livesD > 0){
        if (ballY <= 610 * modifier && ballY >= 590 * modifier && ballX < paddleXD + 110 * modifier && ballX > paddleXD - 10 * modifier) {
            ballVY = -ballVY - 0.2; 
            ballVX += (ballX - paddleXD - 45) / 20;
        }
    } else {
        if (ballY >= wallSize - 10) {
            ballY = wallSize - 10; 
            ballVY = -ballVY;
        }
    }
}

function buildPaddles(){
    if(livesL > 0){
        context.fillRect(20 * modifier, paddleYL, 20 * modifier, 100 * modifier);
    }
    if(livesR > 0){
        context.fillRect(600 * modifier, paddleYR, 20 * modifier, 100 * modifier);
    }
    if(livesU > 0){
        context.fillRect(paddleXU, 20 * modifier, 100 * modifier, 20 * modifier);
    }
    if(livesD > 0){
        context.fillRect(paddleXD, 600 * modifier, 100 * modifier, 20 * modifier);
    }
}

function displayLives(){
    if(livesL > 0){
        context.fillText(livesL, 250 * modifier, 350 * modifier);
    }
    if(livesR > 0){
        context.fillText(livesR, 360 * modifier, 350 * modifier);
    }
    if(livesU > 0){
        context.fillText(livesU, 284 * modifier, 100 * modifier);
    }
    if(livesD > 0){
        context.fillText(livesD, 284 * modifier, 500 * modifier);
    }
    
}

function lifeTracking(){
    if(livesL > 0){
        if (ballX < -10 * modifier) {
            livesL--; 
            if(livesL > 0){
                ballX = 90; 
                ballY = wallSize/2;
                ballVX = 5;
                ballVY = ballVY >= 0 ? 5 : -5;
                resetPositions();
            }
            
        }
    }

    if(livesR > 0){
        if (ballX > 630 * modifier) {
            livesR--; 
            if(livesR > 0){
                ballX = 540; 
                ballY = wallSize/2; 
                ballVX = -5; 
                ballVY = ballVY >= 0 ? 5 : -5;
                resetPositions();
            }
        }
    } 

    if(livesU > 0){
        if (ballY < -10 * modifier) {
            livesU--; 
            if(livesU > 0){
                ballX = wallSize/2; 
                ballY = 90; 
                ballVY = 5; 
                ballVX = ballVX >= 0 ? 5 : -5;
                resetPositions();
            }
        }
    } 

    if(livesD > 0){
        if (ballY > 630 * modifier) {
            livesD--; 
        
            if(livesD > 0){
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
    }

    
}    
    
function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
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