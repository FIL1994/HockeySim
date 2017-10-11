/**
 * @author Philip Van Raalte
 * @date 2017-07-18.
 */

import {TEAMS, SCHEDULE, CURRENT_DAY, SEASON_STATE} from '../data/storage_names';
import _ from 'lodash';
import moment from 'moment';

export const GET_TEAMS = "get_teams";
export const SAVE_TEAMS = "save_teams";
export const GET_SCHEDULE = "get_schedule";
export const SAVE_SCHEDULE = "save_schedule";
export const GET_CURRENT_DAY = "get_current_day";
export const SAVE_CURRENT_DAY = "save_current_day";
export const GET_SEASON_STATE = "get_season_state";
export const SAVE_SEASON_STATE = "save_season_state";

import {generateTeams, generateSchedule} from '../data/generate';

export function saveTeams(payload) {
  localStorage.setItem(TEAMS, JSON.stringify(payload));

  return{
    type: SAVE_TEAMS,
    payload
  };
}

function receiveTeams(payload, save) {
  if(save) {
    localStorage.setItem(TEAMS, JSON.stringify(payload));
  }

  return{
    type: GET_TEAMS,
    payload
  };
}

export function getTeams() {
  return dispatch => {
    let save = false;
    let teams = JSON.parse(localStorage.getItem(TEAMS));
    if(_.isEmpty(teams)){
      teams = generateTeams({teamsCount: 30});
      save = true;
    }

    dispatch(receiveTeams(teams, save));
  };
}

function receiveSchedule(payload) {
  localStorage.setItem(SCHEDULE, JSON.stringify(payload));

  return {
    type: GET_SCHEDULE,
    payload
  };
}

export function getSchedule(teams) {
  return dispatch => {
    let schedule = JSON.parse(localStorage.getItem(SCHEDULE));

    if(_.isEmpty(schedule)){
      if(_.isEmpty(teams)){
        return "FAIL";
      }
      else{
        return dispatch(receiveSchedule(generateSchedule(teams)));
      }
    }
    return dispatch(receiveSchedule(schedule));
  };
}

export function saveSchedule(payload) {
  localStorage.setItem(SCHEDULE, JSON.stringify(payload));

  return{
    type: SAVE_SCHEDULE,
    payload
  };
}

export function getSeasonState() {
  //draft date, awards date, trade deadline
  let seasonState = {
    state: "season", //playoffs, offseason
    seasonStart: "feb 10",
    seasonEnd: "jul 30",
    playoffsStart: "aug. 10",
    playoffsEnd: "oct. 30"
  };
  localStorage.setItem(SEASON_STATE, JSON.stringify(seasonState));

  return{
    type: GET_SEASON_STATE,
    seasonState
  }
}

export function getCurrentDay() {
  let currentDay = moment().year(1970).month(0).date(1);
  localStorage.setItem(CURRENT_DAY, JSON.stringify(currentDay));

  return{
    type: GET_CURRENT_DAY,
    currentDay
  }
}