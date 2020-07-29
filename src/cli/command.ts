import { setClassMetadata, _ } from '../core';

export function Command(name: string) {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'command');
    setClassMetadata(target, 'command', { name });
  };
}
