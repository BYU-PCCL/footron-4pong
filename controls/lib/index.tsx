/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useCallback, useState } from "react";
import { useMessaging } from "@footron/controls-client";
import Button from "@material-ui/core/Button";

const blue = '#6166ff';
const green = '#3de364';
const red = "#ff6161";
const yellow = "#fffc61";

const buttonStyle = css`
  #name {
    text-align: center;
    font-size: 40px;
  }
  #start {
    margin: auto;
  }
  Button {
    width: 50%;
    border: 1px solid black;
    font-weight: bolder;
    font-size: 150%;
  }
`;

function getButton1Name(name:(string | undefined)){
  return (name === "left" ? "Up" :
      name === "right" ? "Up" :
          name === "up" ? "Left" :
              name === "down" ? "Left" :
                  "1")
}
function getButton2Name(name:(string | undefined)){
  return (name === "left" ? "Down" :
      name === "right" ? "Down" :
          name === "up" ? "Right" :
              name === "down" ? "Right" :
                  "2")
}
function getButtonColor(name:(string | undefined)){
  return (name === "left" ? blue :
      name === "right" ? green :
          name === "up" ? red :
              name === "down" ? yellow :
                  "black")
}
function getButtonTextColor(name:(string | undefined)){
  return (name === "down" ? "black" : "whitesmoke")
}


const ControlsComponent = (): JSX.Element => {
  const [playerName, setPlayerName] = useState<string | undefined>();

  const { sendMessage } = useMessaging<{ player: string }>((message) => {
    setPlayerName(message.player);
  });

  const update = useCallback(
    async (movement) => {
      if (!playerName) return;
      await sendMessage({ player: playerName, movement: movement });
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
    update(3);
  }

  return (
    <div css={buttonStyle}>
      <div
          id={"name"}
          // style={{color: getButtonColor(playerName)}}
      >{playerName || "unknown"}</div>
      <Button
          type="button"
          disableRipple
          id={"start"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getButtonColor(playerName),
            color: getButtonTextColor(playerName),
          }}
          onTouchEnd={start}>
        Start
      </Button>

      <div>
        <Button
          type="button"
          disableRipple
          id={"right"}
          size={"large"}
          onTouchStart={up}
          onTouchEnd={stop}
          style={{
            backgroundColor: getButtonColor(playerName),
            color: getButtonTextColor(playerName),
            height: "400px",
            fontSize: "300%",

          }}
        >
          {getButton1Name(playerName)}
        </Button>
        <Button
          type="button"
          disableRipple
          id={"left"}
          onTouchStart={down}
          onTouchEnd={stop}
          style={{
            backgroundColor: getButtonColor(playerName),
            color: getButtonTextColor(playerName),
            height: "400px",
            fontSize: "300%",
          }}
        >
          {getButton2Name(playerName)}
        </Button>
      </div>
    </div>
  );
};

export default ControlsComponent;
