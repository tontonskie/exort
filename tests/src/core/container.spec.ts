import { Container, Injectable, Service, getClassMetadata } from '@exort/core';
import { expect } from '../utils';

describe('core/container', () => {

  describe('@Injectable()', () => {

    @Injectable()
    class InjectableClass {

    }

    it('metadata classType should be "injectable"', () => {
      expect(getClassMetadata(InjectableClass, 'classType')).equals('injectable');
    });
  });

  describe('Container', () => {

    class ViaBindClass {

      constructor(public firstService: FirstService,
                  public secondService: SecondService) {}
    }

    @Injectable()
    class ManualSetClass {

    }

    @Service()
    class FirstService {

    }

    @Service()
    class SecondService {

      constructor(public firstService: FirstService) {}
    }

    @Service()
    class ThirdService {

      constructor(public firstService: FirstService,
                  public secondService: SecondService) {}
    }

    const container = new Container();
    it('.getResolvedClasses() should be empty at first', () => {
      expect(container.getResolvedClasses()).to.be.an('array').that.is.empty;
    });

    it('.has() and .hasInstanceOf() should return false at first', () => {
      expect(container.has(FirstService)).equals(false);
      expect(container.has(SecondService)).equals(false);
      expect(container.has(ThirdService)).equals(false);
      expect(container.hasInstanceOf(FirstService)).equals(false);
      expect(container.hasInstanceOf(SecondService)).equals(false);
      expect(container.hasInstanceOf(ThirdService)).equals(false);
    });

    it('.get() should throw an error if no instance for the given class', () => {
      expect(() => container.get(FirstService)).to.throw(Error, `Class "${FirstService.name}" does not have a registered instance or not expected by container`);
      expect(() => container.get(SecondService)).to.throw(Error, `Class "${SecondService.name}" does not have a registered instance or not expected by container`);
      expect(() => container.get(ThirdService)).to.throw(Error, `Class "${ThirdService.name}" does not have a registered instance or not expected by container`);
    });

    it('.set() should throw an error if value is not an Object', () => {
      expect(() => container.set(ManualSetClass, true)).to.throw(Error, `Invalid instance type: ${typeof true}`)
    });

    it('.set() should make .get() return the instance and .has() / .hasInstanceOf() return true', () => {
      container.set(ManualSetClass, new ManualSetClass());
      expect(container.get(ManualSetClass)).to.be.instanceOf(ManualSetClass);
      expect(container.has(ManualSetClass)).equals(true);
      expect(container.hasInstanceOf(ManualSetClass)).equals(true);
      expect(container.getResolvedClasses()).to.include(ManualSetClass);
    });

    it('.resolve() should create an instance and resolve its dependencies recursively', () => {
      let thirdService = container.resolve<ThirdService>(ThirdService);
      expect(thirdService).to.be.instanceOf(ThirdService);
      expect(thirdService.firstService).to.be.instanceOf(FirstService);
      expect(thirdService.secondService).to.be.instanceOf(SecondService);
      expect(thirdService.secondService.firstService).to.be.instanceOf(FirstService);
    });

    it('.resolve() should throw a circular dependecy error', () => {

      @Service()
      class FirstTestService {

      }

      @Service()
      class SecondTestService {

        constructor(public firstService: FirstTestService,
                    public secondService: SecondTestService) {}
      }

      @Service()
      class ThirdTestService {

        constructor(public firstTestService: FirstTestService,
                    public secondTestService: SecondTestService) {}
      }


      expect(() => container.resolve(ThirdTestService)).to.throw(Error, 'Circular dependency ThirdTestService -> SecondTestService -> SecondTestService');
    });

    it('.bind() should make .resolve() return an instance using given function', () => {

      container.bind(ViaBindClass, container => {
        return new ViaBindClass(new FirstService(), new SecondService(new FirstService()));
      });

      let instance = container.resolve<ViaBindClass>(ViaBindClass);
      expect(instance).to.be.instanceOf(ViaBindClass);
      expect(container.has(ViaBindClass)).equals(true);
      expect(container.hasInstanceOf(ViaBindClass)).equals(true);
      expect(container.getResolvedClasses()).to.include(ViaBindClass);
      expect(container.get(ViaBindClass)).to.be.eql(instance);
    });
  });
});
