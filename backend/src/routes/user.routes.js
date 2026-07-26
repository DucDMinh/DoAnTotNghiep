import Router from "@koa/router";
import * as userController from "../controllers/userController.js";
import multer from '@koa/multer';

const router = new Router({ prefix: '/users' });
const upload = multer();

router.post('/', upload.single('avatar'), userController.createUser);

export default router