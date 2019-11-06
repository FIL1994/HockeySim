/**
 * @author Philip Van Raalte
 * @date 2017-08-14.
 */
import _ from "lodash";
import {
  calculatePlayerOverall,
  calculateTeamOverall,
  calculateTeamDefence,
  calculatePlayersOverall,
  calculateTeamOffense,
  getTeamDefence,
  getTeamGoalies,
  getTeamWingers,
  calculatePlayersTeamwork,
  calculatePlayersAggression,
  calculatePlayersOffense
} from "../data/stats";
import { Chance } from "chance";
import moment from "moment";

const CHANCE = new Chance(moment().unix());

export function simGame(team1, team2) {
  let t1Goals,
    t2Goals,
    t1Shots,
    t2Shots,
    t1PenaltyMinutes,
    t2PenaltyMinutes,
    stats = {},
    shifts = [];
  t1Goals = t2Goals = t1Shots = t2Shots = t1PenaltyMinutes = t2PenaltyMinutes = 0;

  //each period
  for (let i = 1; i < 4; i++) {
    const p = `period${i}`; //period
    //12 shifts
    for (let j = 0; j < 12; j++) {
      let t1Line, t2Line;
      t1Line = [
        ...team1.lines[`forward${team1.strategy[p][j].offense + 1}`],
        ...team1.lines[`defence${team1.strategy[p][j].defence + 1}`],
        team1.lines[`goalie${team1.strategy[p][j].goalie + 1}`]
      ];

      t2Line = [
        ...team2.lines[`forward${team2.strategy[p][j].offense + 1}`],
        ...team2.lines[`defence${team2.strategy[p][j].defence + 1}`],
        team2.lines[`goalie${team2.strategy[p][j].goalie + 1}`]
      ];

      let game = simShift(t1Line, t2Line);
      shifts.push(game);
      t1Goals += game.t1Goals;
      t2Goals += game.t2Goals;
      t1Shots += game.t1Chances;
      t2Shots += game.t2Chances;
      t1PenaltyMinutes += game.t1PenaltyMinutes;
      t2PenaltyMinutes += game.t2PenaltyMinutes;

      for (let k = 0; k < game.t1Players.length; k++) {
        for (let l = 0; l < team1.players.length; l++) {
          if (team1.players[l].id === game.t1Players[k].id) {
            team1.players[l] = game.t1Players[k];
            break;
          }
        }
      }
      for (let k = 0; k < game.t2Players.length; k++) {
        for (let l = 0; l < team2.players.length; l++) {
          if (team2.players[l].id === game.t2Players[k].id) {
            team2.players[l] = game.t2Players[k];
            break;
          }
        }
      }
    }
  }

  let ot = false;
  if (t1Goals === t2Goals) {
    ot = true;

    const t1Wins = CHANCE.weighted(
      [true, false],
      [calculateTeamOverall(team1), calculateTeamOverall(team2)]
    );

    t1Wins ? t1Goals++ : t2Goals++;
  }

  //Goalies stats
  let t1Goalie = getTeamGoalies(team1, true)[0];
  let t2Goalie = getTeamGoalies(team2, true)[0];

  if (t1Goals > t2Goals) {
    t1Goalie.stats.wins++;
    t2Goalie.stats.losses++;
    if (t2Goals === 0) {
      t1Goalie.stats.so++;
    }
  } else {
    t2Goalie.stats.wins++;
    t1Goalie.stats.losses++;
    if (t1Goals === 0) {
      t2Goalie.stats.so++;
    }
  }

  return {
    t1Shots,
    t2Shots,
    t1Goals,
    t2Goals,
    ot,
    t1PenaltyMinutes,
    t2PenaltyMinutes,
    stats,
    team1,
    team2
  };
}

