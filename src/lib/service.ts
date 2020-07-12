import { setClassMetadata } from './metadata';

export function Service() {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'service');
  };
}
