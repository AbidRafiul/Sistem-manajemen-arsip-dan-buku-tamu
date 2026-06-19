import { initValue, TableData } from "./interfaces";

export const mapIncomingLetterRow = (row: Record<string, any>): TableData => ({
    incoming_letter_id: row.incoming_letter_id || 0,
    agenda_number: row.agenda_number || "",
    letter_number: row.letter_number || "",
    letter_date: row.letter_date || "",
    received_date: row.received_date || "",
    sender_name: row.sender_name || "",
    sender_institution: row.sender_institution || null,
    subject: row.subject || "",
    attachment_description: row.attachment_description || null,
    letter_type_id: row.letter_type_id || null,
    letter_type_name: row.letter_type_name || null,
    document_type_id: row.document_type_id || null,
    archive_classification_id: row.archive_classification_id || null,
    confidentiality_level_id: row.confidentiality_level_id || null,
    status: row.status || "baru",
    created_by: row.created_by || null,
    updated_by: row.updated_by || null,
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
});

export const mapIncomingLetterPayload = (input: initValue, isEdit: boolean) => {
    const nullableNumber = (value: number | null) => value || null;

    const payload: Record<string, any> = {
        agenda_number: input.agenda_number,
        letter_number: input.letter_number,
        letter_date: input.letter_date,
        received_date: input.received_date,
        sender_name: input.sender_name,
        sender_institution: input.sender_institution || null,
        subject: input.subject,
        attachment_description: input.attachment_description || null,
        letter_type_id: nullableNumber(input.letter_type_id),
        document_type_id: nullableNumber(input.document_type_id),
        archive_classification_id: nullableNumber(input.archive_classification_id),
        confidentiality_level_id: nullableNumber(input.confidentiality_level_id),
        updated_by: nullableNumber(input.updated_by),
    };

    if (isEdit) {
        payload.incoming_letter_id = input.incoming_letter_id;
        payload.status = input.status;
    } else {
        payload.created_by = nullableNumber(input.created_by);
    }

    return payload;
};