function simShift(t1Players, t2Players) {
  let stats = {};
  let t1Chances,
    t2Chances,
    gameLog = [],
    t1Goalie,
    t2Goalie;
  const t1LineOverall = calculatePlayersOverall(t1Players);
  const t2LineOverall = calculatePlayersOverall(t2Players);
  const diff = Math.abs(t1LineOverall - t2LineOverall);

  const tAdvantage = _.round(_.random(18, 34 + diff));
  const tDisadvantage = _.round(_.random(14, 34 - diff / 2));
  const t1Aggression = calculatePlayersAggression(t1Players);
  const t2Aggression = calculatePlayersAggression(t2Players);
  const t1Teamwork = calculatePlayersTeamwork(t1Players);
  const t2Teamwork = calculatePlayersTeamwork(t2Players);

  for (let i = t1Players.length - 1; i > -1; i--) {
    if (t1Players[i].position === "Goalie") {
      t1Goalie = t1Players[i];
      break;
    }
  }

  for (let i = t2Players.length - 1; i > -1; i--) {
    if (t2Players[i].position === "Goalie") {
      t2Goalie = t2Players[i];
      break;
    }
  }

  //PENALTY CHANCE - aggression of both team's lines
  let t1PenaltyMinutes = 0,
    t2PenaltyMinutes = 0;
  //team
  //2,3,5 minutes
  let penaltyChance = 0;
  let isT1Penalty = false;
  if (t1Aggression > t2Aggression) {
    penaltyChance = (t1Aggression * 3 + t2Aggression) / 8;
    isT1Penalty = true;
  } else if (t1Aggression - t2Aggression !== 0) {
    penaltyChance = (t2Aggression * 3 + t1Aggression) / 8;
    isT1Penalty = false;
  } else {
    penaltyChance = (t1Aggression + t2Aggression) / 6;
    isT1Penalty = CHANCE.bool({ likelihood: 50 });
  }
  const isPenalty = CHANCE.bool({ likelihood: penaltyChance / 3.4 });

  if (isPenalty) {
    const time = CHANCE.weighted([2, 3, 5], [10, 8, 1]);
    let penaltyPlayer;

    if (isT1Penalty) {
      t1PenaltyMinutes += time;

      penaltyPlayer =
        t1Players[
          CHANCE.weighted(
            [0, 1, 2, 3, 4],
            [
              t1Players[0].skills.aggression,
              t1Players[1].skills.aggression,
              t1Players[2].skills.aggression,
              t1Players[3].skills.aggression,
              t1Players[4].skills.aggression
            ]
          )
        ];
    } else {
      t2PenaltyMinutes += time;

      penaltyPlayer =
        t2Players[
          CHANCE.weighted(
            [0, 1, 2, 3, 4],
            [
              t2Players[0].skills.aggression,
              t2Players[1].skills.aggression,
              t2Players[2].skills.aggression,
              t2Players[3].skills.aggression,
              t2Players[4].skills.aggression
            ]
          )
        ];
    }
    penaltyPlayer.stats.pim += time;

    // for (let i = 0; i < team1.players.length; i++) {
    //   if(penaltyPlayer.id === team1.players[i].id){
    //     team1.players[i].stats.pim += time;
    //     break;
    //   }
    // }

    penaltyPlayer.stats.pim = penaltyPlayer.stats.pim + time;
  }

  //CALCULATE SHOTS
  const isT1Advantage =
    diff !== 0 ? t1LineOverall > t2LineOverall : _.random(0, 80) % 2 === 0;
  const chanceDiv = 2600;
  if (isT1Advantage) {
    //t1 advantage
    t1Chances = _.round(
      Math.abs(tAdvantage + (6 - t1PenaltyMinutes / 2)) *
        (t1Teamwork / chanceDiv)
    );
    t2Chances = _.round(
      Math.abs(tDisadvantage + (6 - t2PenaltyMinutes / 2)) *
        (t2Teamwork / chanceDiv)
    );
  } else {
    //t2 advantage
    t2Chances = _.round(
      Math.abs(tAdvantage + (6 - t1PenaltyMinutes / 2)) *
        (t2Teamwork / chanceDiv)
    );
    t1Chances = _.round(
      Math.abs(tDisadvantage + (6 - t1PenaltyMinutes / 2)) *
        (t1Teamwork / chanceDiv)
    );
  }

  //CALCULATE GOALS
  const t1Wingers = getTeamWingers({ players: t1Players });
  const t1Defence = getTeamDefence({ players: t1Players });
  const t2Wingers = getTeamWingers({ players: t2Players });
  const t2Defence = getTeamDefence({ players: t2Players });

  const t1OffDiff =
    calculateTeamOffense({ players: t1Wingers }) -
    calculateTeamDefence({ players: t2Defence });
  const t2OffDiff =
    calculateTeamOffense({ players: t2Wingers }) -
    calculateTeamDefence({ players: t1Defence });
  const t1WingerOffense = calculatePlayersOffense(t1Wingers);
  const t1DefenceOffense = calculatePlayersOffense(t1Defence);
  const t2WingerOffense = calculatePlayersOffense(t2Wingers);
  const t2DefenceOffense = calculatePlayersOffense(t2Defence);

  //Calculate Goals
  let t1Goals = 0,
    t2Goals = 0;
  //Team One Shots
  for (let i = 0; i < t1Chances; i++) {
    const isWingerShot = CHANCE.weighted(
      [true, false],
      [t1WingerOffense, t1DefenceOffense / 2.5]
    );

    const shooter = isWingerShot ? _.sample(t1Wingers) : _.sample(t1Defence);
    const goalie = t2Goalie;
    const isGoal = goalChance(shooter, goalie, t1OffDiff);

    //Update stats
    shooter.stats.shots++;
    goalie.stats.sa++;
    //Add goal
    if (isGoal) {
      t1Goals++;
      shooter.stats.goals++;
      goalie.stats.ga++;
      for (let j = 0; j < t1Players.length; j++) {
        let player = t1Players[j];
        if (player.position !== "Goalie") {
          t1Players[j].stats.plusMinus++;
        }
      }
      for (let j = 0; j < t2Players.length; j++) {
        let player = t2Players[j];
        if (player.position !== "Goalie") {
          t2Players[j].stats.plusMinus--;
        }
      }
      //Assists
      let assistPlayers = _.filter(t1Players, p => {
        return p.position !== "Goalie" && p.id !== shooter.id;
      });

      for (let j = 0; j < CHANCE.weighted([0, 1, 2], [20, 60, 30]); j++) {
        let passArray = assistPlayers.map(p => {
          return _.toNumber(p.skills.passing);
        });
        let assistPlayer = CHANCE.weighted(assistPlayers, passArray);

        _.remove(assistPlayers, p => {
          return p.id === assistPlayer.id;
        });
        if (stats[assistPlayer.id] !== undefined) {
          assistPlayer = stats[assistPlayer.id];
        }
        assistPlayer.stats.assists++;
        stats[assistPlayer.id] = assistPlayer;
      }
    }
  }

  //Team Two Shots
  for (let i = 0; i < t2Chances; i++) {
    const isWingerShot = CHANCE.weighted(
      [true, false],
      [t2WingerOffense, t2DefenceOffense / 3]
    );

    const shooter = isWingerShot ? _.sample(t2Wingers) : _.sample(t2Defence);
    const goalie = t1Goalie;
    const isGoal = goalChance(shooter, goalie, t2OffDiff);

    //Update stats
    let shooterPlayer = shooter;
    if (stats[shooter.id] !== undefined) {
      shooterPlayer = stats[shooter.id];
    }
    shooterPlayer.stats.shots++;
    let goaliePlayer = goalie;
    if (stats[goaliePlayer.id] !== undefined) {
      goaliePlayer = stats[goaliePlayer.id];
    }
    goaliePlayer.stats.sa++;
    //Add goal
    if (isGoal) {
      t2Goals++;
      shooterPlayer.stats.goals++;
      goaliePlayer.stats.ga++;
      for (let j = 0; j < t1Players.length; j++) {
        let player = t1Players[j];
        if (player.position !== "Goalie") {
          if (stats[player.id] !== undefined) {
            player = stats[player.id];
          }
          player.stats.plusMinus++;
          stats[player.id] = player;
        }
      }
      for (let j = 0; j < t2Players.length; j++) {
        let player = t2Players[j];
        if (player.position === "Goalie") {
          continue;
        }
        if (stats[player.id] !== undefined) {
          player = stats[player.id];
        }
        player.stats.plusMinus--;
        stats[player.id] = player;
      }
      //Assists
      let assistPlayers = _.filter(t2Players, p => {
        return p.position !== "Goalie" && p.id !== shooter.id;
      });

      for (let j = 0; j < CHANCE.weighted([0, 1, 2], [20, 60, 30]); j++) {
        let passArray = assistPlayers.map(p => {
          return _.toNumber(p.skills.passing);
        });
        let assistPlayer = CHANCE.weighted(assistPlayers, passArray);

        _.remove(assistPlayers, p => {
          return p.id === assistPlayer.id;
        });
        if (stats[assistPlayer.id] !== undefined) {
          assistPlayer = stats[assistPlayer.id];
        }
        assistPlayer.stats.assists++;
        stats[assistPlayer.id] = assistPlayer;
      }
    }
    stats[shooterPlayer.id] = shooterPlayer;
    stats[goaliePlayer.id] = goaliePlayer;
  }

  //Sim Shift Return
  return {
    gameLog,
    t1Goals,
    t2Goals,
    t1Chances,
    t2Chances,
    t1PenaltyMinutes,
    t2PenaltyMinutes,
    stats,
    t1Players,
    t2Players
  };

  //Function Goal Chance
  function goalChance(shooter, goalie, offDiff) {
    let chance =
      20 / (goalie.skills.goaltending + calculatePlayerOverall(goalie) * 2);

    const shooterGoalieDiff =
      calculatePlayerOverall(shooter) - calculatePlayerOverall(goalie);
    const isHighShot = CHANCE.bool({ likelihood: 40 });
    const isBreakaway = CHANCE.weighted(
      [false, true],
      [80, Math.max(Math.floor(20 + offDiff), 2)]
    );
    const shotSpeed = Math.abs(shooter.skills.strength + _.random(-20, 20));

    //Breakaway
    if (isBreakaway) {
      let breakawayChance = _.round(
        (110 - goalie.skills.breakaway + shooter.skills.shooting / 16) / 2
      );
      chance *= 1 + breakawayChance / 60;
    }

    //Aggression
    const aggressionDiff = shooter.skills.aggression - goalie.skills.aggression;

    if (aggressionDiff > 10) {
      chance *= 1.1;
    } else if (aggressionDiff < -10) {
      chance *= 0.95;
    }

    //Speed
    const speedDiff = shotSpeed - goalie.skills.speed;

    if (speedDiff < -20) {
      chance *= 0.95;
    } else if (speedDiff > 10) {
      chance *= 1 + speedDiff / 90;
    }

    //High or Low
    if (isHighShot) {
      const highChance =
        shooter.skills.shooting * _.random(0.95, 1.25) - goalie.skills.high;
      if (highChance < -5) {
        chance *= 0.9;
      } else if (highChance > 1) {
        chance *= 1 + highChance / 80;
      }
    } else {
      const lowChance =
        shooter.skills.shooting * _.random(0.8, 1.15) - goalie.skills.low;

      if (lowChance < -5) {
        chance *= 0.9;
      } else if (lowChance > 1) {
        chance *= 1 + lowChance / 90;
      }
    }

    //Overall Diff
    if (shooterGoalieDiff > 10) {
      chance *= 1 + shooterGoalieDiff / 90;
    } else if (shooterGoalieDiff < -10) {
      chance *= 1 - Math.abs(shooterGoalieDiff) / 101;
    }

    chance = Math.min(chance, 0.95);

    return CHANCE.bool({ likelihood: chance * 100 });
  }
}

