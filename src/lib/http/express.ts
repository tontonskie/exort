import { HttpServer, HttpConfig, BaseRequest, BaseResponse } from './server';
import * as express from 'express';
import * as http from 'http';

export interface Request extends express.Request, BaseRequest {

}

export interface Response extends express.Response, BaseResponse {

}

export interface ExpressRequestHandler extends express.RequestHandler {

}

export class ExpressServer extends HttpServer {

  private server?: http.Server;
  protected instance: express.Application = express();

  constructor(config: HttpConfig) {
    super(config);
  }

  get(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.get(path, handler);
  }

  post(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.post(path, handler);
  }

  head(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.head(path, handler);
  }

  delete(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.delete(path, handler);
  }

  put(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.put(path, handler);
  }

  patch(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.patch(path, handler);
  }

  options(path: string | RegExp, handler: ExpressRequestHandler) {
    this.instance.options(path, handler);
  }

  getInstance() {
    return this.instance;
  }

  async start() {
    if (this.isRunning()) {
      throw new Error(`Can't call .start() twice. Http server is already running.`);
    }

    const server = http.createServer(this.instance);
    return new Promise<void>((resolve, reject) => {

      server.on('error', err => reject(err));
      server.on('listening', () => {
        this.server = server;
        resolve();
      });

      server.listen(this.config.port, this.config.hostname);
    });
  }

  isRunning() {
    return this.server ? true : false;
  }

  async end() {
    if (!this.server) {
      throw new Error('ExpressServer instance is not yet running');
    }

    return new Promise<void>((resolve, reject) => {
      this.server.close(err => {

        if (err) return reject(err);
        this.server = null;
        resolve();
      });
    });
  }
}
