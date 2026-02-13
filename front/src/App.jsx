import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Count from "./Count";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Achat from "./Achat";
import Stock from "./Stock";
import Client from "./Client";
import List_stock from "./List_stock";
import Achat_parj from "./Achat_parj";
import Achat_parm from "./Achat_parm";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}></Route>

        <Route path="/login" element={<Login />}></Route>

        <Route path="/dashboard" element={<Dashboard />}></Route>

        <Route path="/" element={<Dashboard />}>
          <Route path="/client" element={<Client />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/achat" element={<Achat />} />
          <Route path="/list_stock" element={<List_stock />} />
          <Route path="/achat_parj" element={<Achat_parj />} />
          <Route path="/achat_parm" element={<Achat_parm />} />
        </Route>

        <Route path="/count" element={<Count />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
