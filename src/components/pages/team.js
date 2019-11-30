/**
 * @author Philip Van Raalte
 * @date 2017-08-14.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Header, Segment, Button, Card } from "semantic-ui-react";
import _ from "lodash";

import BigCalendar from "react-big-calendar";
import moment from "moment";
BigCalendar.momentLocalizer(moment);

import { getTeams, getSchedule } from "../../actions";
import {
  calculatePlayerOverall,
  calculateTeamOverall,
  calculateTeamDefence,
  calculateTeamGoaltending,
  calculateTeamOffense,
  calculateTeamTeamwork
} from "../../data/stats";
import { scheduleToEvents } from "../../data/generate";

class Team extends Component {
  constructor(props) {
    super(props);
    const { id } = this.props.match.params;

    this.state = {
      teamID: id,
      gameSchedule: []
    };
  }

  getTeamsAndSchedule() {
    const p_getTeams = new Promise((resolve, reject) => {
      resolve(this.props.getTeams());
    })
      .then(() => {
        this.props.getSchedule(this.props.teams);
      })
      .then(() => {
        this.setState({
          gameSchedule: scheduleToEvents(this.props.schedule, this.state.teamID)
        });
      });
  }

  componentWillMount() {
    // this.props.getTeams();
    this.getTeamsAndSchedule();
  }

  render() {
    let team,
      teamInfo = <div>loading...</div>,
      playersInfo = [];
    try {
      team = _.find(this.props.teams, t => {
        return t.abbreviation === this.props.match.params.id;
      });
      console.log("Team", team);
    } catch (e) {}

    if (!_.isEmpty(team)) {
      const players = _.sortBy(team.players, [
        p => {
          switch (p.position) {
            case "Winger":
              return 0;
            case "Defence":
              return 1;
            case "Goalie":
              return 2;
            default:
              return 3;
          }
        },
        p => {
          return -calculatePlayerOverall(p);
        }
      ]);

      players.map(p => {
        playersInfo.push(
          <Card>
            <Card.Content>
              <Card.Header className="small">{p.name}</Card.Header>
              <Card.Description>{p.position}</Card.Description>
              <Card.Meta>{calculatePlayerOverall(p)}</Card.Meta>
            </Card.Content>
          </Card>
        );
      });

      teamInfo = (
        <div>
          <Segment textAlign="center">
            <Header textAlign="center" as="h2">
              {team.teamName}
            </Header>
            {team.abbreviation}
            <br />
            {calculateTeamOverall(team)} - Overall
            <br />
            {calculateTeamOffense(team)} - Offense
            <br />
            {calculateTeamDefence(team)} - Defence
            <br />
            {calculateTeamGoaltending(team)} - Goaltending
            <br />
            {calculateTeamTeamwork(team)} - Teamwork
          </Segment>
          <Card.Group itemsPerRow={4}>{playersInfo}</Card.Group>
        </div>
      );
    }

    return (
      <Container>
        <br />
        {teamInfo}
        <hr />
        <BigCalendar
          selectable
          onSelectEvent={event => {
            console.log("SELECTED EVENT", event);
          }}
          onSelectSlot={slotInfo => {
            console.log("SELECTED SLOT", slotInfo);
          }}
          events={
            this.state.gameSchedule
            //scheduleToEvents(this.state.sched)
          }
          defaultDate={
            moment()
              .year(1970)
              .month(0)
              .date(1)
              .toDate()
            // new Date(2015, 3, 1)
          }
          style={
            //will not display without height
            {
              height: 500
            }
          }
        />
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    teams: state.teams,
    schedule: state.schedule
  };
}

export default connect(mapStateToProps, { getTeams, getSchedule })(Team);
