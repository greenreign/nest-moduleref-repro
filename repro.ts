import { INestApplication, Injectable, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';

// tslint:disable: max-classes-per-file
// tslint:disable: no-console
// tslint:disable: no-empty

const getTestApp = async (): Promise<INestApplication> => {
    const module = await Test.createTestingModule({
        imports: [Mod1],
        providers: [TestFixtures],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    return app;
};

@Injectable()
class Service2 {
    constructor() {}
    public test(): void {}
}

@Injectable()
class Service1 {
    constructor(public readonly service2: Service2) {}
    public test(): void {
        this.service2.test();
    }
}

@Module({
    providers: [Service1, Service2],
})
class Mod1 {}

@Injectable()
class TestFixtures {
    private readonly service1: Service1;
    private readonly service2: Service2;
    constructor(moduleRef: ModuleRef) {
        this.service1 = moduleRef.get(Service1, { strict: false });
        this.service2 = moduleRef.get(Service2, { strict: false });
    }
    public test(): void {
        this.service2.test(); // ok
        this.service1.test(); // TypeError: Cannot read property 'test' of undefined.  
                              // Service1 is found however the instance does not have it's dependencies injected.  
                              // In this case Service2 is missing
    }
}

getTestApp()
    .then((app: INestApplication) => {
        app.get(TestFixtures).test();
    })
    .catch(console.log);
