import { hmac, formatDateSystem } from "../routes/v1/components/tools/general.js";

export async function seed(knex) {

  const uniqueId = "USR000000";
  const username = "superadmin@admin.com";
  const fullname = "Superadmin";
  const telp = "08100000000";
  const role = "superadmin";
  const password = "Superadmin321!";
  const status = "1";

  // Generate password sesuai logika di kode asli
  const cPassword = process.env.USER_KEY + uniqueId + password;

  const dDatetime = formatDateSystem();
  const secret = process.env.USER_SECRET;
  const hashedPassword = hmac(cPassword, secret, 'sha512');

  const oData = {
    Id: 1,
    UniqueId: uniqueId,
    Username: username,
    Fullname: fullname,
    Telp: telp,
    Role: role,
    Status: status,
    Password: hashedPassword,
    CreatedAt: dDatetime,
    UpdatedAt: dDatetime,
  };

  await knex("user_credential").where('Id', 1).del();
  await knex("user_credential").insert(oData);
};