export const Game = {};

// Ce fichier ne contient plus que des DONNÉES de jeu : blessures et états, avec
// leurs modificateurs et leurs phrases. Les neuf tables clef → chemin i18n qui
// l'occupaient (alchimie, kabbale, magie, analogie, pentacle, elements,
// conjuration, necromancie, denier) ont été retirées : elles n'avaient plus
// aucun lecteur. Les énumérations vivent désormais dans constants.js, et les
// libellés dans NEPHILIM (fr.json).

Game.wounds = {
    choc: {
        id: "choc",
        sentence: "quelques blessures superficielles",
        magique: "quelques blessures magiques superficielles",
        modifier: 0
    },
    mineure: {
        id: "mineure",
        sentence: "une blessure légère",
        magique: "une blessure magique légère",
        modifier: -20
    },
    serieuse: {
        id: "serieuse",
        sentence: "une blessure sérieuse",
        magique: "une blessure magique sérieuse",
        modifier: -40
    },
    grave: {
        id: "grave",
        sentence: "une blessure grave",
        magique: "une blessure magique grave",
        modifier: -60
    },
    mortelle: {
        id: "mortelle",
        sentence: "une blessure mortelle",
        magique: "une blessure magique mortelle",
        modifier: -200
    }
}

Game.effects = {
    immobilise: {
        id: "immobilise",
        sentence: " est immobilisé",
        damages: 0,
        status: {
            icon: "icons/svg/net.svg",
            id: "restrain",
            label: "EFFECT.StatusRestrained"
        },
        modifier: 4
    },
    desoriente: {
        id: "desoriente",
        sentence: " est désorienté",
        status: {
            icon: "icons/svg/daze.svg",
            id: "stun",
            label: "EFFECT.StatusStunned"
        },
        modifier: -2
    },
    projete: {
        id: "projete",
        sentence: " est projeté",
        damages: 1,
        status: {
            icon: "icons/svg/falling.svg",
            id: "prone",
            label: "EFFECT.StatusProne"
        },
        modifier: -2
    },
    desarme: {
        id: "desarme",
        sentence: " est desarmé",
        modifier: null
    },
    couvert: {
        id: "couvert",
        sentence: " est à couvert",
        modifier: -3
    },
    cache: {
        id: "cache",
        sentence: " est caché",
        modifier: -10
    },
    inconscient: {
        id: "inconscient",
        sentence: " est inconscient",
        status: {
            icon: "icons/svg/unconscious.svg",
            id: "unconscious",
            label: "EFFECT.StatusUnconscious"
        },
        modifier: null
    },
    mort: {
        id: "mort",
        sentence: " est mort",
        status: {
            icon: "icons/svg/skull.svg",
            id: "dead",
            label: "EFFECT.StatusDead"
        },
        modifier: null
    }

}