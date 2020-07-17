export interface KeyValuePair<T = any> {
  [key: string]: T;
}

export const METADATA_PREFIX = 'exort:';
export type MetadataKey = 'classType' | 'controller' | 'service';

export function setClassMetadata(targetClass: Function, key: MetadataKey, value: any) {
  if (key == 'classType' && hasClassMetadata(targetClass, key)) {
    throw new Error(`${targetClass.name} can only have one metadata classType`);
  }
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, targetClass);
}

export function getClassMetadata(targetClass: Function, key: MetadataKey) {
  return Reflect.getMetadata(`${METADATA_PREFIX}${key}`, targetClass);
}

export function hasClassMetadata(targetClass: Function, key: MetadataKey) {
  return Reflect.hasMetadata(`${METADATA_PREFIX}${key}`, targetClass);
}

export function getParamTypes(targetClass: Function, methodName?: string): Function[] {
  return Reflect.getMetadata('design:paramtypes', targetClass, methodName) || [];
}
