import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeContractResponseDto {
  @ApiProperty({
    description: 'Contract ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Extraction confidence score (0-1)',
    example: 0.95,
  })
  confidence: number;

  @ApiProperty({
    description: 'Extracted contract data',
  })
  extracted_data: any;

  @ApiProperty({
    description: 'Generated payment schedules',
  })
  payment_schedules: any;

  @ApiProperty({
    description: 'Analysis status',
    example: 'completed',
  })
  status: string;
}
