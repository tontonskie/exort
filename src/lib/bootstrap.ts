import { Config, ConfigData } from './config';
import { Application } from './application';
import { HttpServerClass } from './http/server';

export interface Bootstrap {
  provideHttpServerClass(): HttpServerClass;
  provideConfig(): ConfigData;
}

export interface BootstrapClass {
  new(...args: any[]): Bootstrap;
}

export function boot(bootstrapClass: BootstrapClass) {
  const bootstrap = new bootstrapClass();
  const config = new Config(bootstrap.provideConfig());
  const httpServer = new (bootstrap.provideHttpServerClass())(config.http);
  const application = new Application(config);
  application.setHttpServer(httpServer);
}
