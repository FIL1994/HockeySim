/**
 * @author Philip Van Raalte
 * @date 2017-08-25.
 */
import { GET_CURRENT_DAY, SAVE_CURRENT_DAY } from "../actions";

export default function(state = {}, action) {
  switch (action.type) {
    case SAVE_CURRENT_DAY:
      return action.payload;
    case GET_CURRENT_DAY:
      return action.payload;
    default:
      return state;
  }
}
