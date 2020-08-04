import { setClassMetadata, _ } from '../core';
import * as commander from 'commander';

export interface ExecutableCommand {
  build(program: Program): void;
  execute(...args: any[]): Promise<void> | void;
}

export interface CommandClass {
  new(...params: any[]): ExecutableCommand;
}

export function Command(name: string) {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'command');
    setClassMetadata(target, 'command', { name });
  };
}

export class Program extends commander.Command {

}
