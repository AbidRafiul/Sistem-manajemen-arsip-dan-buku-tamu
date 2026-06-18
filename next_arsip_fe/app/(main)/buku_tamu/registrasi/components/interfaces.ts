export interface RegistrasiFormData {
    guest_name: string;
    phone_number: string;
    guest_email: string;
    guest_company: string;
    guest_position: string;
    identity_type: string | null;
    identity_number: string;
    visit_purpose_id: number | null;
    host_user_id: string | null;
    host_name: string;
    visit_notes: string;
    check_in_time: Date | null;
}

export interface GeneratedCardData {
    visit_code: string;
    guest_name: string;
    guest_company: string;
    qr_image_url: string;
}