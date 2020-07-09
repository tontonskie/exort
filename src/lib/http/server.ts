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

export function Controller() {
  return (target: Function) => {
    Reflect.defineMetadata('exort:classType', 'controller', target);
  };
}

export function Get(path?: string) {
  return (target: Object , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}

export function Post(path?: string) {
  return (target: Object , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}

export function Head(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}

export function Delete(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}

export function Put(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}

export function Patch(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}

export function Options(path?: string) {
  return (target: Function , propertyName: string, descriptor: PropertyDescriptor) => {

  };
}
