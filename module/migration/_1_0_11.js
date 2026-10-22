import { MigrationTools } from "./migration.js";

/**
 * 1.0.11 : les groupes de compétences. Seules les compétences d'un groupe compatible avec la
 * version de règles du monde sont actives (voir Groupe) : le monde reçoit un groupe
 * « Compétences V5 », compatible v5, qui contient toutes ses compétences. Un monde qui a déjà
 * un groupe n'en reçoit pas d'autre.
 */
export class _1_0_11 {

    /**
     * Le nom du groupe créé.
     */
    static NOM = "Compétences V5";

    static async migrate(target) {

        const msg = "Updating to " + target;
        MigrationTools.progress(msg, 0, 1);

        if (!game.items.some(i => i.type === 'groupe')) {
            const competences = game.items.filter(i => i.type === 'competence')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(i => i.sid);
            await CONFIG.Item.documentClass.create({
                name: _1_0_11.NOM,
                type: 'groupe',
                system: {
                    compatibilites: ['v5'],
                    competences: competences
                }
            });
        }

        MigrationTools.progress(msg, 1, 1);
        await game.settings.set("neph5e", "worldTemplateVersion", target);
        ui.notifications.info("Update to " + target + " done");
    }

}
