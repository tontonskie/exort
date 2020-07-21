import { Application, createApplication, Controller, ActionHttpMethod, Middleware, MiddlewareConfig } from '../../server';
import { Express, Request, Response, NextFunction } from '../../server/http/express';
import { Service, _ } from '../../core';
import * as httpServerModule from '../../server/http/server';
import { expect, request } from '../../core/tests/utils';

describe('server/application', () => {

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

        handle(request: Request, response: Response, next: NextFunction) {
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

    it('.addMiddleware() with MiddlewareConfig should trigger .install() with config not null', () => {

      @Service()
      class ServiceA {

      }

      interface TestMiddlewareConfig {
        count: number;
      }

      const config = {
        count: 1
      };

      @Middleware()
      class TestMiddleware {

        public count: number = 0;

        constructor(public serviceA: ServiceA) {}

        install(config: TestMiddlewareConfig) {
          this.count = config.count;
        }

        handle(request: Request, response: Response, next: NextFunction) {
          next();
        }

        static configure(config: TestMiddlewareConfig) {
          return new MiddlewareConfig(this, config);
        }
      }

      app.addMiddleware(TestMiddleware.configure(config));
      const middleware = app.container.get<TestMiddleware>(TestMiddleware);
      const serviceA = app.container.get<ServiceA>(ServiceA);
      const resolvedClasses = app.container.getResolvedClasses();
      expect(middleware).to.be.instanceOf(TestMiddleware);
      expect(resolvedClasses).to.include(TestMiddleware);
      expect(resolvedClasses).to.include(ServiceA);
      expect(middleware.serviceA).to.be.instanceOf(ServiceA);
      expect(serviceA).to.be.instanceOf(ServiceA);
      expect(serviceA).to.be.eql(middleware.serviceA);
      expect(middleware.count).equals(config.count);
    });

    it('.addMiddleware() with array of MiddlewareClass | MiddlewareConfig should trigger .install()', () => {

      @Service()
      class ServiceA {

      }

      interface AttemptMiddlewareConfig {
        count: number;
      }

      const attemptConfig = {
        count: 1
      };

      @Middleware()
      class AttemptMiddleware {

        public count: number = 0;

        constructor(public serviceA: ServiceA) {}

        install(config: AttemptMiddlewareConfig) {
          this.count = config.count;
        }

        handle(request: Request, response: Response, next: NextFunction) {
          next();
        }

        static configure(config: AttemptMiddlewareConfig) {
          return new MiddlewareConfig(this, config);
        }
      }

      @Middleware()
      class TestMiddleware {

        constructor(public serviceA: ServiceA) {}

        handle(request: Request, response: Response, next: NextFunction) {
          next();
        }
      }

      app.addMiddleware([
        AttemptMiddleware.configure(attemptConfig),
        TestMiddleware
      ]);
      const attemptMiddleware = app.container.get<AttemptMiddleware>(AttemptMiddleware);
      const testMiddleware = app.container.get<TestMiddleware>(TestMiddleware);
      const serviceA = app.container.get<ServiceA>(ServiceA);
      const resolvedClasses = app.container.getResolvedClasses();
      expect(attemptMiddleware).to.be.instanceOf(AttemptMiddleware);
      expect(testMiddleware).to.be.instanceOf(TestMiddleware);
      expect(resolvedClasses).to.include(AttemptMiddleware);
      expect(resolvedClasses).to.include(TestMiddleware);
      expect(resolvedClasses).to.include(ServiceA);
      expect(attemptMiddleware.serviceA).to.be.instanceOf(ServiceA);
      expect(testMiddleware.serviceA).to.be.instanceOf(ServiceA);
      expect(serviceA).to.be.eql(attemptMiddleware.serviceA);
      expect(serviceA).to.be.eql(testMiddleware.serviceA);
      expect(attemptMiddleware.serviceA).to.be.eql(testMiddleware.serviceA);
      expect(attemptMiddleware.count).equals(attemptConfig.count);
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
        expect(() => app.container.get(Request)).to.throw(Error, `Class "Request" does not have a registered instance or not expected by container`);
        expect(() => app.container.get(Response)).to.throw(Error, `Class "Response" does not have a registered instance or not expected by container`);
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
      return expect(app.start(3000)).to.eventually.rejectedWith(Error, 'Cannot call .start() twice. Application is already running');
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
