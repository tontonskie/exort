import { Command, createCLIApplication, CLIApplication } from '..';
import { expect } from '../../core/tests/utils';

describe('cli/application', () => {

  @Command('test:first')
  class FirstTestCommand {

  }

  @Command('test:second')
  class SecondTestCommand {

  }

  const app = createCLIApplication([FirstTestCommand, SecondTestCommand]);
  describe('createCLIApplication()', () => {

    it(`should return an instance of ${CLIApplication.name} class`, () => {
      expect(app).to.be.instanceOf(CLIApplication);
    });

    it('should return an instance with 2 initial commands', () => {
      let commands = app.getCommands();
      expect(commands).to.include(FirstTestCommand);
      expect(commands).to.include(SecondTestCommand);
      expect(commands.length).equals(2);
    });
  });

  describe('CLIApplication', () => {

  });
});
