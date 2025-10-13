import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });

  describe('getJson', () => {
    it('should return the JSON helper payload', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getJson()).toEqual({
        message: 'VetTech API is running',
        instructions: 'To access the JSON data just write: json',
        endpoints: {
          api: '/api',
          json: '/json',
        },
      });
    });
  });
});
