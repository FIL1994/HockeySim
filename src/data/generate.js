/**
 * @author Philip Van Raalte
 * @date 2017-08-14.
 */
import _ from "lodash";
import CITIES from "./cities";
import TEAM_NAMES from "./teamNames";
import getRandomName from "./player_name";
import { calculatePlayerOverall } from "./stats";
import moment from "moment";
import { Chance } from "chance";
const CHANCE = new Chance(moment().unix());

export function generateTeams({ teamsCount }) {
  let teams = [],
    playerID = 0;
  const teamCities = _.take(_.shuffle(_.uniq(CITIES)), teamsCount);
  const teamNames = _.take(_.shuffle(_.uniq(TEAM_NAMES)), teamsCount);

  for (let i = 0; i < teamCities.length; i++) {
    const teamName = `${teamCities[i]} ${teamNames[i]}`;
    const teamNameWords = _.words(teamName);
    let abbreviation;
    let tryNum = 0;

    do {
      if (tryNum === 0) {
        if (teamNameWords.length > 2) {
          abbreviation =
            teamNameWords[0].charAt(0) +
            teamNameWords[1].charAt(0) +
            teamNameWords[2].charAt(0);
        } else {
          const wordNum = _.random(0, 1);
          abbreviation =
            teamNameWords[0].charAt(0) +
            teamNameWords[1].charAt(0) +
            teamNameWords[wordNum].charAt(
              _.random(1, teamNameWords[wordNum].length - 1)
            );
        }
      } else if (tryNum === 1) {
        if (teamNameWords.length > 2) {
          const wordNum = _.random(0, teamNameWords.length - 1);
          abbreviation =
            teamNameWords[0].charAt(0) +
            teamNameWords[1].charAt(0) +
            teamNameWords[wordNum].charAt(
              _.random(1, teamNameWords[wordNum].length - 1)
            );
        } else {
          abbreviation = "";
          for (let j = 0; j < teamNameWords.length; j++) {
            if (abbreviation.length > 2) {
              break;
            }
            abbreviation += teamNameWords[j].charAt(
              _.random(0, teamNameWords[j].length - 1)
            );
          }
        }
      } else {
        abbreviation =
          teamNameWords[0].charAt(0) +
          teamNameWords[1].charAt(0) +
          tryNum.toString().charAt(0);
      }
      abbreviation = _.toUpper(abbreviation);
      tryNum++;
      // console.log(abbreviation);
    } while (
      _.findIndex(teams, function(t) {
        return t.abbreviation === abbreviation;
      }) !== -1
    );

    let team = {
      teamName,
      abbreviation,
      players: [],
      lines: {
        forward1: [],
        forward2: [],
        forward3: [],
        forward4: [],
        defence1: [],
        defence2: [],
        defence3: [],
        goalie1: {},
        goalie2: {}
      },
      points: {
        wins: 0,
        losses: 0,
        ot: 0, //overtime losses
        sf: 0, //shots for
        sa: 0, //shots against
        gf: 0, //goals for
        ga: 0, //goals against
        pim: 0, //penalty minutes
        so: 0 //shut-outs
      },
      strategy: {
        period1: [
          { offense: 0, defence: 0, goalie: 0 }, //5 minutes
          { offense: 0, defence: 0, goalie: 0 },
          { offense: 0, defence: 0, goalie: 0 },
          { offense: 0, defence: 0, goalie: 0 }
        ],
        period2: [
          { offense: 0, defence: 0, goalie: 0 },
          { offense: 1, defence: 0, goalie: 0 },
          { offense: 1, defence: 1, goalie: 0 },
          { offense: 1, defence: 1, goalie: 0 }
        ],
        period3: [
          { offense: 1, defence: 1, goalie: 0 },
          { offense: 3, defence: 1, goalie: 1 },
          { offense: 3, defence: 2, goalie: 1 },
          { offense: 3, defence: 2, goalie: 1 }
        ]
      }
    };

    //GENERATE STRATEGY
    let offenseStrat = _.shuffle([0, 0, 0, 0, 0, 1, 1, 1, 1, 3, 3, 3]);
    let defenceStrat = _.shuffle([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2]);
    let goalieStrat = _.shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]);

    let period1, period2, period3;
    period1 = period2 = period3 = [];

    for (let j = 0; j < 4; j++) {
      period1.push({
        offense: offenseStrat[j],
        defence: defenceStrat[j],
        goalie: goalieStrat[j]
      });
    }
    for (let j = 0; j < 4; j++) {
      period2.push({
        offense: offenseStrat[j + 4],
        defence: defenceStrat[j + 4],
        goalie: goalieStrat[j + 4]
      });
    }
    for (let j = 0; j < 4; j++) {
      period3.push({
        offense: offenseStrat[j + 8],
        defence: defenceStrat[j + 8],
        goalie: goalieStrat[j + 8]
      });
    }

    team.strategy.period1 = period1;
    team.strategy.period2 = period2;
    team.strategy.period3 = period3;

    //GENERATE PLAYERS
    let wingersNum = 12,
      defenceNum = 8,
      goalieNum = 2;
    class PlayerStats {
      constructor() {
        this.pim = 0;
        this.shots = 0;
        this.goals = 0;
        this.assists = 0;
        this.plusMinus = 0;
      }
    }
    class GoalieStats {
      constructor() {
        this.sa = 0;
        this.ga = 0;
        this.wins = 0;
        this.losses = 0;
        this.so = 0;
      }
    }

    const starPlayers = _.random(7, 8);
    // console.log(teamName, starPlayers);

    let wingersX = 0,
      defenceX = 0,
      goalieX = 0;
    const chances = 25;
    for (let j = 0; j < starPlayers; j++) {
      function generateStarWinger() {
        function starWinger() {
          return {
            id: playerID++,
            name: getRandomName(),
            position: "Winger",
            skills: {
              offense: _.random(80, 100),
              defence: _.random(60, 100),
              teamwork: _.random(65, 100),
              shooting: _.random(75, 100),
              passing: _.random(70, 100),
              aggression: _.random(60, 100),
              speed: _.random(73, 100),
              strength: _.random(70, 100)
            },
            stats: new PlayerStats()
          };
        }
        let starPlayers = [];
        for (let k = 0; k < chances; k++) {
          starPlayers.push(starWinger());
        }

        _.orderBy(
          starPlayers,
          function(p) {
            return calculatePlayerOverall(p);
          },
          "desc"
        );

        return starPlayers[0];
      }
      function generateStarDefence() {
        function starDefence() {
          return {
            id: playerID++,
            name: getRandomName(),
            position: "Defence",
            skills: {
              offense: _.random(60, 100),
              defence: _.random(80, 100),
              teamwork: _.random(70, 100),
              shooting: _.random(70, 100),
              passing: _.random(80, 100),
              aggression: _.random(65, 100),
              speed: _.random(70, 100),
              strength: _.random(75, 100)
            },
            stats: new PlayerStats()
          };
        }
        let starPlayers = [];
        for (let k = 0; k < chances; k++) {
          starPlayers.push(starDefence());
        }

        _.orderBy(
          starPlayers,
          function(p) {
            return calculatePlayerOverall(p);
          },
          "desc"
        );

        return starPlayers[0];
      }
      function generateStarGoalie() {
        function starGoalie() {
          return {
            id: playerID++,
            name: getRandomName(),
            position: "Goalie",
            skills: {
              goaltending: _.random(75, 100),
              teamwork: _.random(70, 100),
              aggression: _.random(60, 100),
              breakaway: _.random(73, 100),
              speed: _.random(70, 100),
              high: _.random(70, 100),
              low: _.random(75, 100)
            },
            stats: new GoalieStats()
          };
        }
        let starPlayers = [];
        for (let k = 0; k < chances; k++) {
          starPlayers.push(starGoalie());
        }

        _.orderBy(
          starPlayers,
          function(p) {
            return calculatePlayerOverall(p);
          },
          "desc"
        );

        return starPlayers[0];
      }

      const starPlayer = CHANCE.weighted(
        ["winger", "defence", "goalie"],
        [60, 40, 20]
      );

      switch (starPlayer) {
        case "winger":
          wingersX++;
          wingersNum--;
          team.players.push(generateStarWinger());
          break;
        case "defence":
          if (defenceX > 7) {
            if (goalieX > 1 ? true : CHANCE.bool({ likelihood: 50 })) {
              goalieX++;
              goalieNum--;
              team.players.push(generateStarGoalie());
            } else {
              wingersX++;
              wingersNum--;
              team.players.push(generateStarWinger());
            }
          } else {
            defenceX++;
            defenceNum--;
            team.players.push(generateStarDefence());
          }
          break;
        case "goalie":
          if (goalieX > 1) {
            if (defenceX > 7 ? true : CHANCE.bool({ likelihood: 50 })) {
              wingersX++;
              wingersNum--;
              team.players.push(generateStarWinger());
            } else {
              defenceX++;
              defenceNum--;
              team.players.push(generateStarDefence());
            }
          } else {
            goalieX++;
            goalieNum--;
            team.players.push(generateStarGoalie());
          }
          break;
      }
    }

    const regChances = 5;
    let wingerPlayers = [];
    for (let j = 0; j < wingersNum * regChances; j++) {
      wingerPlayers.push({
        id: playerID++,
        name: getRandomName(),
        position: "Winger",
        skills: {
          offense: _.random(60, 100),
          defence: _.random(40, 85),
          teamwork: _.random(40, 100),
          shooting: _.random(50, 100),
          passing: _.random(40, 100),
          aggression: _.random(30, 100),
          speed: _.random(40, 100),
          strength: _.random(40, 100)
        },
        stats: new PlayerStats()
      });
    }
    team.players.push(
      ..._.take(
        _.sortBy(wingerPlayers, p => {
          return -calculatePlayerOverall(p);
        }),
        wingersNum
      )
    );
    let defencePlayers = [];
    for (let j = 0; j < defenceNum * regChances; j++) {
      defencePlayers.push({
        id: playerID++,
        name: getRandomName(),
        position: "Defence",
        skills: {
          offense: _.random(40, 100),
          defence: _.random(60, 100),
          teamwork: _.random(40, 100),
          shooting: _.random(40, 100),
          passing: _.random(50, 100),
          aggression: _.random(30, 100),
          speed: _.random(40, 100),
          strength: _.random(40, 100)
        },
        stats: new PlayerStats()
      });
    }
    team.players.push(
      ..._.take(
        _.sortBy(defencePlayers, p => {
          return -calculatePlayerOverall(p);
        }),
        defenceNum
      )
    );
    let goaliePlayers = [];
    for (let j = 0; j < goalieNum * regChances * 3; j++) {
      goaliePlayers.push({
        id: playerID++,
        name: getRandomName(),
        position: "Goalie",
        skills: {
          goaltending: _.random(40, 100),
          teamwork: _.random(40, 100),
          aggression: _.random(30, 100),
          breakaway: _.random(40, 100),
          speed: _.random(40, 100),
          high: _.random(40, 100),
          low: _.random(40, 100)
        },
        stats: new GoalieStats()
      });
    }
    team.players.push(
      ..._.take(
        _.sortBy(goaliePlayers, p => {
          return -calculatePlayerOverall(p);
        }),
        goalieNum
      )
    );

    team.lines = generateLines(team);

    teams.push(team);
  }

  console.log("Teams Generated!");
  return teams;
}

