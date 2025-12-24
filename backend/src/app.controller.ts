import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-12-24T16:00:00.000Z',
        uptime: 123.456,
        environment: 'development',
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  @ApiOperation({ summary: 'API information' })
  @ApiResponse({
    status: 200,
    description: 'API details',
    schema: {
      example: {
        name: 'Contract Automation API',
        version: '1.0.0',
        description: 'Extract data from rental contracts and generate payment schedules',
        documentation: '/api/docs',
      },
    },
  })
  getInfo() {
    return this.appService.getInfo();
  }
}
