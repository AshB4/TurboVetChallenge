import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });

  describe('getJsonData', () => {
    it('should describe the available JSON endpoint', () => {
      expect(service.getJsonData()).toEqual({
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
