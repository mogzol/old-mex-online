import { Box, Button, Paper, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { useHistory } from "react-router";

export function RoomEntry() {
  const [roomName, setRoomName] = useState("");
  const history = useHistory();

  function handleJoin() {
    if (!roomName.length) {
      return;
    }

    history.push(`/${roomName}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleJoin();
    }
  }

  return (
    <Box
      component={Paper}
      maxWidth={500}
      height={160}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-evenly"
      m="auto"
    >
      <TextField
        label="Room Name"
        value={roomName}
        onChange={(event) => setRoomName(event.target.value)}
        inputProps={{ maxLength: 16 }}
        onKeyDown={handleKeyDown}
      />
      <Button variant="contained" color="primary" disabled={!roomName} onClick={handleJoin}>
        Join Room
      </Button>
    </Box>
  );
}
