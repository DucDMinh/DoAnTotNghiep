import { BaseController } from './baseController.js';
import { userRepo } from '../repositories/userRepository.js'

class UserController extends BaseController {
    constructor() {
        super(userRepo, "Địa điểm");
    }
}