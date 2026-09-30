// scripts/creer-identifiant.mjs
// Crée les identifiants école (matricule + code confidentiel) d'un encadrant ou d'un administrateur.
// Indispensable pour le tout premier administrateur ; ensuite, les identifiants se créent depuis /admin/identifiants.
// Usage : npm run identifiant -- ADMIN <matricule> <prénom> <nom> [email]
//         npm run identifiant -- ENCADRANT ENS-2026-014 Marie "Ngo Bassa" marie.ngo@iai.cm
// Le code est affiché une seule fois : seul son empreinte (scrypt) est enregistrée, comme dans lib/staff.ts.
import 'dotenv/config';
import dotenv from 'dotenv';
import pg from 'pg';
import { randomBytes, randomInt, scryptSync } from 'node:crypto';

dotenv.config({ path: '.env.local', quiet: true });

const ROLES = ['ENCADRANT', 'ADMIN'];
const [role, rawMatricule, firstName, lastName, email] = process.argv.slice(2);

if (!ROLES.includes(role) || !rawMatricule || !firstName || !lastName) {
    console.error('Usage : npm run identifiant -- <ENCADRANT|ADMIN> <matricule> <prénom> <nom> [email]');
    process.exit(1);
}

// Mêmes règles que lib/staff.ts : alphabet sans caractères ambigus, 12 caractères par blocs de 4
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
let code = '';
for (let i = 0; i < 12; i++) code += ALPHABET[randomInt(ALPHABET.length)];
const salt = randomBytes(16);
const codeHash = `scrypt$${salt.toString('base64')}$${scryptSync(code, salt, 32).toString('base64')}`;
const matricule = rawMatricule.trim().toUpperCase().replace(/\s+/g, '');
const expiresAt = new Date(Date.now() + 30 * 86_400_000);

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();
try {
    const { rows } = await client.query(
        `INSERT INTO "StaffCredential" (id, role, matricule, "firstName", "lastName", email, "codeHash", "expiresAt")
         VALUES ($1, $2::"Role", $3, $4, $5, $6, $7, $8) RETURNING matricule`,
        [`sc_${randomBytes(12).toString('hex')}`, role, matricule, firstName, lastName, email?.toLowerCase() || null, codeHash, expiresAt],
    );
    await client.query(
        `INSERT INTO "AdminLog" (id, action, "targetType", summary) VALUES ($1, 'CREDENTIAL_CREATED', 'CREDENTIAL', $2)`,
        [`log_${randomBytes(12).toString('hex')}`, `Identifiants ${role} créés en ligne de commande pour ${firstName} ${lastName} (matricule ${matricule})`],
    );
    console.log(`\n✔ Identifiants ${role === 'ADMIN' ? 'administrateur' : 'encadrant'} créés pour ${firstName} ${lastName}`);
    console.log(`  Matricule         : ${rows[0].matricule}`);
    console.log(`  Code confidentiel : ${code.match(/.{4}/g).join('-')}   (affiché une seule fois)`);
    console.log(`  Valable jusqu'au  : ${expiresAt.toLocaleDateString('fr-FR')}${email ? `\n  Réservé à         : ${email.toLowerCase()}` : ''}`);
    console.log(`\nLa personne s'inscrit en choisissant « ${role === 'ADMIN' ? 'Administration' : 'Encadrant'} », puis saisit ces identifiants.\n`);
} catch (error) {
    if (error.code === '23505') console.error(`Le matricule ${matricule} existe déjà.`);
    else console.error(error.message);
    process.exitCode = 1;
} finally {
    await client.end();
}
