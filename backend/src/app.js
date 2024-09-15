import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
// app.use(cors({
//     origin: "*",
//     credentials: true
// }));
app.use(cors());
app.use(express.json({limit: "1mb"}));
app.use(express.urlencoded({extended: true, limit: "1mb"}));
app.use(express.static('public'));

//routes import
import userRouter from './routes/user.routes.js';
import productRouter from './routes/product.routes.js';

//routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1', productRouter)

export {app};