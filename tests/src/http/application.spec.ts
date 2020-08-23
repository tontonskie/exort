import { Express, Request, Response, NextFunction } from '@exort/express';
import { Service, Provider, _ } from '@exort/core';
import { expect, request } from '../utils';
import * as httpModule from '@exort/http';

const { WebApplication, createWebApplication, Controller, ActionHttpMethod, Middleware } = httpModule;

describe('htttp/application', () => {

  const app = createWebApplication(Express);
  describe('createWebApplication()', () => {
    it(`should return an instance of ${WebApplication.name} class`, () => {
      expect(app).to.be.instanceOf(WebApplication);
    });
  });

  describe('WebApplication', () => {

    it('should have an initialized factory with self instance resolved', () => {
      expect(app.container.get(WebApplication)).to.be.instanceOf(WebApplication);
      expect(app.container.get(WebApplication)).to.be.eql(app);
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

    it('.use() should resolve middleware handler dependencies but not Request, Response class and next function', () => {

      @Service()
      class ServiceA {

      }

      @Provider()
      class TestMiddleware {

        @Middleware()
        handle(request: Request, response: Response, next: NextFunction, serviceA: ServiceA) {
          next();
        }
      }

      app.use(TestMiddleware);
      const resolvedClasses = app.container.getResolvedClasses();
      expect(resolvedClasses).to.include(ServiceA);
      expect(resolvedClasses).to.not.include(Request);
      expect(resolvedClasses).to.not.include(Response);
      expect(resolvedClasses).to.not.include(Function);
      expect(app.container.get(ServiceA)).to.be.instanceOf(ServiceA);
    });

    it('.use() with middleware instance', () => {

      @Service()
      class ServiceA {

      }

      @Provider()
      class TestMiddleware {

        @Middleware()
        handle(request: Request, response: Response, next: NextFunction, service: ServiceA) {
          next();
        }
      }

      app.use(new TestMiddleware());
      const resolvedClasses = app.container.getResolvedClasses();
      expect(resolvedClasses).to.include(ServiceA);
      expect(resolvedClasses).to.not.include(Request);
      expect(resolvedClasses).to.not.include(Response);
      expect(resolvedClasses).to.not.include(Function);
      expect(app.container.get(ServiceA)).to.be.instanceOf(ServiceA);
    });

    it('.use() with middleware class and instance', () => {

      @Service()
      class ServiceA {

      }

      @Service()
      class ServiceB {

      }

      @Provider()
      class AttemptMiddleware {

        @Middleware()
        handle(request: Request, response: Response, next: NextFunction, serviceA: ServiceA) {
          next();
        }
      }

      @Provider()
      class TestMiddleware {

        @Middleware()
        handle(request: Request, response: Response, next: NextFunction, serviceB: ServiceB) {
          next();
        }
      }

      app.use(new AttemptMiddleware());
      app.use(TestMiddleware);
      const resolvedClasses = app.container.getResolvedClasses();
      expect(resolvedClasses).to.include(ServiceA);
      expect(resolvedClasses).to.include(ServiceB);
      expect(resolvedClasses).to.not.include(Request);
      expect(resolvedClasses).to.not.include(Response);
      expect(resolvedClasses).to.not.include(Function);
      expect(app.container.get(ServiceA)).to.be.instanceOf(ServiceA);
      expect(app.container.get(ServiceB)).to.be.instanceOf(ServiceB);
    });

    it('.use() with 3rd party middleware class that uses base request and response', () => {

      @Provider()
      class ThirdPartyProvider {

        @Middleware()
        handle(request: httpModule.Request, response: httpModule.Response, next: httpModule.NextFunction) {
          next();
        }
      }

      app.use(ThirdPartyProvider);
      const resolvedClasses = app.container.getResolvedClasses();
      expect(resolvedClasses).to.not.include(httpModule.Request);
      expect(resolvedClasses).to.not.include(httpModule.Response);
      expect(resolvedClasses).to.not.include(Function);
    });

    it('.use() with 3rd party middleware instance that uses base request and response', () => {

      @Provider()
      class ThirdPartyProvider {

        @Middleware()
        handle(request: httpModule.Request, response: httpModule.Response, next: httpModule.NextFunction) {
          next();
        }
      }

      app.use(new ThirdPartyProvider());
      const resolvedClasses = app.container.getResolvedClasses();
      expect(resolvedClasses).to.not.include(httpModule.Request);
      expect(resolvedClasses).to.not.include(httpModule.Response);
      expect(resolvedClasses).to.not.include(Function);
    });

    Object.values(ActionHttpMethod).forEach(httpMethod => {
      const decoratorName = _.capitalize(httpMethod);
      const HttpMethodDecorator: Function = httpModule[decoratorName];
      const methodName = httpMethod.toLowerCase();
      it(`.use() with @${decoratorName}() should resolve controller and dependencies but not Request and Response class`, () => {

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

        app.use(TestController);
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

      it(`.use() with @${decoratorName}() should resolve controller and dependencies but not Request, Response and the middleware attached`, () => {

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

        @Provider()
        class TestMiddleware {

          @Middleware()
          handle(request: Request, response: Response, next: NextFunction) {
            // TODO: Request context in the base request
            (request as any).test = 'test';
            next();
          }
        }

        @Controller()
        class TestController {

          constructor(public serviceA: ServiceA) {}

          @HttpMethodDecorator(`${methodName}/with-middleware`)
          testMethod(request: Request, serviceA: ServiceA, serviceB: ServiceB, response: Response) {
            response.send(
              `${request.method} "/${methodName}/with-middleware" w/ prop dep ${this.serviceA.getName()}, ` +
              `method dep ${serviceA.getName()} and ${serviceB.getName()}, and with request.test = ${(request as any).test}`
            );
          }
        }

        app.use(TestMiddleware);
        app.use(TestController);
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
        expect(() => app.container.get(TestMiddleware)).to.throw(Error, `Class "TestMiddleware" does not have a registered instance or not expected by container`);
        expect(resolvedClasses).to.not.include(Request);
        expect(resolvedClasses).to.not.include(Response);
        expect(resolvedClasses).to.not.include(TestMiddleware);
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

      it(`${httpMethod} method on route "/${methodName}/with-middleware" should match text and status code`, done => {

        request(app.getHttpServer().getInstance())
          [methodName](`/${methodName}/with-middleware`)
          .end((err: any, res: ChaiHttp.Response) => {

            expect(res).to.have.status(200);

            if (httpMethod == ActionHttpMethod.HEAD) {
              expect(res.text).equals('');
            } else {
              expect(res.text).to.be.eql(
                `${httpMethod} "/${methodName}/with-middleware" w/ prop dep ServiceA, method dep ServiceA and ServiceB, and with request.test = test`
              );
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
