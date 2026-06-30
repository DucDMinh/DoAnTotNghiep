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
    img: string | null;
    difficulty_level?: string;
    rating?: number;
    created_at?: string;
}
export interface AddLocationModalProps {
    setIsAddModalOpen: (isOpen: boolean) => void;
    formData: {
        name: string;
        description: string;
        note: string; // Đã thêm trường note để tách biệt với description
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