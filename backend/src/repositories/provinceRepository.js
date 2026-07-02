import { BaseRepository } from './repo.js';
import { supabase } from '../config/supabaseClient.js';

class ProvinceRepository extends BaseRepository {
    constructor() {
        super('provinces');
    }

    async getAll(page = 1, limit = 10, search = '') {
        const offset = (page - 1) * limit;
        let query = supabase
            .from(this.tableName)
            .select('*, locations(id, name)', { count: 'exact' });
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        const { data, count, error } = await query;

        if (error) throw error;

        return { data, count };
    }
}

export const provinceRepo = new ProvinceRepository();