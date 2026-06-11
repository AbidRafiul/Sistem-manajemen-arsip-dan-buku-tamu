export async function seed(knex) {
  const dNow = new Date();

  const vaDocumentIds = await knex("trx_documents").insert({
    DocumentName: "Dokumen Test EDMS",
    DocumentNumber: "EDMS-TEST-001",
    DocumentDate: "2026-06-08",
    ExpiredDate: "2026-12-31",
    PicName: "Tester EDMS",
    CreatedAt: dNow,
    UpdatedAt: dNow,
  });

  const nDocumentId = Array.isArray(vaDocumentIds)
    ? vaDocumentIds[0]
    : vaDocumentIds;

  await knex("trx_archive_loans").insert({
    DocumentId: nDocumentId,
    BorrowerName: "Tester Loan",
    LoanDate: "2026-06-08",
    ReturnDate: "2026-06-10",
    Purpose: "Testing approve archive loan",
    Status: "pending",
    CreatedAt: dNow,
    UpdatedAt: dNow,
  });
}
