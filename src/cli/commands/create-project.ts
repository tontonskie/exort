import { Command } from '../command';
import { promises as fs } from 'fs';

@Command('create:project <name>')
export class CreateProjectCommand {

  async create(name: string) {
    const dir = `./${name}`;
    await fs.mkdir(dir);
    await fs.mkdir(`${dir}/src`);
    await fs.mkdir(`${dir}/src/controllers`);
    await fs.mkdir(`${dir}/src/middleware`);
    await fs.mkdir(`${dir}/src/services`);

    let packageJsonContent = {
      name,
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
    };
    await fs.writeFile(`${dir}/package.json`, `${JSON.stringify(packageJsonContent, null, 2)}\n`);

    let tsConfigContent = {
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
    };
    await fs.writeFile(`${dir}/src/tsconfig.json`, `${JSON.stringify(tsConfigContent, null, 2)}\n`);

    await fs.writeFile(
      `${dir}/src/controllers/home.ts`,
      [
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
      ].join('')
    );

    await fs.writeFile(
      `${dir}/src/app.ts`,
      [
        "import { createWebApplication } from 'exort/server';\n",
        "import { Express } from 'exort/server/http/express';\n",
        "import { HomeController } from './controllers/home';\n",
        '\n',
        'const app = createWebApplication(Express);\n',
        '\n',
        'app.use(HomeController);\n',
        '\n',
        'app.start(3000);\n'
      ].join('')
    );
  }

  async execute(name: string) {
    try {
      await fs.access(`./${name}`);
    } catch (error) {
      if (error.code != 'ENOENT') {
        throw error;
      }
      await this.create(name);
    }
  }
}
