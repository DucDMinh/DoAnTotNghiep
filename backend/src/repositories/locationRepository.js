import { supabase } from '../config/supabaseClient.js';

export const createLocation = async (locationData) => {
    const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select();

    if (error) throw error;
    return data[0];
};

export async function getAllLocations() {
    const { data, error } = await supabase
        .from('locations')
        .select('*');
    if (error) throw error;
    if (data.length === 0) {
        return null;
    }
    return data[0];
}

export const updateLocationById = async (id, updateData) => {
    const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select();
    if (error) throw error;
    if (data.length === 0) {
        return null;
    }
    return data[0];
};

export async function deleteLocationById(id) {
    const { data, error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)
        .select();
    console.log('Deleted location:', data);
    if (error) throw error;
    if (data.length === 0) {
        return null;
    }
    return data[0];
}
export const getLocationById = async (id) => {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id);

    if (error) throw error;
    return data[0];
};