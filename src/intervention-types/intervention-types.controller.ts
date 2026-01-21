import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InterventionTypesService } from './intervention-types.service';

@ApiTags('Intervention Types')
@Controller('intervention-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InterventionTypesController {
  constructor(private readonly interventionTypesService: InterventionTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les types d’intervention (nomenclature)' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'ID du médecin (pour inclure ses types personnalisés)' })
  @ApiResponse({ status: 200, description: 'Liste des types' })
  async list(@Query('search') search?: string, @Query('doctorId') doctorId?: string) {
    return this.interventionTypesService.list({ search, doctorId });
  }

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Créer un type d’intervention (personnalisé médecin)' })
  @ApiResponse({ status: 201, description: 'Type créé' })
  async create(@Body() body: { name: string; doctorId?: string }) {
    return this.interventionTypesService.create(body);
  }
}

