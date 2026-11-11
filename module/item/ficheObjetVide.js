import { NephilimItemSheet } from "./nephilimItemSheet.js";

/**
 * La fiche d'un objet quand les règles de la version du monde n'en fournissent pas : l'en-tête, et
 * l'annonce qu'il n'y a rien à montrer (voir Fiches).
 */
export class FicheObjetVide extends NephilimItemSheet {

    static PARTS = {
        main: {
            template: `systems/neph5e/templates/version-vide.html`,
        }
    }

    /**
     * @override
     * Le même gabarit quel que soit le style : pas de suffixe.
     */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        parts.main.template = `systems/neph5e/templates/version-vide.html`;
        return parts;
    }

}
