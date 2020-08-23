import { Provider, Application } from '@exort/core';
import { MikroORM, MikroORMOptions, RequestContext } from 'mikro-orm';
import { Middleware, Request, Response, NextFunction } from '@exort/http';

export interface MikroORMConfig extends MikroORMOptions {

}

@Provider()
export class MikroORMProvider {

  private orm: MikroORM<any>;

  constructor(private config: MikroORMConfig) {

  }

  async install(app: Application) {
    this.orm = await MikroORM.init(this.config);
  }

  @Middleware()
  handle(request: Request, response: Response, next: NextFunction) {
    RequestContext.create(this.orm.em, next);
  }
}
