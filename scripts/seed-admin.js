import dotenv from 'dotenv';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { query } from '../src/db/pool.js';
import { hashPassword } from '../src/utils/password.js';

dotenv.config();

const rl = readline.createInterface({ input, output });

async function main() {
  const email = (await rl.question('Admin email: ')).trim();
  const password = (await rl.question('Admin password: ', { hideEchoBack: true })).trim();
  const hashed = await hashPassword(password);

  const sql =
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ' +
    'ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role ' +
    'RETURNING id, email, role, created_at';

  const { rows } = await query(sql, [email, hashed, 'admin']);
  console.log('Seeded admin:', rows[0]);
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
