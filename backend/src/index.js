import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';
import axios from 'axios';
import * as cheerio from 'cheerio';

import { supabase } from './config/supabaseClient.js';
import routes from './routes/routes.js';

const app = new Koa();
const router = new Router();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser());
router.get('/extract-map', async (ctx) => {
    try {
        const { url } = ctx.query;

        if (!url) {
            ctx.status = 400;
            ctx.body = { error: 'Thiếu URL' };
            return;
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
            }
        });

        const expandedUrl = response.request?.res?.responseUrl || url;

        const html = response.data;
        const $ = cheerio.load(html);

        const imageUrl = $('meta[property="og:image"]').attr('content');
        let title = $('meta[property="og:title"]').attr('content') || '';
        title = title.replace(' - Google Maps', '').replace('Google Maps', '').trim();

        if (!imageUrl) {
            ctx.body = { success: true, expandedUrl, name: title, base64: null };
            return;
        }
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
        ctx.body = {
            success: true,
            expandedUrl: expandedUrl,
            name: title,
            base64: `data:${mimeType};base64,${base64}`,
            fileName: 'google-map-preview.jpg',
            mimeType
        };

    } catch (error) {
        console.error("Lỗi cào dữ liệu Map:", error);
        ctx.status = 500;
        ctx.body = { error: 'Lỗi máy chủ khi trích xuất dữ liệu' };
    }
});
app.use(routes.routes()).use(routes.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Máy chủ Backend đang chạy tại http://localhost:${PORT}`);
});