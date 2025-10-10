/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ModeController = () => import('#controllers/users/mode_controller')
const ProgramsController = () => import('#controllers/rehab/programs_controller')
const RehabLogsController = () => import('#controllers/rehab/logs_controller')
const WellnessLogsController = () => import('#controllers/wellness/logs_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Auth routes
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/api/auth')

// User mode management (protected)
router
  .group(() => {
    router.patch('/mode', [ModeController, 'update'])
  })
  .prefix('/api/users')
  .use(middleware.auth())

// Rehab programs (protected)
router
  .group(() => {
    router.post('/', [ProgramsController, 'create'])
    router.get('/', [ProgramsController, 'index'])
    router.patch('/:id/status', [ProgramsController, 'updateStatus'])
  })
  .prefix('/api/rehab-programs')
  .use(middleware.auth())

// Rehab logs (protected)
router
  .group(() => {
    router.post('/', [RehabLogsController, 'create'])
    router.get('/', [RehabLogsController, 'index'])
  })
  .prefix('/api/rehab-logs')
  .use(middleware.auth())

// Wellness logs (protected)
router
  .group(() => {
    router.post('/', [WellnessLogsController, 'create'])
    router.get('/', [WellnessLogsController, 'index'])
  })
  .prefix('/api/wellness-logs')
  .use(middleware.auth())
