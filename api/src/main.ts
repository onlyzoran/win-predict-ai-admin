import 'reflect-metadata'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

loadEnv({ path: resolve(__dirname, '../../.env'), quiet: true })
loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true })

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  const port = Number(process.env.API_PORT || 3001)
  await app.listen(port, '127.0.0.1')
  // eslint-disable-next-line no-console
  console.log(`Nest API listening on http://127.0.0.1:${port}`)
}

void bootstrap()
