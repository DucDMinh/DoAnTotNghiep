import dotenv from 'dotenv';
dotenv.config();
import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

export async function createUser(ctx) {
    const { name, email, password, avatar, phone_number, role } = ctx.request.body;

    if (!name || !email || !password) {
        ctx.status = 400;
        ctx.body = { success: false, message: "Vui lòng nhập đủ thông tin!" };
        return;
    }
    try {
        const { data } = await supabase.from('users').select('*').eq('email', email).single();
        if (data) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: "Email da duoc su dung"
            }
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = bcrypt.hash(password, salt);
        const role = "USER";
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ name, email, password_hash, role }])
            .select('id, name, email, role')
            .single();
        if (error) throw error;
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        ctx.status = 201;
        ctx.body = { success: true, message: "Đăng ký thành công!", token, user: newUser };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { success: false, message: "Lỗi máy chủ!" };
    }
}
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
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        delete user.password_hash;

        ctx.status = 200;
        ctx.body = { success: true, message: "Đăng nhập thành công!", token, user };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { success: false, message: "Lỗi máy chủ!" };
    }
}