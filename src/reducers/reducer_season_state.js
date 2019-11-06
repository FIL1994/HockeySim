/**
 * @author Philip Van Raalte
 * @date 2017-08-25.
 */
import { GET_SEASON_STATE, SAVE_SEASON_STATE } from "../actions";

export default function(state = {}, action) {
  switch (action.type) {
    case SAVE_SEASON_STATE:
      return action.payload;
    case GET_SEASON_STATE:
      return action.payload;
    default:
      return state;
  }
}
