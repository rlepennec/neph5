export class Macros {

    /**
     * Indique si le dépôt doit être pris en charge par le système. Doit rester
     * synchrone : le hook hotbarDrop s'en sert pour annuler le traitement par défaut
     * de Foundry, qui créerait sinon une macro "Display ..." à l'icône générique.
     * @param data Les données du dépôt.
     * @returns {boolean}
     */
    static handles(data) {
        if (data?.process === 'macro') return true;
        return data?.type === 'Item'
            && typeof data?.uuid === 'string'
            && data.uuid.startsWith('Item.');
    }

    static async create(bar, data, slot) {

        // Objet du monde glissé depuis le répertoire : macro d'affichage de la fiche,
        // reprenant le nom et l'icône de l'objet (Foundry utiliserait une icône générique).
        if (data?.process !== 'macro') {
            if (!Macros.handles(data)) return;
            const dropped = await fromUuid(data.uuid);
            if (dropped == null) return;
            await Macros.assign(
                dropped.name,
                dropped.img,
                `(await fromUuid("${data.uuid}"))?.sheet.render(true);`,
                slot);
            return;
        }

        let name = null;
        let img = null;
        switch (data.type) {

            case 'item': {
                const item = game.items.find(i => i.sid === data.sid);
                name = item?.name;
                img = item?.img;
                break;
            }
                
            case 'vecu': {
                const item = game.items.find(i => i.sid === data.sid);
                name = item?.name;
                img = item?.img;
                break;
            }

            case 'wrestle': {
                name = "Lutte";
                img = "systems/neph5e/assets/icons/lutte.webp";
                break;
            }

            case 'weapon': {
                const actor = game.actors.get(data.actor);
                const item = actor.items.find(i => i.id === data.id);
                name = item?.name;
                img = item?.img;
                break;
            }

            case 'ka': {
                name = "Ka " + data.id;
                img = "systems/neph5e/assets/icons/ka.webp";
                break;
            }

            case 'noyau':
                name = "Noyau";
                img = "systems/neph5e/assets/icons/noyau.webp";
                break;

            case 'pavane':
                name = "Pavane";
                img = "systems/neph5e/assets/icons/pavane.webp";
                break;

            default:
                return;
        }

        let command = `( async () => {
            if (token?.actor != null) {
                await token.actor.processMacro('` + data.type + `', '` + data.id + `', '` + data.sid + `');
            }
        })()`;

        await Macros.assign(name, img, command, slot);

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