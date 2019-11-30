/**
 * @author Philip Van Raalte
 * @date 2017-08-23.
 */
import React, { Component } from "react";
import { Segment, Table, Tab } from "semantic-ui-react";
import _ from "lodash";

import { calculatePlayerOverall } from "../data/stats";

class StatsTable extends Component {
  constructor(props) {
    super(props);

    this.getPlayers = this.getPlayers.bind(this);
    this.sortPlayers = this.sortPlayers.bind(this);
    this.handleSort = this.handleSort.bind(this);

    this.playerHeadings = [
      { name: "points", label: "Points" },
      { name: "goals", label: "Goals" },
      { name: "assists", label: "Assists" },
      { name: "shots", label: "Shots" },
      { name: "plusMinus", label: "+/-" },
      { name: "pim", label: "PIM" },
      { name: "shootingPercent", label: "S%" }
    ];

    this.goalieHeadings = [
      { name: "sa", label: "SA" },
      { name: "ga", label: "GA" },
      { name: "so", label: "SO" },
      { name: "wins", label: "Wins" },
      { name: "losses", label: "Losses" },
      { name: "savePercent", label: "SV%" }
    ];
    this.players = [];

    this.state = {
      column: "overall",
      direction: "ascending",
      update: true,
      playerStats: []
    };
  }

  handleSort(clickedColumn) {
    const { column, direction } = this.state;
    let newDirection = direction;

    if (column !== clickedColumn) {
      newDirection = "ascending";
    } else {
      newDirection = direction === "ascending" ? "descending" : "ascending";
    }

    this.setState({
      column: clickedColumn,
      direction: newDirection,
      update: true
    });
  }

  sortPlayers({ players, column, direction }) {
    let row;
    direction = direction === "ascending" ? "asc" : "desc";

    switch (column) {
      case "overall":
        row = p => -p.overall;
        break;
      case "points":
        row = ({ stats }) => -(stats.goals + stats.assists);
        break;
      case "goals":
        row = ({ stats }) => -stats.goals;
        break;
      case "assists":
        row = ({ stats }) => -stats.assists;
        break;
      case "shots":
        row = ({ stats }) => -stats.shots;
        break;
      case "plusMinus":
        row = ({ stats }) => -stats.plusMinus;
        break;
      case "pim":
        row = ({ stats }) => -stats.pim;
        break;
      case "sa":
        row = ({ stats }) => -stats.sa;
        break;
      case "ga":
        row = ({ stats }) => -stats.ga;
        break;
      case "so":
        row = ({ stats }) => -stats.so;
        break;
      case "wins":
        row = ({ stats }) => -stats.wins;
        break;
      case "losses":
        row = ({ stats }) => -stats.losses;
        break;
      case "savePercent":
        row = ({ stats }) => -(1 - stats.ga / stats.sa);
        break;
      case "shootingPercent":
        row = ({ stats }) => -(stats.goals / stats.shots);
        break;
      case "position":
        row = "position";
        break;
      case "team":
        row = "team";
        break;
      case "name":
        row = "name";
        break;
      case "id":
        row = p => -p.id;
        break;
      default:
        row = p => -p.overall;
        break;
    }

    return _.orderBy(players, [row], [direction]);
  }

  getPlayers() {
    const { column, direction } = this.state;
    let players = this.props.players;
    let playerStats;

    players = this.sortPlayers({ players, column, direction });

    if (this.props.goalies) {
      playerStats = players.map(p => {
        return (
          <Table.Row>
            <Table.Cell>{p.id}</Table.Cell>
            <Table.Cell>{p.name}</Table.Cell>
            <Table.Cell>{p.position}</Table.Cell>
            <Table.Cell>{p.team}</Table.Cell>
            <Table.Cell>{calculatePlayerOverall(p)}</Table.Cell>
            <Table.Cell>{p.stats.sa}</Table.Cell>
            <Table.Cell>{p.stats.ga}</Table.Cell>
            <Table.Cell>{p.stats.so}</Table.Cell>
            <Table.Cell>{p.stats.wins}</Table.Cell>
            <Table.Cell>{p.stats.losses}</Table.Cell>
            <Table.Cell>
              {_.round(1 - p.stats.ga / p.stats.sa, 3).toFixed(3)}
            </Table.Cell>
          </Table.Row>
        );
      });
    } else {
      playerStats = players.map(p => {
        return (
          <Table.Row>
            <Table.Cell>{p.id}</Table.Cell>
            <Table.Cell>{p.name}</Table.Cell>
            <Table.Cell>{p.position}</Table.Cell>
            <Table.Cell>{p.team}</Table.Cell>
            <Table.Cell>{calculatePlayerOverall(p)}</Table.Cell>
            <Table.Cell>{p.stats.goals + p.stats.assists}</Table.Cell>
            <Table.Cell>{p.stats.goals}</Table.Cell>
            <Table.Cell>{p.stats.assists}</Table.Cell>
            <Table.Cell>{p.stats.shots}</Table.Cell>
            <Table.Cell>{p.stats.plusMinus}</Table.Cell>
            <Table.Cell>{p.stats.pim}</Table.Cell>
            <Table.Cell>
              {_.isNaN(p.stats.goals / p.stats.shots)
                ? "N/A"
                : ((p.stats.goals / p.stats.shots) * 100).toFixed(1)}
            </Table.Cell>
          </Table.Row>
        );
      });
    }

    this.setState({
      playerStats,
      update: false
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (!_.isEqual(nextProps.players, this.props.players)) {
      if (nextState.update !== true) {
        let isSafeField;
        let column = nextState.column;
        if (nextProps.goalies) {
          isSafeField = isGoalieField(column);
        } else {
          isSafeField = isPlayerField(column);
        }

        let mergeState = {};
        if (!isSafeField) {
          mergeState = {
            column: "overall",
            direction: "ascending"
          };
        }

        this.setState(_.merge({ update: true }, mergeState));
      }
    }
    function isPlayerField(column) {
      return !["sa", "ga", "so", "wins", "losses", "savePercent"].includes(
        column
      );
    }
    function isGoalieField(column) {
      return ![
        "goals",
        "assists",
        "shots",
        "plusMinus",
        "pim",
        "points",
        "shootingPercent"
      ].includes(column);
    }
  }

  render() {
    const { column, direction } = this.state;

    if (this.state.update && !_.isEmpty(this.props.players)) {
      this.getPlayers();
    }

    return (
      <Segment loading={this.state.update}>
        <Table sortable celled selectable striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={column === "id" ? direction : null}
                onClick={() => {
                  this.handleSort("id");
                }}
              >
                ID
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "name" ? direction : null}
                onClick={() => {
                  this.handleSort("name");
                }}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "position" ? direction : null}
                onClick={() => {
                  this.handleSort("position");
                }}
              >
                Position
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "team" ? direction : null}
                onClick={() => {
                  this.handleSort("team");
                }}
              >
                Team
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "overall" ? direction : null}
                onClick={() => {
                  this.handleSort("overall");
                }}
              >
                Overall
              </Table.HeaderCell>
              {(this.props.goalies
                ? this.goalieHeadings
                : this.playerHeadings
              ).map(col => {
                return (
                  <Table.HeaderCell
                    sorted={column === col.name ? direction : null}
                    onClick={() => {
                      this.handleSort(col.name);
                    }}
                  >
                    {col.label}
                  </Table.HeaderCell>
                );
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.state.playerStats}</Table.Body>
        </Table>
      </Segment>
    );
  }
}

export default StatsTable;
