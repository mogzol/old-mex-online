import React from "react";
import { Box, Card, colors, createStyles, makeStyles, Theme, Typography } from "@material-ui/core";
import { GameData } from "./Game";
import clsx from "clsx";
import { Dice } from "./Dice";
import { darken } from "@material-ui/core/styles";

interface Props {
  gameData: GameData | undefined;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      background: theme.palette.type !== "dark" ? theme.palette.grey[200] : theme.palette.grey[700],
      padding: theme.spacing(1),
      "&:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
    },
    activeCard: {
      background:
        theme.palette.type !== "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
    },
    rolledCard: {
      background: theme.palette.type !== "dark" ? theme.palette.grey[400] : theme.palette.grey[900],
    },
    lowestCard: {
      background: theme.palette.type !== "dark" ? colors.red[200] : darken(colors.red[400], 0.6),
    },
  })
);

export function PlayerList(props: Props) {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Players
      </Typography>
      {props.gameData?.players.map((p) => (
        <Card
          key={p.name}
          className={clsx(classes.card, {
            [classes.activeCard]: p.rolling,
            [classes.rolledCard]: p.roll && !p.rolling,
            [classes.lowestCard]:
              p.roll && !p.rolling && p.rollValue === props.gameData?.lowestRoll,
          })}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h5">{p.name}</Typography>
              <Typography color="textSecondary">
                {p.rolling ? "Rolling" : p.roll ? "Rolled" : "Waiting"}
              </Typography>
            </div>
            <Box display="flex">
              {p.roll?.map((v, i) => (
                <Dice key={i} value={v} size={45} mx={0.5} />
              ))}
            </Box>
          </Box>
        </Card>
      ))}
    </>
  );
}
