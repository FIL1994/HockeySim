import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import HeaderNav from "./header_nav";
import Home from "./pages/home";
import Team from "./pages/team";
import Standings from "./pages/standings";
import Stats from "./pages/stats";

const App = () => (
  <BrowserRouter>
    <React.Fragment>
      <HeaderNav />
      <section>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/team/:id" component={Team} />
          <Route path="/standings/" component={Standings} />
          <Route path="/stats/" component={Stats} />
        </Switch>
      </section>
    </React.Fragment>
  </BrowserRouter>
);

export default App;
