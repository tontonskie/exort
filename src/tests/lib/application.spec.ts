import { Application, Controller, Service } from '../../lib';
import { ExpressServer } from '../../lib/http/express';
import { expect } from '../utils';

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

    it('should have an initialized container with self instance registered', () => {
      expect(application.container.getRegisteredInstance(Application)).to.be.instanceOf(Application);
      expect(application.container.getRegisteredInstance(Application)).to.be.eql(application);
    });

    it('passed HttpServer instance to .setHttpServer() should be equal to .getHttpServer()', () => {
      application.setHttpServer(httpServer);
      expect(application.getHttpServer()).to.be.eql(httpServer);
    });

    it('.make() should return an instance of the class with its dependencies', () => {

      @Service()
      class FirstTestService {

      }

      @Service()
      class SecondTestService {

        constructor(public firstTestService: FirstTestService) {}
      }

      @Controller()
      class TestController {

        constructor(public firstTestService: FirstTestService,
                    public secondTestService: SecondTestService) {}
      }

      let controller = application.make(TestController);
      expect(controller.firstTestService).to.be.instanceOf(FirstTestService);
      expect(controller.secondTestService).to.be.instanceOf(SecondTestService);
      expect(controller.secondTestService.firstTestService).to.be.instanceOf(FirstTestService);
      expect(application.container.getRegisteredInstance(FirstTestService)).to.be.eql(controller.firstTestService);
      expect(application.container.getRegisteredInstance(SecondTestService)).to.be.eql(controller.secondTestService);
      expect(application.container.getRegisteredInstance(SecondTestService).firstTestService).to.be.eql(controller.firstTestService);
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
