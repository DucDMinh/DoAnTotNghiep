import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';

import { supabase } from './config/supabaseClient.js';
import routes from './routes/routes.js';

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

app.use(routes.routes()).use(routes.allowedMethods());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Máy chủ Backend đang chạy tại http://localhost:${PORT}`);
});