import { setClassMetadata, getClassMetadata } from './metadata';
import { Application } from './application';

export interface ProviderDetails {
  name: string;
  middlewareMethodName?: string;
}

export interface ProviderObject {
  install?(app: Application): Promise<void> | void;
}

export function Provider() {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'provider');
    const metadata: ProviderDetails = getClassMetadata(target, 'provider') || {};
    metadata.name = target.name;
    setClassMetadata(target, 'provider', metadata);
  };
}
