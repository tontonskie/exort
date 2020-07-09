import { Controller, getClassMetadata, ActionHttpMethod, _ } from '../../../lib';
import * as httpServer from '../../../lib/http/server';
import { expect } from  '../../utils';

describe('http/server', () => {

  describe('enum ActionHttpMethod', () => {
    it('should match ["GET", "POST", "HEAD", "DELETE", "PUT", "PATCH", "OPTIONS"]', () => {
      expect(Object.values(ActionHttpMethod)).to.be.eql(['GET', 'POST', 'HEAD', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']);
    });
  });

  describe('@Controller()', () => {

    @Controller()
    class TestController {

    }

    it('exort:classType metadata should be "controller"', () => {
      expect(getClassMetadata(TestController, 'classType')).equals('controller');
    });

    it('exort:controller should match', () => {
      expect(getClassMetadata(TestController, 'controller')).to.be.eql({ name: TestController.name });
    });
  });

  describe(`@Controller(prefix)`, () => {

    @Controller('test-prefix')
    class TestController {

    }

    it('exort:classType metadata should be "controller"', () => {
      expect(getClassMetadata(TestController, 'classType')).equals('controller');
    });

    it('exort:controller should match', () => {
      expect(getClassMetadata(TestController, 'controller')).to.be.eql({
        name: TestController.name,
        prefix: 'test-prefix'
      });
    });
  });

  Object.values(ActionHttpMethod).forEach(httpMethod => {
    const decoratorName = _.capitalize(httpMethod);
    const HttpMethodDecorator = httpServer[decoratorName] as Function;

    describe(`@${decoratorName}()`, () => {

      @Controller()
      class TestController {

        @HttpMethodDecorator()
        testMethod() {

        }
      }

      it('exort:classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('exort:controller should match', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          routes: {
            '': 'testMethod'
          },
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

      it('exort:classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('exort:controller should match', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          routes: {
            'test-route': 'testMethod'
          },
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

      it('exort:classType should be "controller"', () => {
        expect(getClassMetadata(TestController, 'classType')).equals('controller');
      });

      it('exort:controller should match', () => {
        expect(getClassMetadata(TestController, 'controller')).to.be.eql({
          name: TestController.name,
          prefix: 'test-controller',
          routes: {
            'test-route': 'testMethod'
          },
          actions: {
            'testMethod': {
              method: httpMethod
            }
          }
        });
      });
    });
  });
});
