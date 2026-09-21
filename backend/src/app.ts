import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { notFound, errorHandler } from './middlewares/errorHandler'
import { rateLimit } from 'express-rate-limit'
import emailRoutes from './modules/correo/email.routes'

export function createApp(): Express {
  const app = express()

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      message:
        'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos',
    },
  })

  app.use(cors({ origin: 'http://localhost:5173', credentials: true })); app.use(limiter)

  app.use(helmet())

  // cors was moved above

  app.use(cookieParser())

  app.use(express.json({ limit: '10mb' }))

  app.use(express.urlencoded({ extended: true }))

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Orbix API funcionando',
    })
  })

  app.use('/api/v1', routes)

  app.use('/api/v1/email', emailRoutes)

  const swaggerDocument = YAML.load(
    path.join(__dirname, 'docs', 'swagger.yaml')
  )

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  )

  app.use(notFound)

  app.use(errorHandler)

  return app
}
