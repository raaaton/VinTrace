export const maskVIN = (vin: string): string => {
    if (!vin || vin.length < 11) return vin;

    const visibleCount = 11;
    const visibleSection = vin.slice(0, visibleCount);
    const maskedSection = "*".repeat(vin.length - visibleCount);

    return visibleSection + maskedSection;
};

