import { HttpServer } from './http/server';
import { Config, ConfigData } from './config';
import { getClassMetadata } from './metadata';
import { Container } from './container';
import { _ } from './utils';

export class Application {

  protected httpServer?: HttpServer;

  private _config: Config;
  private _running: boolean = false;
  private _container: Container;

  constructor(config: ConfigData) {
    this._config = new Config(config);
    this._container = new Container();
    this._container.set(Application, this);
  }

  get config() {
    return this._config;
  }

  get running() {
    return this._running;
  }

  get container() {
    return this._container;
  }

  make<T = Object>(targetClass: Function) {
    return this._container.resolve<T>(targetClass);
  }

  setHttpServer(httpServer: HttpServer) {
    if (this._running) {
      throw new Error(`Can't change http server. Application is already running.`);
    }
    this.httpServer = httpServer;
    this.httpServer.setContainerBindings(this._container);
  }

  getHttpServer<T = HttpServer>(): T {
    return this.httpServer as any;
  }

  addController(controllerClass: Function) {
    if (this._running) {
      throw new Error(`Can't add controller while application is already running`);
    }

    if (!this.httpServer) {
      throw new Error('HttpServer is not set');
    }

    if (getClassMetadata(controllerClass, 'classType') != 'controller') {
      throw new Error('Should be @Controller decorated');
    }

    this.httpServer.handleController(this._container, controllerClass);
  }

  async start() {
    if (this._running) {
      throw new Error(`Can't call .start() twice. Application is already running`);
    }
    await this.httpServer.start();
    this._running = true;
  }

  async end() {
    if (!this._running) {
      throw new Error(`Application is not yet running`);
    }
    await this.httpServer.end();
    this._running = false;
  }
}
