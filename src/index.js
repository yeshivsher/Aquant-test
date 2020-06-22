import React from "react"
import ReactDOM from "react-dom"
import { ThemeProvider } from "@material-ui/styles"
import { CssBaseline } from "@material-ui/core"

import App from "./App"
import * as serviceWorker from "./serviceWorker"
import Cesium from "cesium"

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZWNjZTM0NS1kOTZhLTRiMDgtYTJlOS1iNzg0NjcwNjc5ZmYiLCJpZCI6MTI5MjIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODA2Mzg2MTV9.N3Exa5X0Pbfo5aarytfN1rjAmz73zBMByNBV6MZymV4";

ReactDOM.render(
    <App />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
