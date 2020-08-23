import { HttpServer, BaseRequestHandler, BaseRequest, BaseResponse, ControllerDetails, BaseNextFunction } from '@exort/http';
import { getClassMetadata, Container, _, ProviderDetails } from '@exort/core';
import express from 'express';
import * as http from 'http';

export interface RequestHandler extends express.RequestHandler, BaseRequestHandler {

}

// Just a proxy class
export abstract class Request {

}

export interface Request extends express.Request, BaseRequest {

}

// Just a proxy class
export abstract class Response {

}

export interface Response extends express.Response, BaseResponse {

}

export function NextFunction() {

}

export interface NextFunction extends express.NextFunction, BaseNextFunction {

}

export class Express extends HttpServer {

  private server?: http.Server;
  protected instance: express.Application = express();

  get(path: string | RegExp, handler: RequestHandler) {
    this.instance.get(path, handler);
  }

  post(path: string | RegExp, handler: RequestHandler) {
    this.instance.post(path, handler);
  }

  head(path: string | RegExp, handler: RequestHandler) {
    this.instance.head(path, handler);
  }

  delete(path: string | RegExp, handler: RequestHandler) {
    this.instance.delete(path, handler);
  }

  put(path: string | RegExp, handler: RequestHandler) {
    this.instance.put(path, handler);
  }

  patch(path: string | RegExp, handler: RequestHandler) {
    this.instance.patch(path, handler);
  }

  options(path: string | RegExp, handler: RequestHandler) {
    this.instance.options(path, handler);
  }

  all(path: string | RegExp, handler: RequestHandler) {
    this.instance.all(path, handler);
  }

  setContainerBindings(container: Container) {
    container.set(Express, this);
  }

  useMiddleware(container: Container, middlewareClass: Function, middleware: Object) {
    const metadata: ProviderDetails = getClassMetadata(middlewareClass, 'provider');
    if (_.isEmpty(metadata)) {
      throw new Error(`${middlewareClass.name} does not have provider metadata`);
    }

    if (!metadata.middlewareMethodName || typeof middleware[metadata.middlewareMethodName] != 'function') {
      throw new Error(`${middlewareClass.name} does not have valid middleware`);
    }

    const dependencies = [];
    const paramTypes = Reflect.getMetadata('design:paramtypes', middlewareClass.prototype, metadata.middlewareMethodName);
    if (paramTypes) {

      for (let i in paramTypes) {

        if (['controller', 'provider'].includes(getClassMetadata(paramTypes[i], 'classType'))) {
          throw new Error(`Cannot use ${paramTypes[i].name} as dependency`);
        }

        if (!([Request, Response, Function].includes(paramTypes[i]))) {
          dependencies.push(container.resolve(paramTypes[i]));
        } else {
          dependencies.push(paramTypes[i]);
        }
      }
    }

    this.instance.use(this.callAction.bind(this, middleware, metadata.middlewareMethodName, dependencies));
  }

  useController(container: Container, controllerClass: Function) {
    const metadata: ControllerDetails = getClassMetadata(controllerClass, 'controller');
    if (_.isEmpty(metadata)) {
      throw new Error(`${controllerClass.name} does not have controller metadata`);
    }

    const controller = container.resolve(controllerClass);
    if (!controller) {
      throw new Error(`Cannot resolve ${controllerClass.name} controller class`);
    }

    if (!_.isEmpty(metadata.routes)) {

      const router = express.Router();
      for (let route of metadata.routes) {
        if (typeof controller[route.action] != 'function') {
          throw new Error(`${controllerClass.name} does not have "${route.action}" method`);
        }

        const dependencies = [];
        const routerMethodName = metadata.actions[route.action].method.toLowerCase();
        const paramTypes = Reflect.getMetadata('design:paramtypes', controllerClass.prototype, route.action);
        if (paramTypes) {
          for (let i in paramTypes) {

            if (['controller', 'provider'].includes(getClassMetadata(paramTypes[i], 'classType'))) {
              throw new Error(`Cannot use ${paramTypes[i].name} as dependency`);
            }

            if (!([Request, Response, Function].includes(paramTypes[i]))) {
              dependencies.push(container.resolve(paramTypes[i]));
            } else {
              dependencies.push(paramTypes[i]);
            }
          }
        }

        router[routerMethodName](route.path, this.callAction.bind(this, controller, route.action, dependencies));
      }

      this.instance.use(metadata.prefix, router);
    }
  }

  callAction(instance: Object, action: string, dependencies: Object[] | null, request: Request, response: Response, next: express.NextFunction) {
    if (dependencies === null) {
      instance[action].apply(instance, [request, response, next]);
      return;
    }

    const ensuredDependencies = [];
    for (let i in dependencies) {
      if (typeof dependencies[i] == 'function') {

        if (dependencies[i] == Request) {
          ensuredDependencies.push(request);
        } else if (dependencies[i] == Response) {
          ensuredDependencies.push(response);
        } else if (dependencies[i] == Function) {
          ensuredDependencies.push(next);
        } else {
          ensuredDependencies.push(null);
        }

      } else {
        ensuredDependencies.push(dependencies[i]);
      }
    }

    instance[action].apply(instance, ensuredDependencies);
  }

  getInstance() {
    return this.instance;
  }

  async start(port: number, hostname?: string) {
    if (this.isRunning()) {
      throw new Error('Cannot call .start() twice. Http server is already running.');
    }

    const server = http.createServer(this.instance);
    return new Promise<void>((resolve, reject) => {

      server.on('error', err => reject(err));
      server.on('listening', () => {
        this.server = server;
        resolve();
      });

      server.listen(port, hostname);
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
