import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getInfo() {
    return {
      name: 'Contract Automation API',
      version: '1.0.0',
      description: 'Extract structured data from rental contracts and generate payment schedules',
      documentation: '/api/docs',
      features: [
        'PDF and Word contract upload',
        'Pattern-based data extraction (Unicampus format)',
        'Payment schedule generation',
        'Multi-client support',
        'PostgreSQL database with JSONB storage',
      ],
    };
  }
}
