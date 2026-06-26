import { provinceRepo } from '../repositories/provinceRepository.js';
import { BaseController } from './baseController.js';

const provinceController = new BaseController(provinceRepo, "Tỉnh/Thành phố");

export const getAllProvinces = provinceController.getAll;
export const getProvinceById = provinceController.getById;
export const createProvince = provinceController.create;
export const updateProvince = provinceController.update;
export const deleteProvince = provinceController.delete;