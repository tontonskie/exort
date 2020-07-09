import { Controller } from '../../../lib';
import { expect } from  '../../utils';

describe('http/server', () => {

  describe('@Controller', () => {

    @Controller()
    class TestController {

    }

    it('exort:classType metadata should be "controller"', () => {
      expect(Reflect.getMetadata('exort:classType', TestController)).equals('controller');
    });
  });
});
