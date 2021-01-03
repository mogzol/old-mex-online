import React, { useEffect, useState } from "react";
import { Box, BoxProps, colors, makeStyles, Theme } from "@material-ui/core";
import clsx from "clsx";

interface Props extends BoxProps {
  value: number;
  size: number;
  random?: boolean;
  rollAnimation?: number;
}

const useStyles = makeStyles<Theme, Props>({
  die: {
    display: "grid",
    gridTemplateColumns: "repeat(3, auto)",
    gridTemplateRows: "repeat(3, auto)",
    alignContent: "space-evenly",
    justifyContent: "space-evenly",
    background: "white",
    height: (props) => props.size,
    width: (props) => props.size,
    border: "2px solid gray",
    borderColor: colors.grey[600],
    borderRadius: "13%",
    padding: (props) => props.size / 8,
  },
  flippedDie: {
    direction: "rtl",
  },
  rotatedDie: {
    gridAutoFlow: "column",
  },
  dot: {
    flexBasis: "33%",
    borderRadius: "100%",
    width: (props) => Math.floor(props.size / 5.5),
    height: (props) => Math.floor(props.size / 5.5),
  },
  visibleDot: {
    background: "black",
  },
  rollingDie: {
    opacity: 0.8,
    animationName: "$shake",
    animationDuration: "0.8s",
    transformOrigin: "50% 50%",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
    animationDirection: "alternate",
  },
  rollingDieAlt: {
    animationDirection: "alternate-reverse",
  },
  "@keyframes shake": {
    "0%": {
      transform: "translate(2px, 1px) rotate(0deg)",
    },
    "10%": {
      transform: "translate(-1px, -2px) rotate(-1deg)",
    },
    "20%": {
      transform: "translate(-3px, 0px) rotate(1deg)",
    },
    "30%": {
      transform: "translate(0px, 2px) rotate(0deg)",
    },
    "40%": {
      transform: "translate(1px, -1px) rotate(1deg)",
    },
    "50%": {
      transform: "translate(-1px, 2px) rotate(-1deg)",
    },
    "60%": {
      transform: "translate(-3px, 1px) rotate(0deg)",
    },
    "70%": {
      transform: "translate(2px, 1px) rotate(-1deg)",
    },
    "80%": {
      transform: "translate(-1px, -1px) rotate(1deg)",
    },
    "90%": {
      transform: "translate(2px, 2px) rotate(0deg)",
    },
    "100%": {
      transform: "translate(1px, -2px) rotate(-1deg)",
    },
  },
});

export function Dice(props: Props) {
  const classes = useStyles(props);

  const [randomValue, setRandomValue] = useState(1);

  useEffect(() => {
    if (props.random) {
      const handle = setInterval(() => {
        setRandomValue(Math.floor(Math.random() * 6) + 1);
      }, 50);

      return () => clearInterval(handle);
    }
  }, [props.random]);

  const value = props.random ? randomValue : props.value;

  return (
    <Box
      className={clsx(classes.die, {
        [classes.rollingDie]: props.rollAnimation,
        [classes.rollingDieAlt]: props.rollAnimation && props.rollAnimation % 2,

        // While random is happening, rotate the die randomly to make it look better
        [classes.rotatedDie]: props.random && Math.random() < 0.5,
        [classes.flippedDie]: props.random && Math.random() < 0.5,
      })}
      {...props}
    >
      <div className={clsx(classes.dot, { [classes.visibleDot]: value > 3 })} />
      <div className={classes.dot} />
      <div className={clsx(classes.dot, { [classes.visibleDot]: value > 1 })} />
      <div className={clsx(classes.dot, { [classes.visibleDot]: value > 5 })} />
      <div className={clsx(classes.dot, { [classes.visibleDot]: value % 2 })} />
      <div className={clsx(classes.dot, { [classes.visibleDot]: value > 5 })} />
      <div className={clsx(classes.dot, { [classes.visibleDot]: value > 1 })} />
      <div className={classes.dot} />
      <div className={clsx(classes.dot, { [classes.visibleDot]: value > 3 })} />
    </Box>
  );
}
