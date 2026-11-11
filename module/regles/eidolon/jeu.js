import { FicheActeurEidolon } from "../../actor/regles/eidolon/ficheActeurEidolon.js";

/**
 * Le jeu de règles d'eidolon (voir Regles pour le contrat), volontairement pauvre en attendant
 * les règles : une fiche simple par type d'acteur, et rien d'autre. Ni jet, ni quête, ni combat,
 * ni outil du MJ : il prouve que le commun tourne sans le v5. Les objets n'ont pas de fiche à lui
 * et reçoivent la fiche vide.
 */
export const JeuEidolon = {
    version: 'eidolon',

    fiches: {
        Actor: {
            figure: FicheActeurEidolon,
            figurant: FicheActeurEidolon,
            fraternite: FicheActeurEidolon
        }
    }
};
