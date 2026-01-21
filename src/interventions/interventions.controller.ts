import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Interventions')
@Controller('interventions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle intervention' })
  @ApiResponse({ status: 201, description: 'Intervention créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async create(@Body() createInterventionDto: CreateInterventionDto, @Request() req) {
    return this.interventionsService.create(createInterventionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les interventions' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'ID du médecin' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut de l\'intervention' })
  @ApiQuery({ name: 'priority', required: false, description: 'Priorité de l\'intervention' })
  @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Liste des interventions' })
  async findAll(
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.interventionsService.findAll({
      doctorId,
      status,
      priority,
      from,
      to,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obtenir les interventions à venir' })
  @ApiQuery({ name: 'days', required: false, description: 'Nombre de jours à venir (défaut: 7)' })
  @ApiResponse({ status: 200, description: 'Liste des interventions à venir' })
  async getUpcoming(@Query('days') days?: number) {
    return this.interventionsService.getUpcoming(days || 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une intervention par ID' })
  @ApiResponse({ status: 200, description: 'Intervention trouvée' })
  @ApiResponse({ status: 404, description: 'Intervention non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.interventionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Modifier une intervention' })
  @ApiResponse({ status: 200, description: 'Intervention modifiée avec succès' })
  @ApiResponse({ status: 404, description: 'Intervention non trouvée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async update(
    @Param('id') id: string,
    @Body() updateInterventionDto: UpdateInterventionDto,
  ) {
    return this.interventionsService.update(id, updateInterventionDto);
  }

  @Post(':id/report-attachments')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Ajouter des pièces jointes au rapport d’intervention (upload)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/interventions',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadReportAttachments(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const urls = (files || []).map((f) => `/uploads/interventions/${f.filename}`);
    // Merge avec l'existant via update()
    const current = await this.interventionsService.findOne(id);
    let existing: string[] = [];
    try {
      existing = (current as any).reportAttachments ? JSON.parse((current as any).reportAttachments) : [];
    } catch {
      existing = [];
    }
    const merged = [...existing, ...urls];
    return this.interventionsService.update(id, { reportAttachments: merged } as any);
  }

  @Delete(':id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Supprimer une intervention' })
  @ApiResponse({ status: 200, description: 'Intervention supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Intervention non trouvée' })
  async remove(@Param('id') id: string) {
    return this.interventionsService.remove(id);
  }

}
