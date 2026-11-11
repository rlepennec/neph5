import { NephilimActorSheet } from "./nephilimActorSheet.js";

/**
 * La fiche d'un acteur quand les règles de la version du monde n'en fournissent pas : l'image, le
 * nom, et l'annonce qu'il n'y a rien à montrer (voir Fiches).
 */
export class FicheActeurVide extends NephilimActorSheet {

    static PARTS = {
        main: {
            template: `systems/neph5e/templates/version-vide-acteur.html`,
        }
    }

}
