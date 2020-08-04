import { Container } from './container';

export abstract class Application {

  protected _container: Container;

  constructor() {
    this._container = new Container();
  }

  get container() {
    return this._container;
  }

  make<T = Object>(targetClass: Function) {
    return this._container.resolve<T>(targetClass);
  }

  abstract use(decoratedClassOrInstance: any): void;
}
