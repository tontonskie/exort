#!/usr/bin/env node

import { createCLIApplication } from '../application';
import { CreateProjectCommand } from '../commands/create-project';

const app = createCLIApplication([
  CreateProjectCommand
]);

app.start(process.argv);
