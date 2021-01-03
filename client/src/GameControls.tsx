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

  const [roll, setRoll] = useState<[number, number]>(props.gameData?.currentRoll ?? [1, 2]);
  const [showRollingAnimation, setShowRollingAnimation] = useState(false);

  useEffect(() => {
    if (!props.gameData) {
      return;
    }

    const preRolls = props.gameData.preRolls;
    const trueRoll = props.gameData.currentRoll;

    if (!trueRoll) {
      setRoll([1, 2]);
      return;
    }

    setShowRollingAnimation(true);

    const timeouts: number[] = [];
    const delay = 50;

    for (let i = 0; i < preRolls.length; i++) {
      timeouts.push(window.setTimeout(() => setRoll(preRolls[i]), delay * i));
    }

    timeouts.push(
      window.setTimeout(() => {
        setRoll(trueRoll);
        setShowRollingAnimation(false);
      }, delay * preRolls.length)
    );

    return () => timeouts.forEach(window.clearTimeout);
  }, [props.gameData?.currentRollTimestamp]);

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
          {props.gameData?.lowestRoll
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
              rollAnimation={props.rolling || showRollingAnimation ? i + 1 : 0}
            />
          ))}
        </Box>
        <Typography variant="subtitle2" align="center" color="textSecondary">
          Roll {you?.rollCount} of {props.gameData?.maxRolls}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          disabled={!you?.rolling}
          onClick={props.onRoll}
        >
          Roll
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={!you?.rolling || you?.rollCount < 1}
          onClick={props.onStay}
        >
          Stay
        </Button>
      </Box>
    </>
  );
}
