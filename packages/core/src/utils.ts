import lodash from 'lodash';

export interface Utilities extends lodash.LoDashStatic {

}

const _: Utilities = lodash;
export { _ };
