import { getClassMetadata, setClassMetadata, hasClassMetadata } from '@exort/core';
import { expect } from '../utils';

describe('core/metadata', () => {

  class TestClass {

  }

  describe('getClassMetadata()', () => {
    it('should return undefined for not existing metadata', () => {
      expect(getClassMetadata(TestClass, 'classType')).is.undefined;
    });
  });

  describe('setClassMetadata()', () => {
    it('should make getClassMetadata() return the value set', () => {
      setClassMetadata(TestClass, 'classType', 'injectable');
      expect(getClassMetadata(TestClass, 'classType')).equals('injectable');
    });
  });

  describe('hasClassMetadata()', () => {
    it('should return true for existing key', () => {
      expect(hasClassMetadata(TestClass, 'classType')).equals(true);
    });
    it('should return false for non existing key', () => {
      expect(hasClassMetadata(TestClass, 'controller')).equals(false);
    });
  });
});
