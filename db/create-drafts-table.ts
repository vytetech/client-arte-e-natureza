import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS drafts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      type ENUM('text','image','video') NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      note TEXT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log("tabela drafts ok");
  await conn.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
