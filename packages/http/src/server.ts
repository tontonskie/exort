import { KeyValuePair, setClassMetadata, getClassMetadata, Container, ProviderDetails, _ } from '@exort/core';

export interface HttpConfig {
  port: number;
  hostname: string;
}

export abstract class Request {

}

export abstract class Response {

}

export function NextFunction(err?: any) {

}

export interface NextFunction {
  (err?: any): void;
}

export interface BaseRequestHandler {
  (request: Request, response: Response, next: NextFunction): void;
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
  abstract useMiddleware(container: Container, middlewareClass: Function, middleware: Object): void;
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

function applyPathPrefix(path: string) {
  path = path ? path : '/';
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

function addRouteMetadata(controllerClass: Function, path: string, actionName: string, details: ActionDetails) {
  const metadata: ControllerDetails = getClassMetadata(controllerClass, 'controller') || {};

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
    const metadata: ControllerDetails = getClassMetadata(target, 'controller') || {};
    metadata.name = target.name;
    metadata.prefix = applyPathPrefix(prefix);
    setClassMetadata(target, 'controller', metadata);
  };
}

export function Get(path?: string) {
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
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

export function Middleware() {
  return (target: Object, propertyName: string, descriptor: PropertyDescriptor) => {
    const metadata: ProviderDetails = getClassMetadata(target.constructor, 'provider') || {};
    metadata.middlewareMethodName = propertyName;
    setClassMetadata(target.constructor, 'provider', metadata);
  };
}
