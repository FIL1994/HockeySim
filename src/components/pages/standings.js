/**
 * @author Philip Van Raalte
 * @date 2017-08-21.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Container, Header, Table} from 'semantic-ui-react';
import _ from 'lodash';

import {getTeams} from '../../actions';

class Standings extends Component {
  constructor(props){
    super(props);

    this.handleSort = this.handleSort.bind(this);
    this.state = {
      teams: [],
      column: "points",
      direction: "ascending"
    };

    this.props.getTeams();
  }

  componentWillMount(){

  }

  handleSort(clickedColumn) {
    const {column, direction} = this.state;
    let newDirection = direction;

    if(column !== clickedColumn){
      newDirection = "ascending";
    }
    else{
      newDirection = direction === "ascending" ? "descending" : "ascending";
    }

    this.setState({
      column: clickedColumn,
      direction: newDirection
    });
  }

  sortTeams({teamsInfo, column, direction}){
    let row;

    function directionAbbreviated(d) {
      return direction === "ascending" ? "asc" : "desc";
    }

    switch (column){
      case "points":
        row = (t) => { return -t.teamPoints;};
        break;
      case "gp":
        row = (t) => { return -t.gamesPlayed;};
        break;
      case "wins":
        row = (t) => { return -t.wins;};
        break;
      case "losses":
        row = (t) => { return -t.losses;};
        break;
      case "ot":
        row = (t) => { return -t.ot;};
        break;
      case "abbreviation":
        row = "abbreviation";
        break;
      case "name" :
        row = "teamName";
        break;
      case "ga":
        row = (t) => { return -t.ga;};
        break;
      case "gf":
        row = (t) => { return -t.gf;};
        break;
      case "sa":
        row = (t) => { return -t.sa;};
        break;
      case "sf":
        row = (t) => { return -t.sf;};
        break;
      case "so":
        row = (t) => { return -t.so;};
        break;
      case "pim":
        row = (t) => { return -t.pim;};
        break;
    }

    return _.orderBy(teamsInfo,
      [row, "teamName"],
      [directionAbbreviated(direction), "asc"]
    );
  }

  render(){
    const {column, direction} = this.state;
    let teamsInfo, teamStandings, teams = this.props.teams;

    if(!_.isEmpty(teams)){
      teams = _.sortBy(teams,
        [
          (t) => {
            return -((t.points.wins * 2) + t.points.ot)
          },
          "teamName"
        ]
      );
      teamsInfo = teams.map(({abbreviation, points, teamName}, index) => {
        const {wins, losses, ot, ga, gf, pim, sa, sf, so} = points;

        let teamPoints = 0;
        //2 points for win, 1 point for overtime loss
        teamPoints += (wins * 2) + ot;

        return {
          abbreviation,
          teamName,
          wins,
          losses,
          ot,
          teamPoints,
          gamesPlayed: wins+losses,
          ga,
          gf,
          pim,
          sa,
          sf,
          so,
          index
        };
      });

      teamsInfo = this.sortTeams({teamsInfo, column, direction});

      teamStandings = teamsInfo.map(
        (t, index) => {
          return(
            <Table.Row>
              <Table.Cell selectable textAlign="right">
                <a href={`/team/${t.abbreviation}`}>{t.index+1}. {t.teamName}</a>
              </Table.Cell>
              <Table.Cell>{t.abbreviation}</Table.Cell>
              <Table.Cell>{t.teamPoints}</Table.Cell>
              <Table.Cell>{t.gamesPlayed}</Table.Cell>
              <Table.Cell>{t.wins}</Table.Cell>
              <Table.Cell>{t.losses}</Table.Cell>
              <Table.Cell>{t.ot}</Table.Cell>
              <Table.Cell>{t.ga}</Table.Cell>
              <Table.Cell>{t.gf}</Table.Cell>
              <Table.Cell>{t.sa}</Table.Cell>
              <Table.Cell>{t.sf}</Table.Cell>
              <Table.Cell>{t.so}</Table.Cell>
              <Table.Cell>{t.pim}</Table.Cell>
            </Table.Row>
          );
        }
      );
    }

    return(
      <Container>
        <Header as="h3" textAlign="center">Standings</Header>
        <hr/>
        <Table sortable celled selectable striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                textAlign="right"
                sorted={column === 'name' ? direction : null}
                onClick={() => {this.handleSort('name');}}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'abbreviation' ? direction : null}
                onClick={() => {this.handleSort('abbreviation');}}
              >
                Abbr.
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'points' ? direction : null}
                onClick={() => {this.handleSort('points');}}
              >
                Points
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'gp' ? direction: null}
                onClick={() => {this.handleSort('gp');}}
              >
                GP
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'wins' ? direction : null}
                onClick={() => {this.handleSort('wins');}}
              >
                W
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'losses' ? direction : null}
                onClick={() => {this.handleSort('losses');}}
              >
                L
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'ot' ? direction : null}
                onClick={() => {this.handleSort('ot');}}
              >
                OTL
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'ga' ? direction : null}
                onClick={() => {this.handleSort('ga');}}
              >
                GA
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'gf' ? direction : null}
                onClick={() => {this.handleSort('gf');}}
              >
                GF
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'sa' ? direction : null}
                onClick={() => {this.handleSort('sa');}}>
                SA
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'sf' ? direction : null}
                onClick={() => {this.handleSort('sf');}}
              >
                SF
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'so' ? direction : null}
                onClick={() => {this.handleSort('so');}}
              >
                SO
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === 'pim' ? direction : null}
                onClick={() => {this.handleSort('pim');}}
              >
                PIM
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teamStandings}
          </Table.Body>
        </Table>
        <hr/>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return{
    teams: state.teams
  }
}

export default connect(mapStateToProps, {getTeams})(Standings);