import { HttpServer } from '../../../lib';
import { ExpressServer, Request, Response } from '../../../lib/http/express';
import { expect, request } from '../../utils';

describe('http/express', () => {
  describe('ExpressServer', () => {

    const config = {
      port: 3000,
      hostname: '127.0.0.1'
    };
    const server: ExpressServer = new ExpressServer(config);

    before(() => {
      server.get('/', (request: Request, response: Response) => {
        response.send('GET method');
      });

      server.post('/', (request: Request, response: Response) => {
        response.send('POST method');
      });

      server.head('/', (request: Request, response: Response) => {
        response.send('HEAD method');
      });

      server.delete('/', (request: Request, response: Response) => {
        response.send('DELETE method');
      });

      server.put('/', (request: Request, response: Response) => {
        response.send('PUT method');
      });

      server.patch('/', (request: Request, response: Response) => {
        response.send('PATCH method');
      });

      server.options('/', (request: Request, response: Response) => {
        response.send('OPTIONS method');
      });
    });

    it('should be an instance of HttpServer class', () => {
      expect(server).to.be.instanceOf(HttpServer);
    });

    it('.getInstance() should return express instance', () => {
      expect(server.getInstance()).to.be.a('function').property('name', 'app');
    });

    it('.config should match the provided config', () => {
      expect(server.config).to.be.eql(config);
    });

    it('.isRunning() should return false before calling .start()', () => {
      expect(server.isRunning()).equals(false);
    });

    it('.isRunning() should return true after calling .start()', async () => {
      await server.start();
      expect(server.isRunning()).equals(true);
    });

    it('calling .start() twice should throw an error', () => {
      return expect(server.start()).to.eventually.rejectedWith(Error, `Can't call .start() twice. Http server is already running.`);
    });

    it('GET method route "/"', done => {
      request(server.getInstance())
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('GET method');
          done();
        });
    });

    it('POST method on route "/"', done => {
      request(server.getInstance())
        .post('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('POST method');
          done();
        });
    });

    it('HEAD method on route "/"', done => {
      request(server.getInstance())
        .head('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('');
          done();
        });
    });

    it('DELETE method on route "/"', done => {
      request(server.getInstance())
        .delete('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('DELETE method');
          done();
        });
    });

    it('PUT method on route "/"', done => {
      request(server.getInstance())
        .put('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('PUT method');
          done();
        });
    });

    it('PATCH method on route "/"', done => {
      request(server.getInstance())
        .patch('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('PATCH method');
          done();
        });
    });

    it('OPTIONS method on route "/"', done => {
      request(server.getInstance())
        .options('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.eql('OPTIONS method');
          done();
        });
    });

    it('.isRunning() should return false after calling .end()', async () => {
      await server.end();
      expect(server.isRunning()).equals(false);
    });
  });
});
