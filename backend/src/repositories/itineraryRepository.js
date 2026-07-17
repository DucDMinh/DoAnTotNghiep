import { BaseRepository } from "./repo.js";
import { supabase } from "../config/supabaseClient.js";

class ItineraryRepository extends BaseRepository {
    constructor() {
        super('itineraries');
    }
    create = async (payload) => {
        const { data, error } = await supabase.rpc('create_full_itinerary', {
            payload: payload
        });

        if (error) {
            console.error("Lỗi khi tạo Itinerary qua RPC:", error);
            throw error;
        }

        return data;
    }

    getById = async (id) => {
        const { data, error } = await supabase
            .from('itineraries')
            .select(`
    *, 
    itinerary_days (
        id, 
        day_number, 
        title,
        itinerary_locations (
            id, 
            location_id,      
            location_name,    
            lat,              
            lng,              
            sequence_order, 
            start_time, 
            end_time, 
            cost, 
            activity_note,
            locations (
                id, 
                name, 
                img, 
                difficulty_level
            )
        )
    ), 
    itinerary_provinces (
        province_id,
        provinces (
            id,
            name,
            image_url
        )
    )
`)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Lỗi khi lấy Itinerary:", error);
            throw error;
        }

        return { data };
    }
    getAll = async () => {
        const { data, error } = await supabase
            .from('itineraries')
            .select(`
            *,
            itinerary_provinces (
                province_id,
                provinces (
                    id,
                    name
                )
            )
        `);
        if (error) {
            console.error("Lỗi khi lấy Itinerary:", error);
            throw error;
        }
        return { data };
    }
}

export const itineraryRepo = new ItineraryRepository();