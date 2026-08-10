import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { SessionGuard } from '../auth/session.guard'
import { CreateSportDto } from './dto/create-sport.dto'
import { ReorderSportsDto } from './dto/reorder-sports.dto'
import { UpdateSportDto } from './dto/update-sport.dto'
import { SportsService } from './sports.service'

@Controller('sports')
export class SportsController {
  constructor(private readonly sports: SportsService) {}

  @Get()
  listEnabled() {
    return this.sports.listEnabled()
  }

  @Get('all')
  @UseGuards(SessionGuard)
  listAll() {
    return this.sports.listAll()
  }

  @Post()
  @UseGuards(SessionGuard)
  create(@Body() dto: CreateSportDto) {
    return this.sports.create(dto)
  }

  @Post('reorder')
  @UseGuards(SessionGuard)
  reorder(@Body() dto: ReorderSportsDto) {
    return this.sports.reorder(dto.ids)
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  update(@Param('id') id: string, @Body() dto: UpdateSportDto) {
    return this.sports.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  remove(@Param('id') id: string) {
    return this.sports.remove(id)
  }
}
