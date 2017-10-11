/**
 * @author Philip Van Raalte
 * @date 2017-08-15.
 */
import _ from 'lodash';

export function removeRandomFromArray(array) {
  return array.splice(_.random(array.length - 1), 1)[0];
}