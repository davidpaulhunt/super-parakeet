import React from 'react';
import {
  GeistProvider,
  CssBaseline,
} from "@geist-ui/react";
import './App.css';
import Ants from "./Ants";

function App() {
  

  return (
    <GeistProvider>
      <CssBaseline />

      <div className="App">
        <Ants />
      </div>
    </GeistProvider>
  );
}

export default App;
