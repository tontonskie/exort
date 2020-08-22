import { Container } from './container';
import { ProviderObject } from './provider';

export abstract class Application {

  protected _container: Container;
  protected providers: ProviderObject[] = [];

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
    for (let provider of this.providers) {
      if (typeof provider.install == 'function') {
        let result = provider.install(this);
        if (result instanceof Promise) {
          await result;
        }
      }
    }
  }

  abstract use(decoratedClassOrInstance: any): void;
}
