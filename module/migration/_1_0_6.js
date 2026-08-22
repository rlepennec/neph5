import { MigrationTools } from "./migration.js";

/**
 * Le thème d'un acteur était la seule valeur du système écrite en kebab-case :
 * Constants.THEMES portait 'lune-noire' là où le reste du code — Ka, chute,
 * option d'acteur, élément d'un sort — écrit 'luneNoire'. Le décalage se voyait
 * ailleurs : une fiche de sort de Lune Noire posait la classe skin-luneNoire,
 * qui ne correspondait à aucune règle CSS, et perdait la teinte de son Ka.
 *
 * Le vocabulaire est désormais unique. Cette migration convertit les acteurs
 * dont le thème valait encore 'lune-noire' ; sans elle, ils retomberaient
 * silencieusement sur l'apparence par défaut.
 *
 * Le thème est une préférence d'affichage : aucune donnée de jeu n'est en jeu.
 */
export class _1_0_6 {

    static ANCIEN = 'lune-noire';
    static NOUVEAU = 'luneNoire';

    static async migrate(target) {

        const msg = "Updating to " + target;
        const size = game.actors.length;
        let migrated = 0;
        let convertis = 0;

        for (const actor of game.actors) {
            if (await _1_0_6.migrate_theme(actor)) convertis++;
            MigrationTools.progress(msg, ++migrated, size);
        }

        game.settings.set("neph5e", "worldTemplateVersion", target);
        ui.notifications.info("Update to " + target + " done"
            + (convertis > 0 ? " (" + convertis + " thème(s) Lune Noire converti(s))" : ""));
    }

    /**
     * @param actor L'acteur à traiter.
     * @returns true si son thème a été converti.
     */
    static async migrate_theme(actor) {
        if (actor.system?.options?.theme !== _1_0_6.ANCIEN) return false;
        await actor.update({ ['system.options.theme']: _1_0_6.NOUVEAU });
        return true;
    }

}
