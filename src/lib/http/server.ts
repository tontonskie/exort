import { KeyValuePair, setClassMetadata, getClassMetadata } from '../metadata';

export interface HttpConfig {
  port: number;
  hostname: string;
}

export interface BaseRequest {

}

export interface BaseResponse {

}

export interface RequestHandler {
  (request: any, response: any, next: (err?: any) => void): void;
}

export interface HttpServerClass {
  new(httpConfig: HttpConfig): HttpServer;
}

export abstract class HttpServer {

  /**
   * instance of the abstracted http server. For ex. express
   */
  protected abstract instance: any;
  private _config: HttpConfig;

  constructor(config: HttpConfig) {
    this._config = config;
  }

  get config() {
    return this._config;
  }

  abstract getInstance(): any;
  abstract isRunning(): boolean;
  abstract async start(): Promise<void>;
  abstract async end(): Promise<void>;

  abstract get(path: string | RegExp, handler: RequestHandler): void;
  abstract post(path: string | RegExp, handler: RequestHandler): void;
  abstract head(path: string | RegExp, handler: RequestHandler): void;
  abstract delete(path: string | RegExp, handler: RequestHandler): void;
  abstract put(path: string | RegExp, handler: RequestHandler): void;
  abstract patch(path: string | RegExp, handler: RequestHandler): void;
  abstract options(path: string | RegExp, handler: RequestHandler): void;
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

export interface ControllerDetails {
  name: string;
  prefix?: string;
  routes?: KeyValuePair<string>;
  actions?: KeyValuePair<ActionDetails>;
}

function getDefaultControllerMetadata(controllerClass: Function): ControllerDetails {
  return { name: controllerClass.name };
}

function addRouteMetadata(controllerClass: Function, path: string, actionName: string, details: ActionDetails) {
  let metadata = getClassMetadata(controllerClass, 'controller') as ControllerDetails;
  if (!metadata) {
    metadata = getDefaultControllerMetadata(controllerClass);
  }

  metadata.routes = metadata.routes || {};
  metadata.routes[path || ''] = actionName;

  metadata.actions = metadata.actions || {};
  metadata.actions[actionName] = details;

  setClassMetadata(controllerClass, 'controller', metadata);
}

export function Controller(prefix?: string) {
  return (target: Function) => {
    setClassMetadata(target, 'classType', 'controller');

    let metadata = getClassMetadata(target, 'controller') as ControllerDetails;
    if (!metadata) {
      metadata = getDefaultControllerMetadata(target);
    }

    if (typeof prefix != 'undefined') {
      metadata.prefix = prefix;
    }

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
