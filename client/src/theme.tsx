import { createMuiTheme, ThemeOptions } from "@material-ui/core/styles";
import { green, orange } from "@material-ui/core/colors";

const common: ThemeOptions = {
  palette: {
    primary: green,
    secondary: orange,
  },
};

// A custom theme for this app
export const lightTheme = createMuiTheme({
  ...common,
  palette: {
    ...common.palette,
    type: "light",
  },
});

export const darkTheme = createMuiTheme({
  ...common,
  palette: {
    ...common.palette,
    type: "dark",
  },
});
