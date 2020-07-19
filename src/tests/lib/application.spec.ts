import { Application, createApplication, Controller, Service, ActionHttpMethod, Middleware, _ } from '../../lib';
import { Express, Request, Response, Next } from '../../lib/http/express';
import * as httpServerModule from '../../lib/http/server';
import { expect, request } from '../utils';

describe('application', () => {

  const app = createApplication(Express);
  describe('createApplication()', () => {
    it(`should return an instance of ${Application.name} class`, () => {
      expect(app).to.be.instanceOf(Application);
    });
  });

  describe('Application', () => {

    it('should have an initialized factory with self instance resolved', () => {
      expect(app.container.get(Application)).to.be.instanceOf(Application);
      expect(app.container.get(Application)).to.be.eql(app);
    });

    it(`.getHttpServer() should return an instance of ${Express.name}`, () => {
      expect(app.getHttpServer()).to.be.instanceOf(Express);
    });

    it(`resolving the ${Express.name} class used should return the same ${Express.name} instance`, () => {
      expect(app.container.resolve(Express)).to.be.instanceOf(Express);
      expect(app.container.get(Express)).to.be.instanceOf(Express);
      expect(app.container.resolve(Express)).to.be.eql(app.getHttpServer());
      expect(app.container.get(Express)).to.be.eql(app.getHttpServer());
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

    it('.addMiddleware() should resolve middleware and dependencies but not Request and Response class', () => {

      @Service()
      class ServiceA {

      }

      @Middleware()
      class TestMiddleware {

        constructor(public serviceA: ServiceA) {}

        handle(request: Request, response: Response, next: Next) {
          next();
        }
      }

      app.addMiddleware(TestMiddleware);
      const middleware = app.container.get<TestMiddleware>(TestMiddleware);
      const serviceA = app.container.get<ServiceA>(ServiceA);
      const resolvedClasses = app.container.getResolvedClasses();
      expect(middleware).to.be.instanceOf(TestMiddleware);
      expect(resolvedClasses).to.include(TestMiddleware);
      expect(resolvedClasses).to.include(ServiceA);
      expect(middleware.serviceA).to.be.instanceOf(ServiceA);
      expect(serviceA).to.be.instanceOf(ServiceA);
      expect(serviceA).to.be.eql(middleware.serviceA);
    });

    Object.values(ActionHttpMethod).forEach(httpMethod => {
      const decoratorName = _.capitalize(httpMethod);
      const HttpMethodDecorator: Function = httpServerModule[decoratorName];
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
        expect(controller.serviceA).to.be.instanceOf(ServiceA);
        expect(serviceA).to.be.instanceOf(ServiceA);
        expect(serviceA).to.be.eql(controller.serviceA);
        expect(serviceB).to.be.instanceOf(ServiceB);
        expect(() => app.container.get(Request)).to.throw(Error, `Class "Request" doesn't have a registered instance or not expected by container`);
        expect(() => app.container.get(Response)).to.throw(Error, `Class "Response" doesn't have a registered instance or not expected by container`);
        expect(resolvedClasses).to.not.include(Request);
        expect(resolvedClasses).to.not.include(Response);
      });
    });

    it('.running should be false before calling .start()', () => {
      expect(app.running).equals(false);
    });

    it('.running should be true after calling .start()', async () => {
      await app.start(3000);
      expect(app.running).equals(true);
    });

    it('.getHttpServer().isRunning() should return true after calling .start()', () => {
      expect(app.getHttpServer().isRunning()).equals(true);
    });

    it('calling .start() twice should throw an error', () => {
      return expect(app.start(3000)).to.eventually.rejectedWith(Error, `Can't call .start() twice. Application is already running`);
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
