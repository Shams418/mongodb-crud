import { Router } from "express"
import { AuthContoller } from "../controllers/auth.controller.js"
import { useAuth } from "../middleware/authmiddleware.js"

export const authRoutes = Router()

const contoller = AuthContoller()

// -> /api/auth/login
authRoutes.post("/login", contoller.login)
authRoutes.post("/register", contoller.register)
authRoutes.post("/verify/email", useAuth, contoller.verifyEmail)
authRoutes.post("/verify/email/code", useAuth, contoller.checkVerifyCode)
authRoutes.post("/forget-pass", useAuth, contoller.forgetPass)