import { Controller, ActionHttpMethod, Middleware, Handler } from '../..';
import { getClassMetadata, _ } from '../../../core';
import * as httpServer from '../../http/server';
import { expect } from '../../../core/tests/utils';

describe('server/http/server', () => {

  describe('enum ActionHttpMethod', () => {
    it('should match ["GET", "POST", "HEAD", "DELETE", "PUT", "PATCH", "OPTIONS"]', () => {
      expect(Object.values(ActionHttpMethod)).to.be.eql(['GET', 'POST', 'HEAD', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']);
    });
  });

  describe('@Controller()', () => {

    @Controller()
    class TestController {

    }

    it('metadata classType metadata should be "controller"', () => {
      expect(getClassMetadata(TestController, 'classType')).equals('controller');
    });

    it('metadata controller should match', () => {
      expect(getClassMetadata(TestController, 'controller')).to.be.eql({
        name: TestController.name,
        prefix: '/'
      });
    });
  });

  describe(`@Controller(prefix)`, () => {

    @Controller('test-prefix')
    class TestController {

    }

    it('metadata classType metadata should be "controller"', () => {
      expect(getClassMetadata(TestController, 'classType')).equals('controller');
    });

    it('metadata controller should match', () => {
      expect(getClassMetadata(TestController, 'controller')).to.be.eql({
        name: TestController.name,
        prefix: '/test-prefix'
      });
    });
  });

  Object.values(ActionHttpMethod).forEach(httpMethod => {
    const decoratorName = _.capitalize(httpMethod);
    const HttpMethodDecorator: Function = httpServer[decoratorName];

    describe(`@${decoratorName}()`, () => {

      @Controller()
      class TestController {

        @HttpMethodDecorator()
        testMethod() {

        }
      }

      it('metadata classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('metadata controller should match', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          prefix: '/',
          routes: [{
            path: '/',
            action: 'testMethod'
          }],
          actions: {
            'testMethod': {
              method: httpMethod
            }
          }
        });
      });
    });

    describe(`@${decoratorName}(path)`, () => {

      @Controller()
      class TestController {

        @HttpMethodDecorator('test-route')
        testMethod() {

        }
      }

      it('metadata classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('metadata controller should match', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          prefix: '/',
          routes: [{
            path: '/test-route',
            action: 'testMethod'
          }],
          actions: {
            'testMethod': {
              method: httpMethod
            }
          }
        });
      });
    });

    describe(`@Controller(prefix) and @${decoratorName}(path)`, () => {

      @Controller('test-controller')
      class TestController {

        @HttpMethodDecorator('test-route')
        testMethod() {

        }
      }

      it('metadata classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('metadata controller should match', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          prefix: '/test-controller',
          routes: [{
            path: '/test-route',
            action: 'testMethod'
          }],
          actions: {
            'testMethod': {
              method: httpMethod
            }
          }
        });
      });
    });

    describe(`@Controller(prefix) and 3 @${decoratorName}(path)`, () => {

      @Controller('test-controller')
      class TestController {

        @HttpMethodDecorator('test-route/test')
        firstMethod() {

        }

        @HttpMethodDecorator('test-route/test2nd')
        secondMethod() {

        }

        @HttpMethodDecorator('test-route')
        thirdMethod() {

        }
      }

      it('metadata classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('metadata controller should match the order of routes', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          prefix: '/test-controller',
          routes: [
            {
              path: '/test-route/test',
              action: 'firstMethod'
            },
            {
              path: '/test-route/test2nd',
              action: 'secondMethod'
            },
            {
              path: '/test-route',
              action: 'thirdMethod'
            }
          ],
          actions: {
            'firstMethod': {
              method: httpMethod
            },
            'secondMethod': {
              method: httpMethod
            },
            'thirdMethod': {
              method: httpMethod
            }
          }
        });
      });
    });
  });

  describe('@Middleware()', () => {

    @Middleware()
    class TestMiddleware {

    }

    it('metadata classType should be "middleware"', () => {
      expect(getClassMetadata(TestMiddleware, 'classType')).equals('middleware');
    });

    it('metadata middleware should match', () => {
      expect(getClassMetadata(TestMiddleware, 'middleware')).to.be.eql({ name: TestMiddleware.name });
    });
  });

  describe('@Handler()', () => {

    @Middleware()
    class TestMiddleware {

      @Handler()
      handle() {

      }
    }

    it('metadata classType should be "middleware"', () => {
      expect(getClassMetadata(TestMiddleware, 'classType')).equals('middleware');
    });

    it('metadata middleware should match', () => {
      expect(getClassMetadata(TestMiddleware, 'middleware')).to.be.eql({
        name: TestMiddleware.name,
        handlerMethodName: 'handle'
      });
    });
  });
});
