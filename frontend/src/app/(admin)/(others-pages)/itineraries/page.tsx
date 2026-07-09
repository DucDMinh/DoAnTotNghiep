"use client";
import { useState } from "react";

import { Location } from "@/interface";
import { SetupScreen } from "@/components/itineraries/setup";
import { BuilderScreen } from "@/components/itineraries/builder";

export default function ItineraryBuilderPage() {
    const [step, setStep] = useState<"SETUP" | "BUILDER">("SETUP");
    const [selectedProvinces, setSelectedProvinces] = useState<{ id: string, name: string }[]>([]);
    const [currentItinerary, setCurrentItinerary] = useState({
        title: "", startDate: "", endDate: "", theme: ""
    });
    const [locations, setLocations] = useState<Location[]>([]);
    if (step === "SETUP") {
        return (
            <SetupScreen
                selectedProvinces={selectedProvinces}
                setSelectedProvinces={setSelectedProvinces}
                setLocations={setLocations}
                setStep={setStep}
                setCurrentItinerary={setCurrentItinerary}
                step={step}
            />
        );
    }
    return (
        <BuilderScreen
            setStep={setStep}
            selectedProvinces={selectedProvinces}
            currentItinerary={currentItinerary}
            setCurrentItinerary={setCurrentItinerary}
            locations={locations}
        />
    );
}