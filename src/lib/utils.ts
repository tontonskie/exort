import * as lodash from 'lodash';

export interface Utilities extends lodash.LoDashStatic {

}

const _ = lodash as Utilities;
export { _ };
