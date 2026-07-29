import dotenv from 'dotenv';
dotenv.config();
import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

export async function login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        ctx.status = 400;
        ctx.body = { success: false, message: "Vui lòng nhập email và mật khẩu!" };
        return;
    }

    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

        if (error || !user) {
            ctx.status = 401;
            ctx.body = { success: false, message: "Email hoặc mật khẩu không đúng!" };
            return;
        }
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            ctx.status = 401;
            ctx.body = { success: false, message: "Email hoặc mật khẩu không đúng!" };
            return;
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role || 'USER'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        delete user.password_hash;

        ctx.status = 200;
        ctx.body = { success: true, message: "Đăng nhập thành công!", token, user };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { success: false, message: "Lỗi máy chủ!" };
    }
}