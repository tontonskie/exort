export interface KeyValuePair<T = any> {
  [key: string]: T;
}

export function setClassMetadata(targetClass: Function, key: string, value: any) {
  Reflect.defineMetadata(`exort:${key}`, value, targetClass);
}

export function getClassMetadata(targetClass: Function, key: string) {
  return Reflect.getMetadata(`exort:${key}`, targetClass);
}

export function hasClassMetadata(targetClass: Function, key: string) {
  return Reflect.hasMetadata(`exort:${key}`, targetClass);
}
