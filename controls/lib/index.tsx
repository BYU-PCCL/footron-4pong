/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, {useCallback, useState} from "react";
import {useMessaging} from "@footron/controls-client";
import Button from '@material-ui/core/Button';

// const containerStyle = css`
//   padding: 16px;
//   overflow-x: hidden;
//
//   p {
//     margin: 0 0 16px;
//   }
// `;

const buttonStyle = css`
  #name {
    text-align: center;
    font-size: 40px;
  }
  #start {
    margin: auto;
  }
  .page-width-inner {
    // width: 100%;
    height: 100%;
    border: 1px solid black;
  }
  Button {
    width:50%;
    height:50%;
    border: 1px solid black;
    color: whitesmoke;
    font-weight: bolder;
    // center: center;
    // background-color: var(--color);
    background-color: #6166ff;
  }
  
`

const blue = css`
  html{
    --color: #6166ff;
  }
  Button {
    background-color: #6166ff;
  }
`
const green = css`
  html{
    --color: #3de364;
  }
  Button {
    background-color: #3de364;
  }
`
const red = css`
  html{
    --color: #ff6161;
  }
  Button {
    background-color: #ff6161;
  }
`
const yellow = css`
  html{
    --color: #fffc61;
  }
  Button {
    background-color: #fffc61;
  }
`

const ControlsComponent = (): JSX.Element => {

    const [playerName, setPlayerName] = useState<string | undefined>();

    const { sendMessage } = useMessaging<{ player: string }>((message) => {
        setPlayerName(message.player)
    });

    const update = useCallback(
        async (movement) => {
            if (!playerName) return;
            await sendMessage({player: playerName, movement: movement});
        },
        [sendMessage, playerName]
    );

    function up() {
        update(0);
    }

    function down() {
        update(2);
    }

    function stop() {
        update(1);
    }

    function start() {
        update(3)
    }

    function stap(){
        // for testing purposes
        return 1 + 1;
    }

    // let PlayerName = ({
    //     // eslint-disable-next-line react/display-name
    //     render: function() {
    //         return <div> {player}! </div>;
    //     }
    // })

    let color = css`
        html {
          
        }
    `

    if(playerName === "left"){
        color = blue;
    } else if(playerName === "right"){
        color = green;
    } else if(playerName === "up"){
        color = red;
    } else if(playerName === "down"){
        color = yellow;
    }
        return (
        <div css={buttonStyle}>
            <div id={"name"}>{playerName || "unknown"}</div>
            <Button type="button" id={"start"} onMouseUp={start}>Start</Button>
            <div>
                <Button type="button" id={"left"} size={"large"} onTouchStart={up} onTouchEnd={stop} >Up</Button>
                <Button type="button" id={"right"} size={"large"}  onTouchStart={down} onTouchEnd={stop} >Down</Button>
            </div>
        </div>

    );
};

export default ControlsComponent;
