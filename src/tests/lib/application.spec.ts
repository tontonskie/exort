import { Application, Controller, Service, ActionHttpMethod, _ } from '../../lib';
import { ExpressServer, Request, Response } from '../../lib/http/express';
import * as httpServerModule from '../../lib/http/server';
import { expect, request } from '../utils';

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
    const app = new Application(config);

    it('should have an initialized factory with self instance resolved', () => {
      expect(app.container.get(Application)).to.be.instanceOf(Application);
      expect(app.container.get(Application)).to.be.eql(app);
    });

    it('passed HttpServer instance to .setHttpServer() should be equal to .getHttpServer()', () => {
      app.setHttpServer(httpServer);
      expect(app.getHttpServer()).to.be.eql(httpServer);
    });

    it('resolving the HttpServer class used should return the same HttpServer instance', () => {
      expect(app.container.resolve(ExpressServer)).to.be.instanceOf(ExpressServer);
      expect(app.container.get(ExpressServer)).to.be.instanceOf(ExpressServer);
      expect(app.container.resolve(ExpressServer)).to.be.eql(httpServer);
      expect(app.container.get(ExpressServer)).to.be.eql(httpServer);
    });

    it('.make() should return an instance with its dependencies', () => {

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

      let controller = app.make<TestController>(TestController);
      expect(controller.firstTestService).to.be.instanceOf(FirstTestService);
      expect(controller.secondTestService).to.be.instanceOf(SecondTestService);
      expect(controller.secondTestService.firstTestService).to.be.instanceOf(FirstTestService);
      expect(app.container.get(FirstTestService)).to.be.eql(controller.firstTestService);
      expect(app.container.get(SecondTestService)).to.be.eql(controller.secondTestService);
      expect(app.container.get<SecondTestService>(SecondTestService).firstTestService).to.be.eql(controller.firstTestService);
    });

    it('.make() should throw a circular dependecy error', () => {

      @Service()
      class FirstService {

      }

      @Service()
      class SecondService {

        constructor(firstService: FirstService,
                    secondService: SecondService) {}
      }

      @Controller()
      class TestController {

        constructor(firstService: FirstService,
                    secondService: SecondService) {}
      }

      expect(() => app.make(TestController)).to.throw(Error, 'Circular dependency TestController -> SecondService -> SecondService');
    });

    Object.values(ActionHttpMethod).forEach(httpMethod => {
      const decoratorName = _.capitalize(httpMethod);
      const HttpMethodDecorator = httpServerModule[decoratorName] as Function;
      const methodName = httpMethod.toLowerCase();
      it(`.addController() with @${decoratorName}() should resolve controller and dependencies but not Request and Response class`, () => {

        @Service()
        class ServiceA {

          getName() {
            return 'ServiceA';
          }
        }

        @Service()
        class ServiceB {

          getName() {
            return 'ServiceB';
          }
        }

        @Controller()
        class TestController {

          constructor(public serviceA: ServiceA) {}

          @HttpMethodDecorator(methodName)
          testMethod(request: Request, serviceA: ServiceA, serviceB: ServiceB, response: Response) {
            response.send(
              `${request.method} "/${methodName}" w/ prop dep ${this.serviceA.getName()}, method dep ${serviceA.getName()} and ${serviceB.getName()}`
            );
          }
        }

        app.addController(TestController);
        const controller = app.container.get<TestController>(TestController);
        const serviceA = app.container.get<ServiceA>(ServiceA);
        const serviceB = app.container.get<ServiceB>(ServiceB);
        const resolvedClasses = app.container.getResolvedClasses();
        expect(resolvedClasses).to.include(TestController);
        expect(resolvedClasses).to.include(ServiceA);
        expect(resolvedClasses).to.include(ServiceB);
        expect(controller).to.be.instanceOf(TestController);
        expect(controller.serviceA).to.be.instanceof(ServiceA);
        expect(serviceA).to.be.instanceof(ServiceA);
        expect(serviceA).to.be.eql(controller.serviceA);
        expect(serviceB).to.be.instanceof(ServiceB);
        expect(() => app.container.get(Request)).to.throw(Error, `Class "Request" doesn't have a registered instance or not expected by container`);
        expect(() => app.container.get(Response)).to.throw(Error, `Class "Response" doesn't have a registered instance or not expected by container`);
      });
    });

    it('.running should be false before calling .start()', () => {
      expect(app.running).equals(false);
    });

    it('.running should be true after calling .start()', async () => {
      await app.start();
      expect(app.running).equals(true);
    });

    it('.getHttpServer().isRunning() should return true after calling .start()', () => {
      expect(app.getHttpServer().isRunning()).equals(true);
    });

    it('calling .start() twice should throw an error', () => {
      return expect(app.start()).to.eventually.rejectedWith(Error, `Can't call .start() twice. Application is already running`);
    });

    Object.values(ActionHttpMethod).forEach(httpMethod => {
      let methodName = httpMethod.toLowerCase();
      it(`${httpMethod} method on route "/${methodName}" should match text and status code`, done => {

        request(app.getHttpServer().getInstance())
          [methodName](`/${methodName}`)
          .end((err: any, res: ChaiHttp.Response) => {

            expect(res).to.have.status(200);

            if (httpMethod == ActionHttpMethod.HEAD) {
              expect(res.text).equals('');
            } else {
              expect(res.text).to.be.eql(`${httpMethod} "/${methodName}" w/ prop dep ServiceA, method dep ServiceA and ServiceB`);
            }

            done();
          });
      });
    });

    it('.getHttpServer().isRunning() should return false after calling .end()', async () => {
      await app.end();
      expect(app.getHttpServer().isRunning()).equals(false);
    });

    it('.running should be false after calling .end()', () => {
      expect(app.running).equals(false);
    });
  });
});
