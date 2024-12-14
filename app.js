
import 'dotenv/config'
import express from "express"
import mongoose from 'mongoose'
import { appRouter } from './src/routes/index.js'
import cors from "cors"
import { appConfig } from './consts.js'


const app = express()

app.use(cors({
    origin: "*"
}))
app.use(express.json())



mongoose.connect(appConfig.mongo_url)
    .then(() => console.log("Connected to database successfully!!"))
    .catch(err => console.log(`Database connection FAILED! ${err.message}`))

app.use("/api", appRouter)

app.listen(appConfig.port, () => {
    console.log(`App running on ${appConfig.port} port`)
})
