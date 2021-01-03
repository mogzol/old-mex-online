import React from "react";
import { Box, Card, createStyles, makeStyles, Theme, Typography } from "@material-ui/core";
import { GameData } from "./Game";
import clsx from "clsx";
import { Dice } from "./Dice";

interface Props {
  gameData: GameData | undefined;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      background: theme.palette.type !== "dark" ? theme.palette.grey[200] : theme.palette.grey[700],
      padding: theme.spacing(1),
      "&.active": {
        background:
          theme.palette.type !== "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
      },
      "&.rolled": {
        background:
          theme.palette.type !== "dark" ? theme.palette.grey[400] : theme.palette.grey[900],
      },
      "&:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
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
          className={clsx(classes.card, { active: p.rolling, rolled: p.roll && !p.rolling })}
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
