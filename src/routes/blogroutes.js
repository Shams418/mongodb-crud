import { Router } from "express"
import { useAuth } from "../middleware/authmiddleware.js"

export const blogRoutes = Router()

// -> /api/blog/create
blogRoutes.post("/create", useAuth)

// -> /api/blog/list
blogRoutes.get("/list", (req, res) => {
    console.log("SALAM");
    res.send("Blog List")
})