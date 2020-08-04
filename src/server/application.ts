import { HttpServer, HttpServerClass } from './http/server';
import { Application, getClassMetadata, _ } from '../core';

export class WebApplication extends Application {

  private httpServer?: HttpServer;
  private _running: boolean = false;

  constructor() {
    super();
    this._container.set(WebApplication, this);
  }

  get running() {
    return this._running;
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

  use(decoratedClassOrInstance: any) {
    if (this._running) {
      throw new Error('Application is already running');
    }

    if (!this.httpServer) {
      throw new Error('HttpServer is not set');
    }

    if (typeof decoratedClassOrInstance == 'function') {

      const classType = getClassMetadata(decoratedClassOrInstance, 'classType');
      if (classType == 'controller') {
        this.httpServer.useController(this._container, decoratedClassOrInstance);
      } else if (classType == 'middleware') {
        this.httpServer.useMiddleware(this._container, decoratedClassOrInstance, new decoratedClassOrInstance());
      } else {
        throw new Error(`Must be @Controller or @Middleware decorated`);
      }

    } else if (typeof decoratedClassOrInstance == 'object') {

      const objectClass = Object.getPrototypeOf(decoratedClassOrInstance).constructor;
      if (getClassMetadata(objectClass, 'classType') == 'middleware') {
        this.httpServer.useMiddleware(this._container, objectClass, decoratedClassOrInstance);
      } else {
        throw new Error(`${objectClass.name} class must be @Middleware decorated`);
      }

    } else {
      throw new Error(`Application.use() do not accept ${typeof decoratedClassOrInstance}`);
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

export function createWebApplication(httpServerClass: HttpServerClass) {
  const application = new WebApplication();
  application.setHttpServer(new httpServerClass());
  return application;
}
