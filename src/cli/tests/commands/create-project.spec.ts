import { createCLIApplication, CreateProjectCommand } from '../..';
import { expect } from '../../../core/tests/utils';
import { promises as fs } from 'fs';

describe('commands/create-project', () => {

  const projectName = 'testproject';
  const app = createCLIApplication([CreateProjectCommand]);
  describe('CreateProjectCommand', () => {

    before(async () => {
      await app.start(['create:project', projectName], { from: 'user' });
    });

    it(`should create folder ${projectName}`, () => {
      return expect(fs.access(`./${projectName}`)).to.be.eventually.fulfilled;
    });

    it(`should create folder ${projectName}/src`, () => {
      return expect(fs.access(`./${projectName}/src`)).to.be.eventually.fulfilled;
    });

    it(`should create folder ${projectName}/src/controllers`, () => {
      return expect(fs.access(`./${projectName}/src/controllers`)).to.be.eventually.fulfilled;
    });

    it(`should create folder ${projectName}/src/middleware`, () => {
      return expect(fs.access(`./${projectName}/src/middleware`)).to.be.eventually.fulfilled;
    });

    it(`should create folder ${projectName}/src/services`, () => {
      return expect(fs.access(`./${projectName}/src/services`)).to.be.eventually.fulfilled;
    });

    it(`${projectName}/package.json content should match`, async () => {
      let content = JSON.parse(await fs.readFile(`./${projectName}/package.json`, 'utf8'));
      expect(content).to.be.eql({
        name: projectName,
        version: '0.0.1',
        description: '',
        scripts: {
          build: 'exort build src/**/*.ts',
          'build:watch': 'exort build src/**/*.ts --watch'
        },
        dependencies: {
          exort: '0.0.1'
        },
        devDependencies: {
          typescript: '^3.9.5'
        }
      });
    });

    it(`${projectName}/src/tsconfig.json content should match`, async () => {
      let content = JSON.parse(await fs.readFile(`./${projectName}/src/tsconfig.json`, 'utf8'));
      expect(content).to.be.eql({
        compilerOptions: {
          module: 'commonjs',
          declaration: true,
          noImplicitAny: false,
          skipLibCheck: true,
          suppressImplicitAnyIndexErrors: true,
          noUnusedLocals: true,
          importHelpers: true,
          removeComments: false,
          noLib: false,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          target: 'es2017',
          sourceMap: true,
          allowJs: false,
          strict: true,
          strictNullChecks: false,
          outDir: 'dist',
          rootDir: 'src'
        },
        include: [
          'src/**/*.ts'
        ],
        exclude: [
          'node_modules'
        ]
      });
    });

    it(`${projectName}/src/controllers/home.ts content should match`, async () => {
      let content = await fs.readFile(`./${projectName}/src/controllers/home.ts`, 'utf8');
      expect(content).to.be.eql([
        "import { Controller, Get } from 'exort/server';\n",
        "import { Request, Response } from 'exort/server/http/express';\n",
        '\n',
        '@Controller()\n',
        'export class HomeController {\n',
        '\n',
        '  @Get()\n',
        '  index(request: Request, response: Response) {\n',
        "    res.send('hello world');\n",
        '  }\n',
        '}\n'
      ].join(''));
    });

    it(`${projectName}/src/app.ts content should match`, async () => {
      let content = await fs.readFile(`./${projectName}/src/app.ts`, 'utf8');
      expect(content).to.be.eql([
        "import { createWebApplication } from 'exort/server';\n",
        "import { Express } from 'exort/server/http/express';\n",
        "import { HomeController } from './controllers/home';\n",
        '\n',
        'const app = createWebApplication(Express);\n',
        '\n',
        'app.use(HomeController);\n',
        '\n',
        'app.start(3000);\n'
      ].join(''));
    });

    after(async () => {
      await fs.rmdir(`./${projectName}`, { recursive: true });
    });
  });
});
