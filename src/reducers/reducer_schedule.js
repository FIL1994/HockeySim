/**
 * @author Philip Van Raalte
 * @date 2017-08-16.
 */
import {GET_SCHEDULE, SAVE_SCHEDULE} from '../actions';
import _ from 'lodash';
import {generateSchedule} from '../data/generate';

export default function (state = {}, action) {
  switch(action.type){
    case GET_SCHEDULE:
      return action.payload;
    case SAVE_SCHEDULE:
      return action.payload;
    default:
      return state;
  }
}