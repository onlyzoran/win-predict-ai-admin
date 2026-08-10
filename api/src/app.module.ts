import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { HealthController } from './health/health.controller'
import { SportsModule } from './sports/sports.module'

@Module({
  imports: [DatabaseModule, AuthModule, SportsModule],
  controllers: [HealthController],
})
export class AppModule {}
