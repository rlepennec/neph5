// Déplace les champs d'un modèle sous versions.v5, sans réécrire leurs déclarations.
import { readFileSync, writeFileSync } from "node:fs";

const RACINE = ['id', 'illustration'];

/**
 * Découpe le corps d'un littéral objet en entrées de premier niveau.
 */
function entrees(corps) {
    const out = [];
    let profondeur = 0, debut = 0, chaine = null;
    for (let i = 0; i < corps.length; i++) {
        const c = corps[i];
        if (chaine) { if (c === chaine && corps[i - 1] !== '\\') chaine = null; continue; }
        // Les commentaires sont sautés d'un bloc : leurs apostrophes (« l'ArrayField »),
        // parenthèses et virgules ne doivent ni ouvrir de chaîne ni couper d'entrée.
        if (c === '/' && corps[i + 1] === '/') { const fin = corps.indexOf("\n", i); i = fin === -1 ? corps.length : fin; continue; }
        if (c === '/' && corps[i + 1] === '*') { const fin = corps.indexOf("*/", i + 2); i = fin === -1 ? corps.length : fin + 1; continue; }
        if (c === '"' || c === "'" || c === '`') { chaine = c; continue; }
        if ('{(['.includes(c)) profondeur++;
        else if ('})]'.includes(c)) profondeur--;
        else if (c === ',' && profondeur === 0) { out.push(corps.slice(debut, i)); debut = i + 1; }
    }
    const reste = corps.slice(debut);
    if (reste.trim() !== '') out.push(reste);
    return out;
}

export function porter(fichier, type) {

    const avant = readFileSync(fichier, "utf8");
    const eol = avant.includes("\r\n") ? "\r\n" : "\n";
    const source = avant.replaceAll("\r\n", "\n");

    if (source.includes("versions:")) return { ok: false, raison: "déjà porté" };

    // Le corps du littéral rendu par defineSchema.
    const i = source.indexOf("return {");
    if (i === -1) return { ok: false, raison: "return { introuvable" };
    let profondeur = 0, fin = -1;
    for (let j = source.indexOf("{", i); j < source.length; j++) {
        if (source[j] === '{') profondeur++;
        else if (source[j] === '}') { profondeur--; if (profondeur === 0) { fin = j; break; } }
    }
    if (fin === -1) return { ok: false, raison: "accolade non fermée" };

    const corps = source.slice(source.indexOf("{", i) + 1, fin);
    const parts = entrees(corps);

    const racine = [], version = [];
    for (const p of parts) {
        // Le nom suit d'éventuels commentaires, qu'on garde avec l'entrée qu'ils décrivent.
        const sansCommentaires = p.trim().replace(/^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)*/, "").trim();
        const nom = sansCommentaires.match(/^(\w+)\s*:/)?.[1];
        if (nom == null) return { ok: false, raison: "entrée illisible : " + p.trim().slice(0, 40) };
        (RACINE.includes(nom) ? racine : version).push(p.trim());
    }
    if (version.length === 0) return { ok: false, raison: "rien à déplacer" };

    // Ré-indente une entrée : sa première ligne est déjà nue, les suivantes portent
    // l'indentation du fichier d'origine, qu'il faut retrancher avant de poser la neuve.
    const indente = (texte, n) => {
        const lignes = texte.split("\n");
        const suites = lignes.slice(1).filter(l => l.trim() !== "");
        const base = suites.length === 0 ? 0 : Math.min(...suites.map(l => l.match(/^ */)[0].length));
        return lignes.map((l, i) => i === 0 ? " ".repeat(n) + l
            : l.trim() === "" ? l : " ".repeat(n) + l.slice(base)).join("\n");
    };

    const nouveau = "{\n"
        + racine.map(e => indente(e, 12)).join(",\n")
        + (racine.length > 0 ? ",\n" : "")
        + "            versions: new ChunkField\n"
        + "            (\n"
        + "                {\n"
        + "                    v1: new ChunkField({}, { scope: 'v1' }),\n"
        + "                    v5: new ChunkField\n"
        + "                    (\n"
        + "                        {\n"
        + version.map(e => indente(e, 28)).join(",\n") + "\n"
        + "                        },\n"
        + "                        { scope: 'v5' }\n"
        + "                    )\n"
        + "                },\n"
        + "                { scope: 'versions' }\n"
        + "            )\n"
        + "        }";

    let sortie = source.slice(0, source.indexOf("{", i)) + nouveau + source.slice(fin + 1);

    // Les imports, en tête, sur le modèle de ceux qui s'y trouvent déjà.
    const profond = fichier.split("/").length - 1;
    const prefixe = "../".repeat(profond);
    const imports = `import { ChunkField } from "${prefixe}module/field/chunkField.js";\n`
        + `import { VersionMigration } from "${prefixe}module/migration/versionMigration.js";\n`;
    sortie = imports + sortie;

    // migrateData, juste avant la dernière accolade de la classe.
    const crochet = `
    /**
     * Le crochet que Foundry appelle avant d'élaguer les champs hors schéma — le seul
     * endroit d'où l'ancienne forme est encore lisible. Ce qu'il déplace est décrit dans
     * VersionMigration, avec les migrations.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        return VersionMigration.apply('${type}', source);
    }

}`;
    const derniere = sortie.lastIndexOf("\n}");
    sortie = sortie.slice(0, derniere) + crochet + sortie.slice(derniere + 2);

    writeFileSync(fichier, sortie.replaceAll("\n", eol), "utf8");
    return { ok: true, champs: version.map(e => e.replace(/^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)*/, "").trim().match(/^(\w+)/)[1]) };
}
