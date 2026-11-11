import { ExperienceDialog } from "../../../feature/experience/regles/v5/experience.js";
import { RechercheDialog } from "../../../feature/recherche/regles/v5/recherche.js";

/**
 * Les outils du MJ propres aux règles v5, ajoutés au groupe de contrôles Nephilim (voir Regles).
 * `order` les place parmi les outils communs.
 */
export const OutilsV5 = {
    recherche: {
        name: "recherche",
        title: "Recherche occulte",
        icon: "fa fa-book-open",
        order: 1,
        toggle: true,
        onChange: (e, t) => { new RechercheDialog().render(true) }
    },
    experience: {
        name: "experience",
        title: "Expérience",
        icon: "fa-solid fa-coins",
        order: 3,
        toggle: true,
        onChange: (e, t) => { new ExperienceDialog().render(true) }
    }
};
