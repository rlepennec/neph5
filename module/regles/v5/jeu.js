import { IncarnationsV5 } from "../../../feature/incarnation/regles/v5/incarnations.js";
import { ActeurV5 } from "../../actor/regles/v5/acteurV5.js";
import { Fraternite } from "../../../feature/fraternite/regles/v5/fraternite.js";
import { EvenementsV5 } from "./evenements.js";
import { OutilsV5 } from "./outils.js";

/**
 * Le jeu de règles de la cinquième édition (voir Regles pour le contrat).
 *
 * Il se remplit au fil du découplage : une partie du code v5 est encore appelée directement par
 * le commun.
 */
export const JeuV5 = {
    version: 'v5',

    evenements: EvenementsV5,

    outils: OutilsV5,

    acteur: actor => new ActeurV5(actor),

    incarnationCreee: (actor, cle, anterieure) => new IncarnationsV5(actor).incarnationCreee(cle, anterieure),

    supprimerLies: (actor, items) => new IncarnationsV5(actor).supprimerLies(items),

    // Les membres de l'effectif d'une fraternité sont inscrits par incarnation
    incarnationRetiree: async (actor, cle) => {
        if (actor.type === 'fraternite') await new Fraternite(actor).onDeletePeriode({ sid: cle });
    }
};
