import Router from "@koa/router";
import * as userController from "../controllers/userController.js";
import multer from '@koa/multer';
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = new Router({ prefix: '/users' });
const upload = multer();

router.post('/', upload.single('avatar'), userController.createUser);
router.get('/', verifyToken, requireAdmin, userController.getAllUser);
router.get('/:id', verifyToken, userController.getUserById);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);
router.put('/:id', verifyToken, upload.single('avatar'), userController.updateUser);

export default router