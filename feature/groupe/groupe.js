import { Version } from "../../module/common/version.js";

/**
 * Les groupes de compétences. Un groupe (item du monde de type `groupe`) réunit des
 * compétences et dit avec quelles versions de règles il est compatible. Une compétence peut
 * appartenir à plusieurs groupes.
 *
 * Une compétence est ACTIVE si au moins un de ses groupes est compatible avec la version de
 * règles du monde. Une compétence inactive disparaît de la liste des compétences de la figure,
 * des vécus, des armes, de l'esquive, de la lutte et des décomptes de degrés ; rien n'est
 * supprimé : les références restent, et reviennent si la compétence redevient active.
 */
export class Groupe {

    /**
     * @param version La version de règles, celle du monde par défaut.
     * @returns {Set<string>} les sid des compétences actives pour cette version.
     */
    static competencesActives(version = Version.world) {
        const actives = new Set();
        for (const groupe of game.items) {
            if (groupe.type !== 'groupe' || !groupe.system.compatibilites.includes(version)) continue;
            for (const sid of groupe.system.competences) actives.add(sid);
        }
        return actives;
    }

    /**
     * @param sid The system identifier of a competence.
     * @returns true if the competence is active for the rules version of the world.
     */
    static estActive(sid) {
        return sid != null && Groupe.competencesActives().has(sid);
    }

    /**
     * Filtre une référence vers une compétence ou un vécu (compétence d'une arme, esquive,
     * lutte, compétence d'un vécu).
     * @param sid The system identifier of the referenced item, null for none.
     * @returns the identifier, null if it designates an inactive competence.
     */
    static reference(sid) {
        if (sid == null) return null;
        const item = game.items.find(i => i.sid === sid);
        return item?.type === 'competence' && !Groupe.estActive(sid) ? null : sid;
    }

}
