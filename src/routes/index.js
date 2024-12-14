import { Router } from "express";
import { authRoutes } from "./authroutes.js";

// -> /api
export const appRouter = Router();

// -> /api/auth/login
appRouter.use("/auth", authRoutes)