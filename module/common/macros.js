/**
 * Les macros communes : un objet du monde glissé du répertoire dans la barre ouvre sa fiche. Les
 * règles ajoutent les leurs (macroDeposee, voir Regles).
 */
export class Macros {

    /**
     * Indique si le dépôt doit être pris en charge par le système. Doit rester
     * synchrone : le hook hotbarDrop s'en sert pour annuler le traitement par défaut
     * de Foundry, qui créerait sinon une macro "Display ..." à l'icône générique.
     * @param data Les données du dépôt.
     * @returns {boolean}
     */
    static handles(data) {
        return data?.type === 'Item'
            && typeof data?.uuid === 'string'
            && data.uuid.startsWith('Item.');
    }

    /**
     * Objet du monde glissé depuis le répertoire : macro d'affichage de la fiche,
     * reprenant le nom et l'icône de l'objet (Foundry utiliserait une icône générique).
     * @param bar  La barre.
     * @param data Les données du dépôt.
     * @param slot L'emplacement de la barre.
     */
    static async create(bar, data, slot) {
        if (!Macros.handles(data)) return;
        const dropped = await fromUuid(data.uuid);
        if (dropped == null) return;
        await Macros.assign(
            dropped.name,
            dropped.img,
            `(await fromUuid("${data.uuid}"))?.sheet.render(true);`,
            slot);
    }

    /**
     * Crée la macro et la place dans la barre.
     * @param name    Le nom de la macro.
     * @param img     L'icône de la macro.
     * @param command Le script exécuté au clic.
     * @param slot    L'emplacement de la barre.
     */
    static async assign(name, img, command, slot) {
        const macro = await Macro.create({
            name: name,
            type: "script",
            img: img,
            command: command,
            flags: {"neph5e.macro": true}
        });
        game.user.assignHotbarMacro(macro, slot);
    }

}
