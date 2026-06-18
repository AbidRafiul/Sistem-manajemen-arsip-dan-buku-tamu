import { initValue, TableData } from "./interfaces";

const pick = <T>(source: Record<string, any>, pascalKey: string, snakeKey: string, fallback: T): T => {
    const value = source?.[pascalKey] ?? source?.[snakeKey];
    return (value ?? fallback) as T;
};

export const mapIncomingLetterRow = (row: Record<string, any>): TableData => ({
    IncomingLetterId: pick(row, "IncomingLetterId", "incoming_letter_id", 0),
    AgendaNumber: pick(row, "AgendaNumber", "agenda_number", ""),
    LetterNumber: pick(row, "LetterNumber", "letter_number", ""),
    LetterDate: pick(row, "LetterDate", "letter_date", ""),
    ReceivedDate: pick(row, "ReceivedDate", "received_date", ""),
    SenderName: pick(row, "SenderName", "sender_name", ""),
    SenderInstitution: pick(row, "SenderInstitution", "sender_institution", null),
    Subject: pick(row, "Subject", "subject", ""),
    AttachmentDescription: pick(row, "AttachmentDescription", "attachment_description", null),
    LetterTypeId: pick(row, "LetterTypeId", "letter_type_id", null),
    LetterTypeName: pick(row, "LetterTypeName", "letter_type_name", null),
    DocumentTypeId: pick(row, "DocumentTypeId", "document_type_id", null),
    ArchiveClassificationId: pick(row, "ArchiveClassificationId", "archive_classification_id", null),
    ConfidentialityLevelId: pick(row, "ConfidentialityLevelId", "confidentiality_level_id", null),
    Status: pick(row, "Status", "status", "baru"),
    CreatedBy: pick(row, "CreatedBy", "created_by", null),
    UpdatedBy: pick(row, "UpdatedBy", "updated_by", null),
    CreatedAt: pick(row, "CreatedAt", "created_at", ""),
    UpdatedAt: pick(row, "UpdatedAt", "updated_at", ""),
});

export const mapIncomingLetterPayload = (input: initValue, isEdit: boolean) => {
    const nullableNumber = (value: number | null) => value || null;

    const payload: Record<string, any> = {
        agenda_number: input.AgendaNumber,
        letter_number: input.LetterNumber,
        letter_date: input.LetterDate,
        received_date: input.ReceivedDate,
        sender_name: input.SenderName,
        sender_institution: input.SenderInstitution || null,
        subject: input.Subject,
        attachment_description: input.AttachmentDescription || null,
        letter_type_id: nullableNumber(input.LetterTypeId),
        document_type_id: nullableNumber(input.DocumentTypeId),
        archive_classification_id: nullableNumber(input.ArchiveClassificationId),
        confidentiality_level_id: nullableNumber(input.ConfidentialityLevelId),
        updated_by: nullableNumber(input.UpdatedBy),
    };

    if (isEdit) {
        payload.incoming_letter_id = input.IncomingLetterId;
        payload.status = input.Status;
    } else {
        payload.created_by = nullableNumber(input.CreatedBy);
    }

    return payload;
};
