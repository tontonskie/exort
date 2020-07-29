import { Command } from '..';
import { getClassMetadata } from '../../core';
import { expect } from '../../core/tests/utils';

describe('cli/command', () => {
  describe('@Command()', () => {

    @Command('test')
    class TestCommand {

    }

    it('metadata classType metadata should be "command"', () => {
      expect(getClassMetadata(TestCommand, 'classType')).equals('command');
    });

    it('metadata command should match', () => {
      expect(getClassMetadata(TestCommand, 'command')).to.be.eql({ name: 'test' });
    });
  });
});
