import {
  Theme,
  Grid,
  Paper,
  Typography,
  makeStyles,
  createStyles,
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { config } from "./config";
import { GameControls } from "./GameControls";
import { PlayerList } from "./PlayerList";

interface Params {
  roomName: string;
}

interface ErrorData {
  error: string;
  reset?: boolean;
}

export interface GameData {
  you: string;
  name: string;
  roundOver: boolean;
  rolling: boolean;
  currentRoll: [number, number];
  currentRollTimestamp: string;
  lowestRoll: number;
  maxRolls: number;
  players: Array<{
    name: string;
    roll?: [number, number];
    rollValue?: number;
    rollCount: number;
    rolling: boolean;
  }>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
    },
  })
);

export function Game() {
  const classes = useStyles();
  const params = useParams<Params>();
  const [playerName, setPlayerName] = useState<string>();
  const [error, setError] = useState<string>();
  const [socket, setSocket] = useState<WebSocket>();
  const [gameData, setGameData] = useState<GameData>();
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (!playerName) {
      return;
    }

    const ws = new WebSocket(config.server);

    ws.addEventListener("open", () =>
      ws.send(
        JSON.stringify({
          type: "join",
          name: playerName,
          room: params.roomName,
        })
      )
    );

    ws.addEventListener("close", (e) => {
      setError(e.reason || "Lost connection");
      setPlayerName(undefined);
    });

    ws.addEventListener("message", (event) => {
      const json: GameData | ErrorData = JSON.parse(event.data);
      console.log(json);

      if ("error" in json) {
        setError(json.error);
        return;
      }

      setSocket(ws);
      setGameData(json);
      setRolling(json.rolling);
    });

    return () => ws.close();
  }, [params.roomName, playerName]);

  function sendAction(type: "roll" | "stay" | "reset") {
    socket?.send(JSON.stringify({ type, room: params.roomName }));
  }

  return (
    <>
      <ErrorDialog error={error} onDismiss={() => setError(undefined)} />
      <PlayerNameDialog open={!error && !playerName} onChange={setPlayerName} />
      <Grid container spacing={2}>
        <Grid item md={7} xs={12}>
          <Paper className={classes.paper}>
            <GameControls
              gameData={gameData}
              rolling={rolling}
              onRoll={() => {
                sendAction("roll");
                setRolling(true);
              }}
              onStay={() => sendAction("stay")}
              onReset={() => sendAction("reset")}
            />
          </Paper>
        </Grid>
        <Grid item md={5} xs={12}>
          <Paper className={classes.paper}>
            <PlayerList gameData={gameData} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

interface ErrorDialogProps {
  error: string | undefined;
  onDismiss(): void;
}

function ErrorDialog(props: ErrorDialogProps) {
  return (
    <Dialog open={Boolean(props.error)} onClose={props.onDismiss}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>{props.error}</DialogContent>
      <DialogActions>
        <Button onClick={props.onDismiss} color="secondary">
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface PlayerNameDialogProps {
  open: boolean;
  onChange(playerName: string): void;
}

function PlayerNameDialog(props: PlayerNameDialogProps) {
  const [name, setName] = React.useState("");

  return (
    <Dialog open={props.open} maxWidth={"xs"} fullWidth>
      <DialogTitle>Enter your name</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Player Name"
          inputProps={{ maxLength: 12 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onChange(name)} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
