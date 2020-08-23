import { expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import chaiPromised from 'chai-as-promised';

use(chaiHttp);
use(chaiPromised);

export { expect, request };
