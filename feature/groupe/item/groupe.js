import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { Version } from "../../../module/common/version.js";

/**
 * L'éditeur d'un groupe de compétences : son nom (l'en-tête), ses compatibilités avec les
 * versions de règles, sa base, et ses compétences, qu'on y dépose et qu'on en retire.
 * Supprimer le groupe ne supprime pas ses compétences.
 */
export class GroupeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-groupe"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/groupe/item/groupe.html`,
        }
    }

    /**
     * Le nom, les compatibilités et les compétences ne dépendent pas des règles : la fiche
     * s'affiche même pour une version où le groupe ne définit rien (v2...), au lieu de la fiche
     * « version vide ».
     * @override
     */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        const style = game.settings.get('neph5e', 'styleItemSheet');
        parts.main.template = `systems/neph5e/feature/groupe/item/groupe-${style}.html`;
        return parts;
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                // Une case par version de règles
                compatibilites: Version.ALL.map(version => ({
                    version: version,
                    active: this.document.system.compatibilites.includes(version)
                })),
                // Les compétences, par ordre alphabétique ; celles qui n'existent plus à la fin
                competences: GroupeSheet.parNom(this.document.system.competences)
            }
        }
    }

    /**
     * @param sids The system identifiers of competences.
     * @returns them sorted by the name of their world item; unknown ones last.
     */
    static parNom(sids) {
        const nom = sid => game.items.find(i => i.sid === sid)?.name;
        return [...sids].sort((a, b) => {
            const na = nom(a), nb = nom(b);
            if (na == null || nb == null) return (na == null) - (nb == null);
            return na.localeCompare(nb);
        });
    }

    /**
     * Une compétence déposée rejoint le groupe ; déjà présente, rien.
     * @param event    The drop event.
     * @param document The dropped document.
     */
    async _onDrop(event, document) {
        event.preventDefault();
        if (document?.type !== 'competence') return;
        const competences = this.document.system.competences;
        if (competences.includes(document.sid)) return;
        await this.document.update({ 'system.competences': [...competences, document.sid] });
    }

    /**
     * La corbeille retire la compétence du groupe, sans la supprimer.
     * @override
     */
    async _onDelete(event, document) {
        if (document?.type !== 'competence') return;
        await this.document.update({
            'system.competences': this.document.system.competences.filter(sid => sid !== document.sid)
        });
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {
        const objet = formData.object;

        // Les compétences se changent par dépôt et par la corbeille : les champs cachés de leur
        // liste ne sont pas enregistrés
        for (const key of Object.keys(objet).filter(k => k.startsWith('system.competences.'))) {
            delete objet[key];
        }

        // Une case par version de règles : la liste des compatibilités. Fiche verrouillée, les
        // cases ne sont pas envoyées et la liste reste telle quelle.
        const cases = Version.ALL.map(version => 'compatibilites.' + version);
        if (cases.some(key => key in objet)) {
            objet['system.compatibilites'] = Version.ALL.filter(version => objet['compatibilites.' + version] === true);
        }
        for (const key of cases) {
            delete objet[key];
        }

        await this.document.update(objet);
    }

}
