import { DBConfig } from './database';
import { HttpConfig } from './http/server';

export interface ConfigData {
  environment: string;
  http: HttpConfig;
  database: DBConfig;
}

export class Config {

  constructor(private data: ConfigData) {}

  get environment() {
    return this.data.environment;
  }

  get database() {
    return this.data.database;
  }

  get http() {
    return this.data.http;
  }
}
