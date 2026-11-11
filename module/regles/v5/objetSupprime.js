import { Version } from "../../common/version.js";

/**
 * Retire des autres documents du monde les références des règles v5 à un item du monde supprimé
 * (voir Regles, objetSupprime). Le commun a déjà retiré ses incarnations s'il s'agit d'une période,
 * et retire ensuite ses copies embarquées.
 * @param item The deleted world item.
 */
export async function objetSupprimeV5(item) {

    // Les acteurs du monde et ceux des tokens des scènes
    const acteurs = [...game.actors];
    for (const scene of game.scenes) {
        for (const token of scene.tokens) {
            if (token.actor != null) acteurs.push(token.actor);
        }
    }

    switch (item.type) {

        case 'catalyseur':

            // Remove the catalyseur reference from formule items
            for (let formule of game.items.filter(i => i.type === 'formule')) {
                await formule.deleteCatalyseur(item);
            }

            break;

        case 'competence':

            // Delete the competence from each actor of the world and scenes
            for (const actor of acteurs) {
                await actor.regles.deleteCompetence?.(item);
            }

            // Delete from all vecus of the world
            for (let vecu of game.items.filter(i => i.type === 'vecu')) {
                await vecu.deleteCompetence(item);
            }

            // Delete from all armes of the world
            for (let arme of game.items.filter(i => i.type === 'arme' && Version.data(i).competence === item.sid)) {
                await arme.update({ [Version.path(arme, 'competence')]: null });
            }

            // Remove from all groups of the world
            for (let groupe of game.items.filter(i => i.type === 'groupe' && i.system.competences.includes(item.sid))) {
                await groupe.update({ 'system.competences': groupe.system.competences.filter(sid => sid !== item.sid) });
            }

            break;

        case 'formule':

            // Delete from all formules of the world
            for (let formule of game.items.filter(i => i.type === "formule")) {
                await formule.deleteVariante(item);
            }

            break;

        case 'magie':

            // Delete from all sorts of the world
            for (let sort of game.items.filter(i => i.type === "sort" || i.type === "habitus")) {
                await sort.deleteMagie(item);
            }

            break;

        case 'periode':

            // Delete from all vecus of the world
            for (let vecu of game.items.filter(i => i.type === 'vecu' && Version.data(i).periode === item.sid)) {
                await vecu.update({ [Version.path(vecu, 'periode')]: null });
            }

            break;

        case 'vecu':

            // Update each actor of the world and scenes
            for (const actor of acteurs) {
                await actor.regles.deleteVecu?.(item);
            }

            // Delete from all armes of the world
            for (let arme of game.items.filter(i => i.type === 'arme' && Version.data(i).competence === item.sid)) {
                await arme.update({ [Version.path(arme, 'competence')]: null });
            }

            break;

    }

    // Les manœuvres d'esquive et de lutte des acteurs qui la désignaient
    for (const actor of acteurs) {
        if (Version.data(actor).manoeuvres?.esquive === item.sid) {
            await actor.update({ [Version.path(actor, 'manoeuvres') + '.esquive']: null });
        }
        if (Version.data(actor).manoeuvres?.lutte === item.sid) {
            await actor.update({ [Version.path(actor, 'manoeuvres') + '.lutte']: null });
        }
    }
}
