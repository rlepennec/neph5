import { Macros } from "../../macros.js";

/**
 * Les macros des règles v5 : un jet glissé d'une fiche (Ka, lutte, arme, vécu...) dans la barre.
 * La macro appelle actor.regles.processMacro sur l'acteur du token sélectionné.
 */
export class MacrosV5 {

    /**
     * Doit rester synchrone (voir Macros.handles).
     * @param data Les données du dépôt.
     * @returns true if the drop is a roll of a sheet.
     */
    static handles(data) {
        return data?.process === 'macro';
    }

    /**
     * Crée la macro du jet glissé et la place dans la barre.
     * @param data Les données du dépôt.
     * @param slot L'emplacement de la barre.
     */
    static async create(data, slot) {

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
                await token.actor.regles.processMacro('` + data.type + `', '` + data.id + `', '` + data.sid + `');
            }
        })()`;

        await Macros.assign(name, img, command, slot);

    }

}
