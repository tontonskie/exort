import { HttpServer, HttpServerClass, MiddlewareClass, MiddlewareConfig } from './http/server';
import { getClassMetadata } from './metadata';
import { Container } from './container';
import { _ } from './utils';

export class Application {

  protected httpServer?: HttpServer;

  private _running: boolean = false;
  private _container: Container;

  constructor() {
    this._container = new Container();
    this._container.set(Application, this);
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
      throw new Error('Cannot change http server. Application is already running.');
    }
    this.httpServer = httpServer;
    this.httpServer.setContainerBindings(this._container);
  }

  getHttpServer<T = HttpServer>(): T {
    return this.httpServer as any;
  }

  addController(controllerClass: Function) {
    if (this._running) {
      throw new Error('Cannot add controller while application is already running');
    }

    if (!this.httpServer) {
      throw new Error('HttpServer is not set');
    }

    if (getClassMetadata(controllerClass, 'classType') != 'controller') {
      throw new Error('Should be @Controller decorated');
    }

    this.httpServer.useController(this._container, controllerClass);
  }

  addControllers(controllerClasses: Function[]) {
    for (let controllerClass of controllerClasses) {
      this.addController(controllerClass);
    }
  }

  addMiddleware(middlewareClasses: MiddlewareClass | MiddlewareConfig | (MiddlewareConfig | MiddlewareClass)[]) {
    if (this._running) {
      throw new Error('Cannot add middleware while application is already running');
    }

    if (!this.httpServer) {
      throw new Error('HttpServer is not set');
    }

    if (!Array.isArray(middlewareClasses)) {
      middlewareClasses = [middlewareClasses];
    }

    for (let middlewareClass of middlewareClasses) {
      this.httpServer.useMiddleware(this._container, middlewareClass);
    }
  }

  async start(port: number, hostname?: string) {
    if (this._running) {
      throw new Error('Cannot call .start() twice. Application is already running');
    }
    await this.httpServer.start(port, hostname);
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

export function createApplication(httpServerClass: HttpServerClass) {
  const application = new Application();
  application.setHttpServer(new httpServerClass());
  return application;
}
