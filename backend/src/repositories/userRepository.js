import { BaseRepository } from './repo.js';
import { supabase } from '../config/supabaseClient.js';

class UserRepository extends BaseRepository {
    constructor() {
        super('users');
    }

    async getAll() {
        const { data, error } = await supabase
            .from('users')
            .select('*, itineraries(title, theme)')
            .order('created_at', { ascending: true });
        if (error) throw error;
        return { data };
    }
    async getById(id) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, itineraries(*)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }
    async checkExistEmail(email) {
        const { data } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .single()
        if (data) {
            return true;
        }
        return false
    }
}

export const userRepo = new UserRepository();