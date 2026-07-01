import { BaseRepository } from './repo.js';
import { supabase } from '../config/supabaseClient.js';

class LocationRepository extends BaseRepository {
    constructor() {
        super('locations');
    }

    async getAll(page = 1, limit = 10, search = '', province_id = '') {
        const offset = (page - 1) * limit;
        let query = supabase
            .from(this.tableName)
            .select('*, provinces(name)', { count: 'exact' });
        if (province_id) {
            query = query.eq('province_id', province_id);
        }
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

export const locationRepo = new LocationRepository();