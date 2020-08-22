import { Service, getClassMetadata } from '@exort/core';
import { expect } from  '../utils';

describe('core/service', () => {
  describe('@Service()', () => {

    @Service()
    class TestService {

    }

    it('metadata classType metadata should be "service"', () => {
      expect(getClassMetadata(TestService, 'classType')).equals('service');
    });
  });
});
