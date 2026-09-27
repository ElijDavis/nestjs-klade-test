import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('content-type', 'text/html; charset=utf-8')
  getHello(): Promise<string> {
    return this.appService.getHtml();
  }

  @Get('api')
  getApi() {
    return this.appService.getStatus();
  }
}
