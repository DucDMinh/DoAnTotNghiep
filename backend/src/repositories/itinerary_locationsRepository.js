import { BaseRepository } from "./repo.js";
import { supabase } from "../config/supabaseClient.js";

class ItineraryLocationsRepository extends BaseRepository {
    constructor() {
        super('itinerary_locations');
    }
}

export const itineraryLocationsRepo = new ItineraryLocationsRepository();
