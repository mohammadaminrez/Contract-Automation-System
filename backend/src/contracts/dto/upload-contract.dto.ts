import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UploadContractDto {
  @ApiProperty({
    description: 'Original file name',
    example: 'unicampus-contract.pdf',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'File type/extension',
    example: 'pdf',
  })
  @IsString()
  fileType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 169984,
    required: false,
  })
  @IsOptional()
  fileSize?: number;
}
