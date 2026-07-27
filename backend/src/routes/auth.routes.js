import * as authController from "../controllers/authController.js"
import * as userController from "../controllers/userController.js"
import Router from "@koa/router";

const authRoutes = new Router({ prefix: '/auth' });
authRoutes.post('/register', userController.createUser);
authRoutes.post('/login', authController.login);

export default authRoutes;