function generateLines(team) {
  let lines = {
    forward1: [],
    forward2: [],
    forward3: [],
    forward4: [],
    defence1: [],
    defence2: [],
    defence3: [],
    goalie1: {},
    goalie2: {}
  };

  //Get forwards, defence and goalies sorted by player overall
  let forwards = _.sortBy(
    _.filter(team.players, function(player) {
      return player.position === "Winger";
    }),
    function(player) {
      return -calculatePlayerOverall(player);
    }
  );

  let defence = _.sortBy(
    _.filter(team.players, function(player) {
      return player.position === "Defence";
    }),
    function(player) {
      return -calculatePlayerOverall(player);
    }
  );

  let goalies = _.sortBy(
    _.filter(team.players, function(player) {
      return player.position === "Goalie";
    }),
    function(player) {
      return -calculatePlayerOverall(player);
    }
  );

  //split the players for lines
  forwards = _.chunk(forwards, 3);
  defence = _.chunk(defence, 2);
  goalies = _.take(goalies, 2);

  lines.forward1 = forwards[0];
  lines.forward2 = forwards[1];
  lines.forward3 = forwards[2];
  lines.forward4 = forwards[3];
  lines.defence1 = defence[0];
  lines.defence2 = defence[1];
  lines.defence3 = defence[2];
  lines.goalie1 = goalies[0];
  lines.goalie2 = goalies[1];

  return lines;
}

