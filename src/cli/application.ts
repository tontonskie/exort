import { Application, getClassMetadata } from '../core';
import { ExecutableCommand, Program } from './command';
import commander = require('commander');

export class CLIApplication extends Application {

  private program: Program;

  constructor() {
    super();
    this.program = new Program();
    this._container.set(CLIApplication, this);
  }

  use(commandClass: Function) {
    if (getClassMetadata(commandClass, 'classType') != 'command') {
      throw new Error('Should be @Command decorated');
    }

    const metadata = getClassMetadata(commandClass, 'command');
    if (!metadata) {
      throw new Error(`${commandClass.name} does not have command metadata`);
    }

    const program = this.program.command(metadata.name)
    const commandInstance = this.make<ExecutableCommand>(commandClass);
    if (typeof commandInstance.execute != 'function') {
      throw new Error(`${commandClass.name} must have an execute method`);
    }

    if (typeof commandInstance.build == 'function') {
      commandInstance.build(program);
    }

    program.action(commandInstance.execute.bind(commandInstance));
  }

  getCommands() {
    return this.program.commands;
  }

  async start(argv: string[], options?: commander.ParseOptions) {
    await this.program.parseAsync(argv, options);
  }
}

export function createCLIApplication(commandClasses: Function[]) {
  const app = new CLIApplication();
  for (let commandClass of commandClasses) {
    app.use(commandClass);
  }
  return app;
}
