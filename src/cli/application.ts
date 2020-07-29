import { Application, getClassMetadata } from '../core';

export class CLIApplication extends Application {

  private commands: Function[] = [];

  constructor() {
    super();
    this._container.set(CLIApplication, this);
  }

  addCommand(commandClass: Function) {
    if (getClassMetadata(commandClass, 'classType') != 'command') {
      throw new Error('Should be @Command decorated');
    }

    if (!getClassMetadata(commandClass, 'command')) {
      throw new Error(`${commandClass.name} does not have command metadata`);
    }

    this.commands.push(commandClass);
  }

  getCommands() {
    return this.commands;
  }

  start(commandName: string) {

  }
}

export function createCLIApplication(commandClasses: Function[]) {
  const app = new CLIApplication();
  for (let commandClass of commandClasses) {
    app.addCommand(commandClass);
  }
  return app;
}
