import {
  Box,
  Button,
  Card,
  colors,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { Dice } from "./Dice";
import { GameData } from "./Game";

interface Props {
  gameData: GameData | undefined;
  rolling: boolean;
  onRoll(): void;
  onStay(): void;
  onReset(): void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(0.5),
    },
    diceBox: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      borderRadius: 5,
      borderWidth: 8,
      borderStyle: "solid",
      borderColor: theme.palette.type === "dark" ? colors.grey[900] : colors.brown[700],
      boxShadow:
        theme.palette.type === "dark"
          ? "0 5px 10px #0006, inset 0 0 20px #0008"
          : "0 5px 10px #0006, inset 0 0 20px #0005",
      margin: "auto",
      marginTop: 30,
      marginBottom: 20,
      width: 300,
      height: 200,
      background: colors.green[theme.palette.type === "dark" ? 900 : 600],
    },
  })
);

export function GameControls(props: Props) {
  const classes = useStyles();
  const you = props.gameData?.players.find((p) => p.name === props.gameData?.you);
  const roller = props.gameData?.players.find((p) => p.rolling);
  const roll = props.gameData?.roundOver
    ? `${props.gameData?.lowestRoll}`.split("").map(Number)
    : props.gameData?.currentRoll ?? [1, 2];

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          {props.gameData?.name}
        </Typography>
        <Button
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={!props.gameData?.roundOver}
          onClick={props.onReset}
        >
          New Round
        </Button>
      </Box>

      <Box className={classes.diceBox}>
        <Typography variant="subtitle2" align="center" color="textSecondary">
          {props.gameData?.roundOver
            ? `Round over. ${props.gameData.roundMexicos} Old Mexico${
                props.gameData.roundMexicos === 1 ? "" : "s"
              }.`
            : props.gameData?.lowestRoll
            ? `Must beat ${props.gameData?.lowestRoll} for ${props.gameData?.maxRolls}`
            : "Round start"}
        </Typography>
        <Box display="flex" justifyContent="center">
          {roll.map((v, i) => (
            <Dice
              key={i}
              value={v}
              size={75}
              m={2}
              boxShadow="0 3px 10px #0005"
              random={props.rolling}
              rollAnimation={props.rolling ? i + 1 : 0}
            />
          ))}
        </Box>
        <Typography variant="subtitle2" align="center" color="textSecondary">
          {props.gameData?.roundOver
            ? `Lowest roll: ${props.gameData.lowestRoll}`
            : `Roll ${roller?.rollCount} of ${props.gameData?.maxRolls}`}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          disabled={props.rolling || !you?.rolling}
          onClick={props.onRoll}
        >
          Roll
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={props.rolling || !you?.rolling || you?.rollCount < 1}
          onClick={props.onStay}
        >
          Stay
        </Button>
      </Box>
    </>
  );
}
