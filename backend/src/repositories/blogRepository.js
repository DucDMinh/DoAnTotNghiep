import { BaseRepository } from './repo.js'
import { supabase } from '../config/supabaseClient.js'

class BlogRepository extends BaseRepository {
    constructor() {
        super('blogs')
    }
    getAll = async () => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*, user_id(id, name, avatar)')
            .order('created_at', { ascending: true })
        return { data, error }
    }
}

export const blogRepo = new BlogRepository();