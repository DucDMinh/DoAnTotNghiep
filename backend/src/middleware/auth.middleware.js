
import jwt from 'jsonwebtoken';

export const verifyToken = async (ctx, next) => {
    let token;
    const authHeader = ctx.request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (ctx.cookies.get('accessToken')) {
        token = ctx.cookies.get('accessToken');
    }
    if (!token) {
        ctx.status = 401;
        ctx.body = { success: false, message: "Không tìm thấy Token, vui lòng đăng nhập!" };
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx.state.user = decoded;
        await next();
    } catch (error) {
        ctx.status = 401;
        ctx.body = { success: false, message: "Token không hợp lệ hoặc đã hết hạn!" };
    }
};

export const requireAdmin = async (ctx, next) => {
    const user = ctx.state.user;
    if (!user || user.role !== 'ADMIN') {
        ctx.status = 403;
        ctx.body = {
            success: false,
            message: "Từ chối truy cập: Bạn không có quyền Quản trị viên!"
        };
        return;
    }
    await next();
};