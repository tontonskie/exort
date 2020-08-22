import { getClassMetadata, Provider } from '@exort/core';
import { expect } from '../utils';

describe('core/provider', () => {

  describe('@Provider()', () => {

    @Provider()
    class TestProvider {

    }

    it('metadata classType should be "provider"', () => {
      expect(getClassMetadata(TestProvider, 'classType')).equals('provider');
    });

    it('metadata provider should match', () => {
      expect(getClassMetadata(TestProvider, 'provider')).to.be.eql({ name: TestProvider.name });
    });
  });
});
