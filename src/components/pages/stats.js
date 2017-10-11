/**
 * @author Philip Van Raalte
 * @date 2017-08-23.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Container, Header, Tab, Button} from 'semantic-ui-react';
import StatsTable from '../stats_table';
import _ from 'lodash';

import {getTeams, saveTeams} from '../../actions';
import {calculatePlayerOverall} from "../../data/stats";

class Stats extends Component {
  constructor(props){
    super(props);

    this.fetchPlayerData = this.fetchPlayerData.bind(this);
    this.players = [];
    this.goalies =[];
    this.state = {
      goalies: [],
      players: [],
      showGoalies: false
    };
  }

  fetchPlayerData(){
    return dispatch => {
      (new Promise((resolve, reject) => {
        resolve(this.props.getTeams());
      })).then(() =>{
        return (new Promise((resolve, reject) => {
          let teams = this.props.teams;

          let teamPlayers = [], players = [];

          for (let i = 0; i < teams.length; i++) {
            teamPlayers = teams[i].players;

            players.push(...teamPlayers.map(
              (p) => {
                return ({
                  ...p,
                  team: teams[i].teamName,
                  overall: calculatePlayerOverall(p)
                });
              }
            ));
          }

          this.setState({
            goalies: _.filter(players, (p) =>{
              return p.position === "Goalie";
            }),
            players: _.filter(players, (p) =>{
              return p.position !== "Goalie";
            })
          });

          console.log("FETCHED PLAYERS");
          resolve();
        }));
      });
    }
  }

  componentDidMount(){
    setTimeout(()=>{
      this.fetchPlayerData()();
    }, 0);
  }

  render(){
    return(
      <Container>
        <Header as="h3" textAlign="center">Statistics</Header>
        <hr/>
        <Button.Group fluid>
          <Button
            color="vk"
            onClick={() => {this.setState({showGoalies: false});}}
          >
            Players
          </Button>
          <Button.Or />
          <Button
            color="teal"
            onClick={() => {this.setState({showGoalies: true});}}
          >
            Goalies
          </Button>
        </Button.Group>
        <StatsTable
          goalies={this.state.showGoalies}
          players={this.state.showGoalies ? this.state.goalies : this.state.players}
        />
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return{
    teams: state.teams
  }
}

export default connect(mapStateToProps, {getTeams, saveTeams})(Stats);