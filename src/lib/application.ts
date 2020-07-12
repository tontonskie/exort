import { HttpServer } from './http/server';
import { Config, ConfigData } from './config';
import { getClassMetadata, getClassParamTypes } from './metadata';
import { _ } from './utils';

export class DependencyContainer {

  private classes = new Map<Function, any>();

  waitForInstance(targetClass: Function) {
    if (this.classes.has(targetClass)) {
      throw new Error(`Container is already waiting for ${targetClass.name} instance`);
    }
    this.classes.set(targetClass, true);
  }

  isWaitingForInstance(targetClass: Function) {
    return this.classes.get(targetClass) === true;
  }

  getWaitingClassNames() {
    let waitingClasses: string[] = [];
    this.classes.forEach((instance, waitingClass) => {
      if (instance === true) {
        waitingClasses.push(waitingClass.name);
      }
    });
    return waitingClasses;
  }

  hasInstance(targetClass: Function) {
    return this.classes.get(targetClass) instanceof targetClass;
  }

  hasRegisteredInstance(targetClass: Function) {
    let instance = this.classes.get(targetClass);
    if (!instance || instance === true) {
      return false;
    }
    return true;
  }

  registerInstance(targetClass: Function, instance: Object) {
    this.classes.set(targetClass, instance);
  }

  getRegisteredInstance(targetClass: Function) {
    let instance = this.classes.get(targetClass);
    if (!instance || instance === true) {
      throw new Error(`Class "${targetClass.name}" doesn't have a registered instance or not expected by container`);
    }
    return instance;
  }
}

export class Application {

  protected httpServer?: HttpServer;

  private _config: Config;
  private _running: boolean = false;
  private _container: DependencyContainer;

  constructor(config: ConfigData) {
    this._config = new Config(config);
    this._container = new DependencyContainer();
    this._container.registerInstance(Application, this);
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

  setHttpServer(httpServer: HttpServer) {
    if (this._running) {
      throw new Error(`Can't change http server. Application is already running.`);
    }
    this.httpServer = httpServer;
  }

  getHttpServer<T = HttpServer>(): T {
    return this.httpServer as any;
  }

  addController(controllerClass: Function) {
    if (getClassMetadata(controllerClass, 'classType') != 'controller') {
      throw new Error('Should be @Controller decorated');
    }
  }

  make(targetClass: Function) {
    if (this._container.hasRegisteredInstance(targetClass)) {
      return this._container.getRegisteredInstance(targetClass);
    }

    if (!this._container.isWaitingForInstance(targetClass)) {
      this._container.waitForInstance(targetClass);
    } else {
      throw new Error(`Circular dependency ${this._container.getWaitingClassNames().join(' -> ')} -> ${targetClass.name}`);
    }

    const dependencies: Object[] = [];
    const paramTypes = getClassParamTypes(targetClass);
    if (!_.isEmpty(paramTypes)) {
      for (let ParamTypeClass of paramTypes) {
        if (typeof ParamTypeClass != 'function') {
          throw new Error(`Invalid parameter type: ${typeof ParamTypeClass}`);
        }
        dependencies.push(this.make(ParamTypeClass));
      }
    }

    const instance = Reflect.construct(targetClass, dependencies);
    this._container.registerInstance(targetClass, instance);
    return instance;
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