export function simGamesToDate({ schedule, endDate, startDate, teams }) {
  let gamesPlayed = [];
  teams = JSON.parse(JSON.stringify(teams));
  startDate =
    startDate ||
    moment()
      .year(1970)
      .month(0)
      .date(0)
      .format();
  endDate = moment(endDate)
    .add(1, "d")
    .format();

  // console.log("|-----------------------------|");
  // console.log("SIM GAMES");
  // console.log("start date", startDate);
  // console.log("end date", endDate);
  // console.log("schedule", schedule);
  // console.log("TEAMS123", teams);

  const gamesToSim = schedule.map(function(day) {
    const date = moment(day.date);
    if (
      // date.isAfter(startDate) &&
      //   date.isBefore(moment(endDate))
      date.isBetween(startDate, endDate)
    ) {
      return day;
    }
  });

  for (let i = 0; i < gamesToSim.length; i++) {
    if (!_.isEmpty(gamesToSim[i])) {
      for (let j = 0; j < gamesToSim[i].games.length; j++) {
        const game = gamesToSim[i].games[j];
        let team1 = getTeamByAbbreviation(game[0]);
        let team2 = getTeamByAbbreviation(game[1]);
        const simmedGame = simGame(team1, team2);

        team1.points.sf += _.toNumber(simmedGame.t1Shots);
        team1.points.sa += _.toNumber(simmedGame.t2Shots);
        team1.points.pim += _.toNumber(simmedGame.t1PenaltyMinutes);
        team1.points.gf += _.toNumber(simmedGame.t1Goals);
        team1.points.ga += _.toNumber(simmedGame.t2Goals);

        team2.points.sf += _.toNumber(simmedGame.t2Shots);
        team2.points.sa += _.toNumber(simmedGame.t1Shots);
        team2.points.pim += _.toNumber(simmedGame.t2PenaltyMinutes);
        team2.points.gf += _.toNumber(simmedGame.t2Goals);
        team2.points.ga += _.toNumber(simmedGame.t1Goals);

        if (simmedGame.t1Goals > simmedGame.t2Goals) {
          team1.points.wins++;
          team2.points.losses++;

          if (simmedGame.ot) {
            team2.points.ot++;
          }

          if (simmedGame.t2Goals === 0) {
            team1.points.so++;
          }
        } else {
          team2.points.wins++;
          team1.points.losses++;

          if (simmedGame.ot) {
            team1.points.ot++;
          }

          if (simmedGame.t1Goals === 0) {
            team2.points.so++;
          }
        }

        teams[
          _.findIndex(teams, t => {
            return (t.id = team1.id);
          })
        ] = simmedGame.team1;
        teams[
          _.findIndex(teams, t => {
            return (t.id = team2.id);
          })
        ] = simmedGame.team2;

        gamesPlayed.push(simmedGame);
      }
    }
  }

  return { gamesPlayed, teams };

  function getTeamByAbbreviation(abbreviation) {
    return _.find(teams, function(t) {
      return t.abbreviation === abbreviation;
    });
  }
}
