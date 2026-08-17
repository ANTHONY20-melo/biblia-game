import { Router } from 'express'
import { register, login, me, updateProfile } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, me)
router.put('/profile', authenticate, updateProfile)

export default router
