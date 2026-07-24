import * as authController from "../controllers/authController.js"
import Router from "@koa/router";

const authRoutes = new Router({ prefix: '/auth' });
authRoutes.post('/register', authController.createUser);
authRoutes.post('/login', authController.login);

export default authRoutes;