import React, { useEffect } from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Game } from "./Game";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { RoomEntry } from "./RoomEntry";
import { CssBaseline, IconButton, ThemeProvider, Tooltip } from "@material-ui/core";
import { darkTheme, lightTheme } from "./theme";
import { Brightness4, Brightness7, Link } from "@material-ui/icons";

const themeMediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

export function App() {
  const [theme, setTheme] = React.useState(themeMediaQuery?.matches ? darkTheme : lightTheme);
  const [copyText, setCopyText] = React.useState("Copy link");

  function changeTheme() {
    if (theme === lightTheme) {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyText("Copied to clipboard!");
    } catch (e) {
      setCopyText("Error! Please copy URL manually.");
    }

    await new Promise((r) => setTimeout(r, 2000));
    setCopyText("Copy link");
  }

  useEffect(() => {
    function changeHandler(e: MediaQueryListEvent) {
      setTheme(e.matches ? darkTheme : lightTheme);
    }

    themeMediaQuery.addEventListener("change", changeHandler);
    return () => themeMediaQuery.removeEventListener("change", changeHandler);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <Container maxWidth="md">
        <Box py={4} display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h3">Old Mex Online</Typography>

          <Box marginLeft={2}>
            <Tooltip title={copyText}>
              <IconButton onClick={copyLink}>
                <Link />
              </IconButton>
            </Tooltip>
          </Box>
          <Box marginLeft={0}>
            <Tooltip title="Change Theme">
              <IconButton onClick={changeTheme}>
                {theme === lightTheme ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box>
          <BrowserRouter>
            <Switch>
              <Route path="/:roomName">
                <Game />
              </Route>
              <Route path="/">
                <RoomEntry />
              </Route>
            </Switch>
          </BrowserRouter>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