export function generateSchedule(teams) {
  /*
   * 180 days in Regular Season. Starts circa October 12.
   * Play each team 3x
   * 1305 games / 145 season days = 9 games per day
   * Each team plays 87 games
   */

  if (!_.isArray(teams)) {
    console.log("ERROR", teams);
    return;
  }

  teams = _.sortBy(teams, ["abbreviation"]);

  //configure the game pairings
  let combinationsByTeam = [];
  for (let i = 0; i < teams.length; i++) {
    combinationsByTeam.push({
      index: teams[i].abbreviation,
      combinations: []
    });
    for (let j = i + 1; j < teams.length; j++) {
      combinationsByTeam[i].combinations.push([
        teams[i].abbreviation,
        teams[j].abbreviation
      ]);
    }
  }

  const playTeamXTimes = 3;
  const maxDays = 180;
  let newDays = [{ games: [] }];
  let filledDays = 0;
  for (let i = 0; i < combinationsByTeam.length; i++) {
    //loop through team's combinations
    for (let j = 0; j < combinationsByTeam[i].combinations.length; j++) {
      const combo = combinationsByTeam[i].combinations[j];

      //add combination 3 times
      for (let k = 0; k < playTeamXTimes; k++) {
        //label the for loop
        loopDays: for (let w = filledDays; w < maxDays; w++) {
          if (newDays.length - 1 < w) {
            newDays.push({ games: [] });
          }

          if (_.isEmpty(newDays[w].games)) {
            newDays[w].games.push(combo);
            break loopDays;
          } else if (newDays[w].games.length > 8) {
            if (w === filledDays + 1) {
              filledDays++;
            }
          } else {
            let foundGame = false;
            let hasAdded = false;
            for (let l = 0; l < newDays[w].games.length; l++) {
              const game = newDays[w].games[l];
              if (_.isEmpty(game[0])) {
                newDays[w].games.push(combo);
                foundGame = true;
                hasAdded = true;
                break;
              }
              if (
                game[0] === combo[0] ||
                game[1] === combo[0] ||
                game[0] === combo[1] || game[1] === combo[1]
              ) {
                foundGame = true;
                break;
              }
            }
            if (!foundGame) {
              newDays[w].games.push(combo);
              hasAdded = true;
            }
            if (hasAdded) {
              break loopDays;
            }
          }
        }
      }
    }
  }

  //fill array with 180
  while (newDays.length < 180) {
    newDays.push({ games: [] });
  }

  const startDay = moment()
    .year(1970)
    .month(0)
    .date(1); //new Date(1970, 1, 12);

  newDays = _.shuffle(newDays);

  newDays = newDays.map((day, index) => {
    return {
      ...day,
      date: moment(startDay).add(index, "days")
    };
  });

  return newDays;
}

export function scheduleToEvents(schedule, teamAbbreviation, otherEvents) {
  if (_.isEmpty(schedule)) {
    return [];
  }

  let events = [];

  for (let i = 0; i < schedule.length; i++) {
    const day = schedule[i];
    for (let j = 0; j < day.games.length; j++) {
      const game = day.games[j];
      const filterByTeam = !_.isEmpty(teamAbbreviation);

      if (
        !filterByTeam ||
        game[0] === teamAbbreviation || game[1] === teamAbbreviation
      ) {
        events.push({
          title: `${game[0]} - ${game[1]}`,
          desc: "game",
          allDay: true,
          start: moment(day.date).toDate(),
          end: moment(day.date).toDate(),
          info: {
            day,
            game,
            dayIndex: i,
            gameIndex: j
          },
          filteredByTeam: filterByTeam
        });
      }
    }
  }

  return events;
}
