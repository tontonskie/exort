import { Command, createCLIApplication, CLIApplication } from '..';
import { expect } from '../../core/tests/utils';

describe('cli/application', () => {

  @Command('test:first')
  class FirstTestCommand {

    execute() {

    }
  }

  @Command('test:second')
  class SecondTestCommand {

    execute() {

    }
  }

  const app = createCLIApplication([FirstTestCommand, SecondTestCommand]);
  describe('createCLIApplication()', () => {

    it(`should return an instance of ${CLIApplication.name} class`, () => {
      expect(app).to.be.instanceOf(CLIApplication);
    });

    it('should return an instance with 2 initial commands', () => {
      let commands = app.getCommands().map(command => command.name());
      expect(commands).to.include('test:first');
      expect(commands).to.include('test:second');
      expect(commands.length).equals(2);
    });
  });

  describe('CLIApplication', () => {

    @Command('test:third')
    class ThirdTestCommand {

      execute() {

      }
    }

    it('.addCommand() should resolve the command class and add to commands', () => {
      app.use(ThirdTestCommand);
      expect(app.getCommands().map(command => command.name())).to.include('test:third');
      expect(app.container.get(ThirdTestCommand)).to.be.instanceOf(ThirdTestCommand);
    });

    it('.getCommands() should return the added commands', () => {
      let commands = app.getCommands().map(command => command.name());
      expect(commands).to.include('test:first');
      expect(commands).to.include('test:second');
      expect(commands).to.include('test:third');
      expect(commands.length).equals(3);
    });
  });
});
