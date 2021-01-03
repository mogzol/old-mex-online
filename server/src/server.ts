import WebSocket from "ws";
import dotenv from "dotenv";
import log, { LogLevelDesc } from "loglevel";
import prefix from "loglevel-plugin-prefix";
import { Game } from "./Game";
import chalk, { Chalk } from "chalk";

dotenv.config();

const LOG_LEVEL = (process.env.LOG_LEVEL || "info") as LogLevelDesc;
const LOG_COLORS: Record<string, Chalk> = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(log);
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${LOG_COLORS[level.toUpperCase()](level)}`;
  },
});

log.setLevel((process.env.LOG_LEVEL || "info") as LogLevelDesc);
log.debug("Using log level:", LOG_LEVEL);

const wss = new WebSocket.Server({
  port: Number(process.env.port) || 8080,
});

const games = new Map<string, Game>();

function handleDestroyGame(game: Game) {
  log.info("Deleted game:", game.name);
  games.delete(game.name);
}

interface MessageData {
  type: "join" | "roll" | "stay" | "reset";
  room: string;
  name?: string;
}

wss.on("connection", (ws, req) => {
  log.debug("New connection");

  ws.on("message", (data: string) => {
    const json = JSON.parse(data) as MessageData;

    log.debug("message", json);

    const room = json.room;

    if (!games.has(room)) {
      games.set(room, new Game(room, handleDestroyGame));
    }

    const game = games.get(room);

    switch (json.type) {
      case "join":
        game.addPlayer(json.name, ws);
        break;
      case "roll":
        game.roll(ws);
        break;
      case "stay":
        game.stay(ws);
        break;
      case "reset":
        game.reset();
        break;
    }
  });
});

log.info("Server running");
