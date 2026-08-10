import { IsBoolean, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator'
import { SPORT_ICON_KEYS } from '../sport.types'

export class CreateSportDto {
  @IsString()
  @MinLength(1)
  @Matches(/^[a-z][a-zA-Z0-9]*$/, {
    message: 'slug must be camelCase alphanumeric starting with a lowercase letter',
  })
  slug!: string

  @IsString()
  @MinLength(1)
  label!: string

  @IsIn([...SPORT_ICON_KEYS])
  iconKey!: string

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean
}
