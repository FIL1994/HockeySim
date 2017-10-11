/**
 * @author Philip Van Raalte
 * @date 2017-08-14.
 */
import {GET_TEAMS, SAVE_TEAMS} from '../actions';

export default function (state = {}, action) {
  switch(action.type){
    case SAVE_TEAMS:
      return action.payload;
    case GET_TEAMS:
      return action.payload;
    default:
      return state;
  }
}