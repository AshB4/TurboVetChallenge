import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getJsonData(): {
    message: string;
    instructions: string;
    endpoints: { api: string; json: string };
  } {
    return {
      message: 'VetTech API is running',
      instructions: 'To access the JSON data just write: json',
      endpoints: {
        api: '/api',
        json: '/json',
      },
    };
  }
}
