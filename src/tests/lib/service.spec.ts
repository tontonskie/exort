import { Service, getClassMetadata } from '../../lib';
import { expect } from  '../utils';

describe('service', () => {
  describe('@Service()', () => {

    @Service()
    class TestService {

    }

    it('metadata classType metadata should be "service"', () => {
      expect(getClassMetadata(TestService, 'classType')).equals('service');
    });
  });
});
