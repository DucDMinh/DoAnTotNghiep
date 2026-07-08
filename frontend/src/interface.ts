import { Dispatch, SetStateAction } from "react";

export interface Location {
    id: string;
    name: string;
    description?: string;
    note?: string;
    province_id?: string;
    provinces?: {
        name: string;
    };
    lat: number;
    lng: number;
    img: string | undefined;
    difficulty_level?: string;
    rating?: number;
    created_at?: string;
}
export interface AddLocationModalProps {
    setIsAddModalOpen: (isOpen: boolean) => void;
    formData: {
        name: string;
        description: string;
        note: string;
        lat: string;
        lng: string;
        province_id: string;
        difficulty_level: string;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            name: string;
            description: string;
            note: string;
            lat: string;
            lng: string;
            province_id: string;
            difficulty_level: string;
        }>
    >;
    mapLink: string;
    setMapLink: (link: string) => void;
    setImageFile: (file: File | null) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleExtractFromLink: () => void;
    handleAddSubmit: (e: React.FormEvent) => Promise<void>;
    provinces: { id: string; name: string }[];
    isSaving: boolean;
    imageFile: File | null;
}

export interface EditLocationModalProps {
    setIsEditModalOpen: Dispatch<SetStateAction<boolean>>;
    formData: {
        name: string;
        description: string;
        note: string;
        lat: string;
        lng: string;
        province_id: string;
        difficulty_level: string;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            name: string;
            description: string;
            note: string;
            lat: string;
            lng: string;
            province_id: string;
            difficulty_level: string;
        }>
    >;
    mapLink: string;
    setMapLink: (link: string) => void;
    setImageFile: (file: File | null) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleExtractFromLink: () => void;
    handleEditSubmit: (e: React.FormEvent) => Promise<void>;
    provinces: { id: string; name: string }[];
    isSaving: boolean;
    imageFile: File | null;
    pickLocation?: Location;
}

export interface Province {
    id: string;
    name: string;
    description?: string;
    best_time_to_visit?: string;
    height?: string;
    locations?: { id: string; name: string }[];
    image_url?: string | null;
}

export interface Itinerary {
    id: string;
    title: string;
    summary: string;
    start_date: string;
    end_date: string;
    theme: string;
    days?: number;
    nights?: number;
    estimated_cost: number;
    image_url?: string | undefined;
}

export interface SetupScreenProp {
    selectedProvinces: {
        id: string;
        name: string;
    }[],
    setSelectedProvinces: React.Dispatch<React.SetStateAction<{
        id: string;
        name: string;
    }[]>>,
    setLocations: Dispatch<SetStateAction<Location[]>>,
    setStep: Dispatch<SetStateAction<"BUILDER" | "SETUP">>,
    setCurrentItinerary: Dispatch<SetStateAction<{
        title: string;
        startDate: string;
        endDate: string;
        theme: string;
    }>>,
    step: "BUILDER" | "SETUP"
}