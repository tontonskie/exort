import { expect, use, request } from 'chai';
import chaiHttp = require('chai-http');
import chaiPromised = require('chai-as-promised');

use(chaiHttp);
use(chaiPromised);

export { expect, request };
