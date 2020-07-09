import { HttpServer } from './http/server';
import { Config, ConfigData } from './config';

export class Application {

  protected httpServer?: HttpServer;

  private _config: Config;
  private _running: boolean = false;

  constructor(config: ConfigData) {
    this._config = new Config(config);
  }

  setHttpServer(httpServer: HttpServer) {
    if (this._running) {
      throw new Error(`Can't change http server. Application is already running.`);
    }
    this.httpServer = httpServer;
  }

  get config() {
    return this._config;
  }

  get running() {
    return this._running;
  }

  getHttpServer<T = HttpServer>(): T {
    return this.httpServer as any;
  }

  addController(controller: Function) {
    if (Reflect.getMetadata('exort:classType', controller) != 'controller') {
      throw new Error('Should be @Controller decorated');
    }

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
