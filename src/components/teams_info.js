/**
 * @author Philip Van Raalte
 * @date 2017-08-23.
 */
import React, { Component } from "react";
import { Card } from "semantic-ui-react";
import _ from "lodash";

import {
  calculateTeamOverall,
  calculateTeamTeamwork,
  calculateTeamOffense,
  calculateTeamDefence,
  calculateTeamGoaltending
} from "../data/stats";

class TeamsInfo extends Component {
  render() {
    let teamsInfo = [];
    const teams = _.isEmpty(this.props.teams)
      ? []
      : _.sortBy(
          this.props.teams,
          [
            function(t) {
              return -calculateTeamOverall(t);
            }
          ],
          "abbreviation"
        );

    teams.map(function(t) {
      let playersInfo = [];
      t.players.map(function(p) {
        playersInfo.push(
          <div>
            {p.name} - {p.position}
          </div>
        );
      });
      teamsInfo.push(
        <Card as="a" href={`team/${t.abbreviation}`}>
          <Card.Content>
            <Card.Header>{t.teamName}</Card.Header>
            <Card.Description>Abbreviation: {t.abbreviation}</Card.Description>
            <Card.Meta>
              {calculateTeamOverall(t)} - Overall
              <br />
              {calculateTeamOffense(t)} - Offense
              <br />
              {calculateTeamDefence(t)} - Defence
              <br />
              {calculateTeamGoaltending(t)} - Goaltending
              <br />
              {calculateTeamTeamwork(t)} - Teamwork
            </Card.Meta>
          </Card.Content>
        </Card>
      );
    });

    return <Card.Group itemsPerRow={3}>{teamsInfo}</Card.Group>;
  }
}

export default TeamsInfo;
