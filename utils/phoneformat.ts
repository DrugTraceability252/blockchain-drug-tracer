export const formatPhoneNumber = (phone: string) => {
    if (!phone) return "—";
    const cleaned = phone.replace(/\D/g, "");
    
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    return phone;
};