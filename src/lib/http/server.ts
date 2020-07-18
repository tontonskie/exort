import { KeyValuePair, setClassMetadata, getClassMetadata } from '../metadata';
import { Container } from '../container';

export interface HttpConfig {
  port: number;
  hostname: string;
}

export interface BaseRequest {

}

export interface BaseResponse {

}

export interface BaseNextFunction {
  (err?: any): void;
}

export interface BaseRequestHandler {
  (request: BaseRequest, response: BaseResponse, next: BaseNextFunction): void;
}

export interface HttpServerClass {
  new(): HttpServer;
}

export abstract class HttpServer {

  /**
   * instance of the abstracted http server. For ex. express
   */
  protected abstract instance: any;

  abstract getInstance(): any;
  abstract isRunning(): boolean;
  abstract async start(port: number, hostname?: string): Promise<void>;
  abstract async end(): Promise<void>;

  abstract get(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract post(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract head(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract delete(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract put(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract patch(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract options(path: string | RegExp, handler: BaseRequestHandler): void;
  abstract all(path: string | RegExp, handler: BaseRequestHandler): void;

  abstract setContainerBindings(container: Container): void;
  abstract useController(container: Container, controllerClass: Function): void;
  abstract useMiddleware(container: Container, middlewareClass: MiddlewareClass): void;
}

export enum ActionHttpMethod {
  GET = 'GET',
  POST = 'POST',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS'
}

export interface ActionDetails {
  method: ActionHttpMethod;
}

export interface RouteAction {
  path: string;
  action: string;
}

export interface ControllerDetails {
  name: string;
  prefix: string;
  routes?: RouteAction[];
  actions?: KeyValuePair<ActionDetails>;
}

function getDefaultControllerMetadata(controllerClass: Function): ControllerDetails {
  return {
    name: controllerClass.name,
    prefix: '/'
  };
}

function applyPathPrefix(path: string) {
  path = path ? path : '/';
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

function addRouteMetadata(controllerClass: Function, path: string, actionName: string, details: ActionDetails) {
  let metadata: ControllerDetails = getClassMetadata(controllerClass, 'controller');
  if (!metadata) {
    metadata = getDefaultControllerMetadata(controllerClass);
  }

  metadata.actions = metadata.actions || {};
  if (metadata.actions[actionName]) {
    throw new Error('Only one http method decorator can be applied to a controller method / action');
  }

  metadata.actions[actionName] = details;
  metadata.routes = metadata.routes || [];
  metadata.routes.push({
    path: applyPathPrefix(path),
    action: actionName
  });

  setClassMetadata(controllerClass, 'controller', metadata);
}

export function Controller(prefix?: string) {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'controller');

    let metadata: ControllerDetails = getClassMetadata(target, 'controller');
    if (!metadata) {
      metadata = getDefaultControllerMetadata(target);
    }

    metadata.prefix = applyPathPrefix(prefix);
    setClassMetadata(target, 'controller', metadata);
  };
}

export function Get(path?: string) {
  return (target: Object , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.GET
      }
    );
  };
}

export function Post(path?: string) {
  return (target: Object , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.POST
      }
    );
  };
}

export function Head(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.HEAD
      }
    );
  };
}

export function Delete(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.DELETE
      }
    );
  };
}

export function Put(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.PUT
      }
    );
  };
}

export function Patch(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.PATCH
      }
    );
  };
}

export function Options(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {
    addRouteMetadata(
      target.constructor,
      path,
      propertyName,
      {
        method: ActionHttpMethod.OPTIONS
      }
    );
  };
}

export interface CallableMiddleware {
  handle(...params: any[]): Promise<void> | void;
}

export interface MiddlewareClass {
  new(...params: any[]): CallableMiddleware;
}

export interface MiddlewareDetails {
  name: string;
}

export function Middleware() {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'middleware');

    let metadata: MiddlewareDetails = getClassMetadata(target, 'middleware');
    if (!metadata) {
      metadata = { name: target.name };
    }

    setClassMetadata(target, 'middleware', metadata);
  };
}
