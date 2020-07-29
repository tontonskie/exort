import { HttpServer, ActionHttpMethod } from '../..';
import { Express, Request, Response } from '../../http/express';
import { expect, request } from '../../../core/tests/utils';

describe('server/http/express', () => {
  describe('Express', () => {

    const server: Express = new Express();
    before(() => {
      Object.values(ActionHttpMethod).forEach(httpMethod => {
        server[`${httpMethod.toLowerCase()}`]('/', (request: Request, response: Response) => {
          response.send(`${request.method} method`);
        });
      });
    });

    it('should be an instance of HttpServer class', () => {
      expect(server).to.be.instanceOf(HttpServer);
    });

    it('.getInstance() should return express instance', () => {
      expect(server.getInstance()).to.be.a('function').property('name', 'app');
    });

    it('.isRunning() should return false before calling .start()', () => {
      expect(server.isRunning()).equals(false);
    });

    it('.isRunning() should return true after calling .start()', async () => {
      await server.start(3000);
      expect(server.isRunning()).equals(true);
    });

    it('calling .start() twice should throw an error', () => {
      return expect(server.start(3000)).to.eventually.rejectedWith(Error, 'Cannot call .start() twice. Http server is already running.');
    });

    Object.values(ActionHttpMethod).forEach(httpMethod => {
      it(`${httpMethod} method on route "/" should match text and status code`, done => {

        request(server.getInstance())
          [`${httpMethod.toLowerCase()}`]('/')
          .end((err: any, res: ChaiHttp.Response) => {

            expect(res).to.have.status(200);

            if (httpMethod == ActionHttpMethod.HEAD) {
              expect(res.text).equals('');
            } else {
              expect(res.text).to.be.eql(`${httpMethod} method`);
            }

            done();
          });
      });
    });

    it('.isRunning() should return false after calling .end()', async () => {
      await server.end();
      expect(server.isRunning()).equals(false);
    });
  });
});
