import { BaseRepository } from './repo.js';
import { supabase } from '../config/supabaseClient.js';

class LocationRepository extends BaseRepository {
    constructor() {
        super('locations');
    }
    async getAll() {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, provinces(name)')
            .order('id', { ascending: false });

        if (error) throw error;
        return data;
    }
}

export const locationRepo = new LocationRepository();