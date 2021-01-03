import WebSocket from "ws";
import log from "loglevel";

interface Player {
  name: string;
  roll?: [number, number];
  rollValue?: number;
  rollCount: number;
  rolling: boolean;
  ws: WebSocket;
}

export class Game {
  public readonly name: string;
  private onDestroy: (game: Game) => void;
  private players: Player[] = [];
  private maxRolls: number = 3;
  private lowestRoll: number = 0;
  private roundOver: boolean = false;
  private rolling: boolean = false;

  private _currentRoll: [number, number] = null;
  private currentRollTimestamp: Date = new Date();
  private get currentRoll() {
    return this._currentRoll;
  }

  private set currentRoll(value: [number, number]) {
    this._currentRoll = value;
    this.currentRollTimestamp = new Date();
  }

  constructor(name: string, onDestroy: (game: Game) => void) {
    this.name = name;
    this.onDestroy = onDestroy;
    log.info("Created game:", this.name);
  }

  private update() {
    if (!this.players.length) {
      log.info("Room is now empty, cleaning up");
      this.onDestroy(this);
      return;
    }

    // Make sure it's someone's turn
    if (!this.roundOver && !this.players.some((p) => p.rolling)) {
      const nextPlayer = this.players.find((p) => !p.roll);
      if (!nextPlayer) {
        this.roundOver = true;
      } else {
        nextPlayer.rolling = true;
      }
    }

    log.debug("Sending update for game:", this.name);

    // Remove data from players we don't want sent to client
    const playersData = this.players.map((p) => {
      const { ws, ...data } = p;
      return data;
    });

    for (const player of this.players) {
      player.ws.send(
        JSON.stringify({
          you: player.name,
          name: this.name,
          roundOver: this.roundOver,
          rolling: this.rolling,
          currentRoll: this.currentRoll,
          currentRollTimestamp: this.currentRollTimestamp,
          maxRolls: this.maxRolls,
          lowestRoll: this.lowestRoll,
          players: playersData,
        })
      );
    }
  }

  private findPlayer(ws: WebSocket): [Player, number] {
    const playerIndex = this.players.findIndex((p) => p.ws === ws);
    const player = this.players[playerIndex];

    if (!player) {
      ws.send(JSON.stringify({ error: "You aren't a player in this game!" }));
      return;
    }

    if (!player.rolling) {
      ws.send(JSON.stringify({ error: "Not your turn!" }));
      return;
    }

    return [player, playerIndex];
  }

  private handleStay(player: Player, playerIndex: number, ws: WebSocket) {
    if (!this.currentRoll) {
      ws.send(JSON.stringify({ error: "No current roll." }));
      return;
    }

    player.rolling = false;
    player.roll = this.currentRoll;
    player.rollValue = Number(player.roll.join(""));

    // If first roll of round, set max rolls
    if (this.players.every((p) => !p.roll || p.name === player.name)) {
      this.maxRolls = player.rollCount;
    }

    if (
      !this.lowestRoll ||
      !this.players.some((p) => this.compareRolls(player.rollValue, p.rollValue))
    ) {
      this.lowestRoll = player.rollValue;
    }

    const nextPlayer = this.players[(playerIndex + 1) % this.players.length];

    if (nextPlayer.roll) {
      this.roundOver = true;
    } else {
      nextPlayer.rolling = true;
    }
  }

  public addPlayer(name: string, ws: WebSocket) {
    if (this.players.some((p) => p.name === name)) {
      ws.close(1000, "Player already exists");
      return;
    }

    log.info("Player joined room", { player: name, room: this.name });
    this.players.push({
      ws,
      name,
      rolling: !this.players.length,
      rollCount: 0,
    });

    ws.on("close", () => {
      log.info("Player left room", { player: name, room: this.name });
      this.players = this.players.filter((p) => p.name !== name);
      this.update();
    });

    this.update();
  }

  public async roll(ws: WebSocket) {
    if (this.rolling) {
      return;
    }

    const [player, playerIndex] = this.findPlayer(ws);

    if (!player) {
      return;
    }

    // Start by clearing current roll and setting rolling to true
    this.rolling = true;
    this.currentRoll = null;
    this.update();

    // Wait a bit before sending result
    await new Promise((r) => setTimeout(r, 750 + Math.random() * 1500));

    // Finally send actual roll result
    this.rolling = false;
    this.currentRoll = this.generateRoll();
    player.rollCount++;

    if (player.rollCount >= this.maxRolls) {
      this.handleStay(player, playerIndex, ws);
    }

    this.update();
  }

  public stay(ws: WebSocket) {
    const [player, playerIndex] = this.findPlayer(ws);

    if (!player) {
      return;
    }

    this.handleStay(player, playerIndex, ws);
    this.update();
  }

  public reset() {
    // Find lowest scoring player
    let lowestIndex: number = 0;
    for (const [index, player] of this.players.entries()) {
      // Reset rolling and rollCount (reset roll value later)
      player.rolling = false;
      player.rollCount = 0;

      if (index === 0 || !player.roll) {
        continue;
      }

      if (this.compareRolls(player.rollValue, this.players[lowestIndex].rollValue)) {
        lowestIndex = index;
      }
    }

    this.players[lowestIndex].rolling = true;

    // Reset rolling here because we needed to keep the scores above
    for (const player of this.players) {
      player.roll = null;
    }

    this.lowestRoll = 0;
    this.currentRoll = null;
    this.maxRolls = 3;
    this.roundOver = false;

    this.update();
  }

  /**
   * Generates a roll. The first die will always be equal to or greater than the second.
   */
  private generateRoll(): [number, number] {
    const roll: [number, number] = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    if (roll[0] < roll[1]) {
      const temp = roll[0];
      roll[0] = roll[1];
      roll[1] = temp;
    }

    return roll;
  }

  /**
   * @returns `true` if rollA is less than rollB, `false` otherwise
   */
  private compareRolls(rollA: number, rollB: number) {
    // Handle old mex
    if (rollA === 21) {
      return false;
    }

    // Handle doubles
    if (`${rollA}`[0] === `${rollA}`[1]) {
      if (`${rollB}`[0] === `${rollB}`[1]) {
        return rollA < rollB;
      } else {
        return false;
      }
    } else if (`${rollB}`[0] === `${rollB}`[1]) {
      // Score 2 is a double, but score 1 isn't
      return true;
    }

    return rollA < rollB;
  }
}
