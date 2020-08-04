import { createCLIApplication, CreateProjectCommand } from '../..';
import { expect } from '../../../core/tests/utils';
import { promises as fs } from 'fs';

describe('commands/create-project', () => {

  const app = createCLIApplication([CreateProjectCommand]);
  describe('CreateProjectCommand', () => {

    before(async () => {
      await app.start(['create:project', 'testproject'], { from: 'user' });
    });

    it('should create a folder named "testproject"', () => {
      return expect(fs.access('./testproject')).to.be.eventually.fulfilled;
    });

    after(async () => {
      await fs.rmdir('./testproject', { recursive: true });
    });
  });
});
