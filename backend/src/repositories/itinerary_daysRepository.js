import { BaseRepository } from "./repo.js";
import { supabase } from "../config/supabaseClient.js";

class ItineraryDaysRepository extends BaseRepository {
    constructor() {
        super('itinerary_days');
    }
}

export const itineraryDaysRepo = new ItineraryDaysRepository();
