import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import logger from "morgan"
import bodyParser from 'body-parser'

const app = express()

app.use(cors({
    origin: "https://staffsync-hrm.onrender.com", // Specify the exact origin of your frontend
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true, // Use true instead of 'true'
    allowedHeaders: 'Content-Type, Authorization',
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());




import userRouter from './routes/user.router.js'

app.use("/api/v1/users", userRouter)


export { app }  