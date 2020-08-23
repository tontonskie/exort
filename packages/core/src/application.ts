import { Container } from './container';
import { ProviderObject, ProviderMap } from './provider';

export abstract class Application {

  protected _container: Container;
  protected providers: ProviderMap[] = [];

  constructor() {
    this._container = new Container();
  }

  get container() {
    return this._container;
  }

  make<T = Object>(targetClass: Function) {
    return this._container.resolve<T>(targetClass);
  }

  protected async prepare() {
    for (let providerMap of this.providers) {
      if (typeof providerMap.providerObject.install == 'function') {
        let result = providerMap.providerObject.install(this);
        if (result instanceof Promise) {
          await result;
        }
      }
    }
  }

  abstract use(decoratedClassOrInstance: any): void;
  protected abstract addProvider(providerClass: Function, providerObject: ProviderObject): void;
}
