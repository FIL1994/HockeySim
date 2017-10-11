import { combineReducers } from 'redux';
import TeamReducer from './reducer_team';
import ScheduleReducer from './reducer_schedule';
import CurrentDayReducer from './reducer_current_day';
import SeasonStateReducer from './reducer_season_state';

const rootReducer = combineReducers({
  state: (state = {}) => state,
  teams: TeamReducer,
  schedule: ScheduleReducer,
  currentDay: CurrentDayReducer,
  seasonState: SeasonStateReducer
});

export default rootReducer;
