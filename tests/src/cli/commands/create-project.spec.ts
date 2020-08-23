import { createCLIApplication, CreateProjectCommand } from '@exort/cli';
import { promises as fs } from 'fs';
import { expect } from '../../utils';

describe('commands/create-project', () => {

  const projectName = 'testproject';
  const app = createCLIApplication([CreateProjectCommand]);
  describe('CreateProjectCommand', () => {

    before(async () => {
      await app.start(['create:project', projectName], { from: 'user' });
    });

    it(`should create folder ${projectName}`, async () => {
      let promise = fs.stat(`./${projectName}`);
      await expect(promise).to.be.eventually.fulfilled;
      expect((await promise).isDirectory()).equals(true);
    });

    it(`should create folder ${projectName}/src`, async () => {
      let promise = fs.stat(`./${projectName}/src`);
      await expect(promise).to.be.eventually.fulfilled;
      expect((await promise).isDirectory()).equals(true);
    });

    it(`should create folder ${projectName}/src/controllers`, async () => {
      let promise = fs.stat(`./${projectName}/src/controllers`);
      await expect(promise).to.be.eventually.fulfilled;
      expect((await promise).isDirectory()).equals(true);
    });

    it(`should create folder ${projectName}/src/middleware`, async () => {
      let promise = fs.stat(`./${projectName}/src/middleware`);
      await expect(promise).to.be.eventually.fulfilled;
      expect((await promise).isDirectory()).equals(true);
    });

    it(`should create folder ${projectName}/src/services`, async () => {
      let promise = fs.stat(`./${projectName}/src/services`);
      await expect(promise).to.be.eventually.fulfilled;
      expect((await promise).isDirectory()).equals(true);
    });

    it(`${projectName}/package.json content should match`, async () => {
      let content = JSON.parse(await fs.readFile(`./${projectName}/package.json`, 'utf8'));
      expect(content).to.be.eql({
        name: projectName,
        version: '0.0.1',
        description: '',
        scripts: {
          clean: 'rm -rf dist',
          build: 'tsc',
          'build:watch': 'tsc --watch'
        },
        dependencies: {
          '@exort/core': '0.0.1',
          '@exort/express': '0.0.1',
          '@exort/http': '0.0.1'
        },
        devDependencies: {
          typescript: '^4.0.2'
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
        "import { Controller, Get } from '@exort/http';\n",
        "import { Request, Response } from '@exort/express';\n",
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
        "import { createWebApplication } from '@exort/http';\n",
        "import { Express } from '@exort/express';\n",
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
