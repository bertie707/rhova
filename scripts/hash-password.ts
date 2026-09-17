// Generates a bcrypt hash for ADMIN_PASSWORD_HASH. Run with
// `npm run hash-password -- "your password"`, then paste the printed hash
// into your .env (locally) and into the ADMIN_PASSWORD_HASH env var on the
// hosting platform (never the plain password itself).
import { hash } from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npm run hash-password -- "your password"');
    process.exit(1);
  }
  console.log(await hash(password, 12));
}

main();
