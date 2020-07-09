import { Application } from '../../lib';
import { ExpressServer } from '../../lib/http/express';
import { expect } from '../utils';
import { __makeTemplateObject } from 'tslib';

describe('application', () => {

  describe('Application', () => {

    const config = {
      environment: 'test',
      http: {
        port: 3000,
        hostname: '127.0.0.1'
      },
      database: {

      }
    };
    const httpServer = new ExpressServer(config.http);
    const application = new Application(config);

    it('passed HttpServer instance to .setHttpServer() should be equal to .getHttpServer()', () => {
      application.setHttpServer(httpServer);
      expect(application.getHttpServer()).to.be.eql(httpServer);
    });

    it('.running should be false before calling .start()', () => {
      expect(application.running).equals(false);
    });

    it('.running should be true after calling .start()', async () => {
      await application.start();
      expect(application.running).equals(true);
    });

    it('.getHttpServer().isRunning() should return true after calling .start()', () => {
      expect(application.getHttpServer().isRunning()).equals(true);
    });

    it('calling .start() twice should throw an error', () => {
      return expect(application.start()).to.eventually.rejectedWith(Error, `Can't call .start() twice. Application is already running`);
    });

    it('.getHttpServer().isRunning() should return false after calling .end()', async () => {
      await application.end();
      expect(application.getHttpServer().isRunning()).equals(false);
    });

    it('.running should be false after calling .end()', () => {
      expect(application.running).equals(false);
    });
  });
});
