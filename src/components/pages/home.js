/**
 * @author Philip Van Raalte
 * @date 2017-08-14.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Container,
  Header,
  Segment,
  Button,
  Modal,
  Icon,
  Tab
} from "semantic-ui-react";
import _ from "lodash";
import TeamsInfo from "../teams_info";
import MyCalendar from "../my_calendar";

import BigCalendar from "react-big-calendar";
import moment from "moment";
BigCalendar.momentLocalizer(moment);

import { getTeams, saveTeams, getSchedule, saveSchedule } from "../../actions";
import {
  generateTeams,
  generateSchedule,
  scheduleToEvents
} from "../../data/generate";
import { simGamesToDate } from "../../data/game_sim";

class Home extends Component {
  state = {
    sched: {},
    openModal: false,
    selected: {}
  };

  componentDidMount() {
    this.props.getTeams();
  }

  makeTeams() {
    const p_newTeams = new Promise((resolve, reject) => {
      const newTeams = generateTeams({ teamsCount: 30 });
      resolve(newTeams);
    });

    localStorage.clear();

    setTimeout(() => {
      p_newTeams
        .then(newTeams => {
          this.props.saveTeams(newTeams);
          new Promise((resolve, reject) => {
            const schedule = generateSchedule(newTeams);
            this.setState({
              sched: schedule
            });
            resolve(newTeams);
          });
        })
        .then(() => {
          this.props.getSchedule(this.props.teams);
        });
    }, 0);
  }

  getTeamsAndSchedule() {
    setTimeout(() => {
      const p_getTeams = new Promise((resolve, reject) => {
        resolve(this.props.getTeams());
      }).then(() => {
        this.props.getSchedule(this.props.teams);
      });
    }, 0);
  }

  componentWillMount() {
    this.getTeamsAndSchedule();

    if (_.isEmpty(this.props.teams)) {
      console.log("Generating teams");
    } else {
      console.log("Teams already generated");
    }
  }

  /**
   * Get events for the calendar
   * @returns events for calendar
   */
  getEvents = () => {
    let otherEvents = [];
    return scheduleToEvents(this.props.schedule, otherEvents);
  };

  openModal = () => {
    this.setState({ openModal: true });
  };

  closeModal = () => {
    this.setState({ openModal: false });
  };

  render() {
    //tab panes
    const panes = [
      {
        menuItem: "Teams",
        render: () => {
          return (
            <Tab.Pane attached={false}>
              <TeamsInfo teams={this.props.teams} />
            </Tab.Pane>
          );
        }
      },
      {
        menuItem: "Schedule",
        render: () => {
          return (
            <Tab.Pane>
              <MyCalendar
                now={moment()
                  .year(1970)
                  .month(0)
                  .date(1)
                  .toDate()}
                onSelectEvent={event => {
                  console.log("SELECTED EVENT", event);
                  this.setState({
                    selected: {
                      date: event.start,
                      dateString: moment(event.start).format(
                        "dddd, MMM Do YYYY"
                      )
                    },
                    openModal: true
                  });
                }}
                onSelectSlot={slotInfo => {
                  console.log("SELECTED SLOT", slotInfo);
                  this.setState({
                    selected: {
                      date: slotInfo.start,
                      dateString: moment(slotInfo.start).format(
                        "dddd, MMM Do YYYY"
                      )
                    },
                    openModal: true
                  });
                }}
                events={this.getEvents()}
                defaultDate={
                  moment()
                    .year(1970)
                    .month(0)
                    .date(1)
                    .toDate()
                  // new Date(2015, 3, 1)
                }
              />
            </Tab.Pane>
          );
        }
      }
    ];

    const modalSim = (
      <Modal
        basic
        dimmer="blurring"
        size="tiny"
        open={this.state.openModal}
        close={this.closeModal}
        className="light-background"
      >
        <Modal.Header>
          <Header textAlign="center" color="white" className="whiteText">
            {_.isDate(this.state.selected.date)
              ? `Sim to ${this.state.selected.dateString}?`
              : ""
            // _.isDate(this.state.selected.date) ? this.state.selected.date.toDateString() : ""
            }
          </Header>
        </Modal.Header>
        <Modal.Actions>
          <Container textAlign="center">
            <Button
              inverted
              color="green"
              onClick={() => {
                this.closeModal();
                setTimeout(() => {
                  let p_simGames = new Promise((resolve, reject) => {
                    let teams = this.props.teams;
                    const games = simGamesToDate({
                      schedule: this.props.schedule,
                      endDate: this.state.selected.date,
                      teams
                    });
                    console.log("DONE SIMMING GAMES");
                    resolve(games);
                  })
                    .then(result => {
                      this.props.saveTeams(result.teams);
                    })
                    .then(() => {
                      console.log("Done Saving");
                    });
                }, 0);
              }}
            >
              <Icon name="checkmark" /> Yes
            </Button>
            <Button inverted color="red" onClick={this.closeModal}>
              <Icon name="remove" /> No
            </Button>
          </Container>
        </Modal.Actions>
      </Modal>
    );

    return (
      <Container>
        <Segment textAlign="center" piled>
          <Button.Group inverted>
            <Button color="green" onClick={this.openModal}>
              Show Modal
            </Button>
            <Button
              primary
              onClick={() => {
                console.log("GET TEAMS", this.props.teams);
                this.props.getTeams();
              }}
            >
              Print Teams
            </Button>
            <Button
              color="teal"
              onClick={() => {
                this.makeTeams();
              }}
            >
              New Teams
            </Button>
          </Button.Group>
        </Segment>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            color: "black",
            inverted: false
          }}
          panes={panes}
        />
        {modalSim}
        <br />
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

export default connect(
  mapStateToProps,
  { getTeams, saveTeams, getSchedule, saveSchedule }
)(Home);
