// scripts/definir-role.mjs
// Attribue un rôle à un compte existant (l'inscription crée toujours des étudiants).
// Usage : npm run role -- prenom.nom@exemple.com ENCADRANT
//         npm run role -- prenom.nom@exemple.com STUDENT
// Le compte doit s'être connecté au moins une fois (le profil est créé à la première connexion).
import 'dotenv/config';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local', quiet: true });

const ROLES = ['STUDENT', 'ENCADRANT', 'ADMIN'];
const [email, role] = process.argv.slice(2);

if (!email || !ROLES.includes(role)) {
    console.error(`Usage : npm run role -- <email> <${ROLES.join('|')}>`);
    process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
    const { rows } = await client.query(
        `UPDATE "User" SET role = $2::"Role", "updatedAt" = now() WHERE lower(email) = lower($1) RETURNING email, "firstName", "lastName", role`,
        [email, role],
    );
    if (rows.length === 0) {
        console.error(`Aucun compte trouvé pour ${email}. La personne doit d'abord s'inscrire puis se connecter une fois.`);
        process.exitCode = 1;
    } else {
        const u = rows[0];
        console.log(`✔ ${u.firstName} ${u.lastName} (${u.email}) a maintenant le rôle ${u.role}.`);
    }
} finally {
    await client.end();
}
