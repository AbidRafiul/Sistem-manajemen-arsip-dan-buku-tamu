import { transporter } from "../../config/mail.js";
import DB from "../../config/knex.js";

async function getColumns(tableName) {
  try {
    const [cols] = await DB.raw(`SHOW COLUMNS FROM \`${tableName}\``);
    return cols.map((c) => c.Field);
  } catch (e) {
    return [];
  }
}

function pickColumn(columns, candidates) {
  return candidates.find((c) => columns.includes(c)) || null;
}

export async function sendMailNotification(hostUserId, type, details) {
  const mailHost = process.env.MAIL_HOST;
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  if (!mailHost || !mailUser || !mailPass) {
    console.log("[Mail Service]: SMTP credentials not fully configured in .env. Email notification skipped.");
    return;
  }

  try {
    if (!hostUserId) return;

    const userCols = await getColumns("mst_pengguna");
    const userIdCol = pickColumn(userCols, ["id_pengguna", "user_id", "UserId"]);
    const usernameCol = pickColumn(userCols, ["nama_pengguna", "username", "NamaPengguna"]);
    const emailCol = pickColumn(userCols, ["surel", "email", "Email"]);
    const fullnameCol = pickColumn(userCols, ["nama_lengkap", "fullname", "Fullname"]);

    if (!userIdCol || !usernameCol || !emailCol) {
      console.log("[Mail Service]: Missing required columns on user table. Email notification skipped.");
      return;
    }

    const hostUser = await DB("mst_pengguna")
      .where(userIdCol, hostUserId)
      .orWhere(usernameCol, hostUserId)
      .orWhere(fullnameCol, hostUserId)
      .orWhere(emailCol, hostUserId)
      .select(
        fullnameCol ? `${fullnameCol} as nama_lengkap` : DB.raw("NULL as nama_lengkap"),
        `${emailCol} as email`
      )
      .first();

    if (!hostUser || !hostUser.email) {
      console.log(`[Mail Service]: Host email not found for User ID ${hostUserId}. Notification skipped.`);
      return;
    }

    const hostEmail = hostUser.email;
    const hostName = hostUser.nama_lengkap || "Pegawai";

    let subject = "";
    let htmlContent = "";

    const guestName = details.nama_tamu || "Tamu";
    const guestCompany = details.instansi_tamu || "-";
    const visitPurpose = details.VisitPurposeName || "Keperluan Bisnis";
    const checkinTime = details.waktu_masuk || "-";
    const visitCode = details.kode_kunjungan || "-";
    const notes = details.catatan_kunjungan || "-";

    if (type === "booking") {
      subject = `[SIAB] Rencana Kunjungan Baru - ${guestName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">Rencana Kunjungan Baru</h2>
          </div>
          <div style="padding: 20px; color: #334155;">
            <p>Halo <strong>${hostName}</strong>,</p>
            <p>Anda memiliki permohonan kunjungan baru dari tamu berikut:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 180px; color: #64748b;">Nama Tamu:</td>
                <td style="padding: 8px 0; color: #1e293b;">${guestName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Instansi/Perusahaan:</td>
                <td style="padding: 8px 0; color: #1e293b;">${guestCompany}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Tujuan Kunjungan:</td>
                <td style="padding: 8px 0; color: #1e293b;">${visitPurpose}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Rencana Kedatangan:</td>
                <td style="padding: 8px 0; color: #1e293b;">${checkinTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Catatan/Keperluan:</td>
                <td style="padding: 8px 0; color: #1e293b;">${notes}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Kode Kunjungan:</td>
                <td style="padding: 8px 0; color: #1d4ed8; font-weight: bold; letter-spacing: 1px;">${visitCode}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">Silakan tinjau permohonan ini melalui dashboard Sistem Informasi Arsip & Buku Tamu (SIAB).</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Email ini dikirim secara otomatis oleh SIAB. Mohon tidak membalas email ini.</p>
          </div>
        </div>
      `;
    } else if (type === "checkin") {
      subject = `[SIAB] Tamu Anda Telah Tiba - ${guestName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">Tamu Anda Telah Tiba!</h2>
          </div>
          <div style="padding: 20px; color: #334155;">
            <p>Halo <strong>${hostName}</strong>,</p>
            <p>Tamu Anda telah tiba di meja resepsionis dan telah melakukan **Check-in**:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 180px; color: #64748b;">Nama Tamu:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 16px; font-weight: bold;">${guestName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Instansi/Perusahaan:</td>
                <td style="padding: 8px 0; color: #1e293b;">${guestCompany}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Waktu Check-in:</td>
                <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">${checkinTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Keperluan:</td>
                <td style="padding: 8px 0; color: #1e293b;">${notes}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Kode Kunjungan:</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${visitCode}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-weight: bold; color: #1e293b;">Silakan segera menemui tamu Anda di lobi/resepsionis.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Email ini dikirim secara otomatis oleh SIAB. Mohon tidak membalas email ini.</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: `"SIAB Buku Tamu" <${mailUser}>`,
      to: hostEmail,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail Service]: Notification sent to ${hostEmail}. MessageID: ${info.messageId}`);
  } catch (error) {
    console.error("[Mail Service Error]: Failed to send notification email:", error);
  }
}
