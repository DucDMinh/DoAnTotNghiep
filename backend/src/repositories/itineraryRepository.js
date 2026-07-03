import { BaseRepository } from "./repo.js";
import { supabase } from "../config/supabaseClient.js";

class ItineraryRepository extends BaseRepository {
    constructor() {
        super('itineraries');
    }
    create = async (payload) => {
        const { data, error } = await supabase
            .from('itineraries')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        const daysToInsert = Array.from({ length: payload.days }, (_, i) => ({
            itinerary_id: data.id,
            day_number: i + 1,
            title: `Ngày ${i + 1}`
        }));

        const { data: itineraryDaysData, error: itineraryDaysError } = await supabase.from('itinerary_days').insert(daysToInsert);
        if (itineraryDaysError) throw itineraryDaysError;
        return { ...data };
    }
    getById = async (id) => {
        const { data, error } = await supabase
            .from('itineraries')
            .select(`*, itinerary_days (
                    id, 
                    day_number, 
                    title,
                    itinerary_locations (
                        id, 
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
                )`)
            .eq('id', id)
            .single();
        if (error) throw new Error;
        return { data }
    }
}

export const itineraryRepo = new ItineraryRepository();
