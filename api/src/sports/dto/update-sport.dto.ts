import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator'
import { SPORT_ICON_KEYS } from '../sport.types'

export class UpdateSportDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string

  @IsOptional()
  @IsIn([...SPORT_ICON_KEYS])
  iconKey?: string

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean
}
