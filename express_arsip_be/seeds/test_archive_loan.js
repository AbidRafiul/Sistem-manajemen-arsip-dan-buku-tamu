export async function seed(knex) {
  const dNow = new Date();

  const vaDocumentIds = await knex("trx_documents").insert({
    document_name: "Dokumen Test EDMS",
    document_number: "EDMS-TEST-001",
    document_date: "2026-06-08",
    expired_date: "2026-12-31",
    pic_name: "Tester EDMS",
    created_at: dNow,
    updated_at: dNow,
  });

  const nDocumentId = Array.isArray(vaDocumentIds)
    ? vaDocumentIds[0]
    : vaDocumentIds;

  await knex("trx_archive_loans").insert({
    document_id: nDocumentId,
    borrower_name: "Tester Loan",
    loan_date: "2026-06-08",
    return_date: "2026-06-10",
    purpose: "Testing approve archive loan",
    status: "pending",
    created_at: dNow,
    updated_at: dNow,
  });
}
