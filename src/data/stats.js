/**
 * @author Philip Van Raalte
 * @date 2017-08-14.
 */
import _ from 'lodash';

export function calculatePlayerOverall (player) {
  let overall = -1, skillsSum = 0;
  const s = player.skills;
  switch(player.position){
    case "Goalie":
      skillsSum += s.aggression + s.breakaway + s.goaltending + s.high + s.low +
        s.speed + s.teamwork;
      overall = skillsSum / 7;
      break;
    default:
      skillsSum += s.aggression + s.defence + s.offense + s.passing + s.shooting +
        s.speed + s.strength + s.teamwork;
      overall = skillsSum / 8;
      break;
  }
  return _.round(overall);
}

export function calculatePlayersOverall(players) {
  let overallSum = 0;
  for (let i = 0; i < players.length; i++) {
    overallSum += calculatePlayerOverall(players[i]);
  }
  return _.round(overallSum / players.length);
}

export function calculateTeamOverall(team) {
  let skillsSum = calculateTeamOffense(team) + calculateTeamDefence(team) + calculateTeamGoaltending(team);
  let overall = skillsSum / 3;
  return _.round(overall);
}

export function calculateTeamTeamwork(team) {
  let overall = -1, teamworkSum = 0;
  team.players.map(function (p) {
    teamworkSum += p.skills.teamwork;
  });
  overall = teamworkSum / team.players.length;
  return _.round(overall);
}

export function calculatePlayersTeamwork(players) {
  let overallSum = 0;
  for (let i = 0; i < players.length; i++) {
    overallSum += players[i].skills.teamwork || 0;
  }
  return _.round(overallSum / players.length);
}

export function calculateTeamAggression(team) {
  let overall = -1, aggressionSum = 0;
  team.players.map(function (p) {
    aggressionSum += p.skills.aggression;
  });
  overall = aggressionSum / team.players.length;
  return _.round(overall);
}

export function calculatePlayersAggression(players) {
  let overallSum = 0;
  for (let i = 0; i < players.length; i++) {
    overallSum += players[i].skills.aggression || 0;
  }
  return _.round(overallSum / players.length);
}

export function calculateTeamOffense(team) {
  let overall = -1, skillsSum = 0;

  const players = _.filter(team.players, function ({position}) {
    return position === "Winger";
  });

  players.map(function (p) {
    skillsSum += calculatePlayerOverall(p);
  });

  overall = skillsSum / players.length;
  return _.round(overall);
}

export function calculatePlayersOffense(players) {
  let overallSum = 0;
  for (let i = 0; i < players.length; i++) {
    overallSum += players[i].skills.offense || 0;
  }
  return _.round(overallSum / players.length);
}

export function calculateTeamDefence(team) {
  let overall = -1, skillsSum = 0;

  const players = _.filter(team.players, function ({position}) {
    return position === "Defence";
  });

  players.map(function (p) {
    skillsSum += calculatePlayerOverall(p);
  });

  overall = skillsSum / players.length;
  return _.round(overall);
}

export function calculateTeamGoaltending(team) {
  let overall = -1, skillsSum = 0;

  const players = _.filter(team.players, function ({position}) {
    return position === "Goalie";
  });

  players.map(function (p) {
    skillsSum += calculatePlayerOverall(p);
  });

  overall = skillsSum / players.length;
  return _.round(overall);
}

export function getTeamWingers(team, sorted = false) {
  let players = _.filter(team.players, function (p) {
    return p.position === "Winger";
  });

  if(sorted){
    players = _.sortBy(players, function (p) {
      return -calculatePlayerOverall(p);
    });
  }

  return players;
}

export function getTeamDefence(team, sorted = false) {
  let players = _.filter(team.players, function (p) {
    return p.position === "Defence";
  });

  if(sorted){
    players = _.sortBy(players, function (p) {
      return -calculatePlayerOverall(p);
    });
  }

  return players;
}

export function getTeamGoalies(team, sorted = false) {
  let players = _.filter(team.players, function (p) {
    return p.position === "Goalie";
  });

  if(sorted){
    players = _.sortBy(players, function (p) {
      return -calculatePlayerOverall(p);
    });
  }

  return players;
}