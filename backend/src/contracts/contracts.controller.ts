import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContractsService } from './contracts.service';
import { AnalyzeContractResponseDto } from './dto/analyze-contract.dto';

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a contract file (PDF or Word)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Contract uploaded successfully',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only PDF and Word documents are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadContract(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileType = extname(file.originalname).substring(1).toLowerCase();

    return this.contractsService.uploadContract(
      file.originalname,
      fileType,
      file.size,
      file.path,
    );
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze a contract and extract structured data' })
  @ApiResponse({
    status: 200,
    description: 'Contract analyzed successfully',
    type: AnalyzeContractResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async analyzeContract(@Param('id') id: string) {
    return this.contractsService.analyzeContract(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts' })
  @ApiResponse({
    status: 200,
    description: 'List of all contracts',
  })
  async getAllContracts() {
    return this.contractsService.getAllContracts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contract details',
  })
  @ApiResponse({
    status: 404,
    description: 'Contract not found',
  })
  async getContractById(@Param('id') id: string) {
    return this.contractsService.getContractById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contract' })
  @ApiResponse({
    status: 200,
    description: 'Contract deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contract not found',
  })
  async deleteContract(@Param('id') id: string) {
    return this.contractsService.deleteContract(id);
  }
}
