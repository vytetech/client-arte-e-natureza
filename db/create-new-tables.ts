import "dotenv/config";
import mysql from "mysql2/promise";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const conn = await mysql.createConnection(url);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS media (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name varchar(255) NOT NULL,
      mime varchar(100) NOT NULL,
      size int NOT NULL,
      data longblob NOT NULL,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("media table ready");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`key\` varchar(128) NOT NULL,
      value text NOT NULL,
      UNIQUE KEY settings_key_unique (\`key\`)
    )
  `);
  console.log("settings table ready");

  await conn.end();
  process.exit(0);
}

run();
