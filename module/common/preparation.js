import { Version } from "./version.js";

/**
 * La version de préparation du MJ : en mode création, la version de règles dans laquelle son
 * client travaille (voir Version.world). Elle vaut pour tout son client, fiches, répertoires et
 * compendiums compris ; les joueurs, et les traitements communs à la table (voir Version.table),
 * restent sur la version du monde.
 */
export class Preparation {

    /**
     * @returns the tool of the Nephilim scene controls, null if the user cannot prepare.
     */
    static outil() {
        if (game.user?.isGM !== true || Version.filtreStrict) return null;
        const actuelle = Version.world;
        return {
            name: "preparation",
            title: game.i18n.localize("NEPHILIM.versionPreparation") + " : " + game.i18n.localize("NEPHILIM." + actuelle),
            icon: "fa-solid fa-book",
            order: 0,
            button: true,
            onChange: () => Preparation.choisir()
        };
    }

    /**
     * Demande au MJ sa version de préparation.
     */
    static async choisir() {
        const monde = Version.table;
        const actuelle = game.settings.get('neph5e', 'versionPreparation') || '';
        const option = (valeur, libelle) =>
            `<option value="${valeur}"${valeur === actuelle ? ' selected' : ''}>${libelle}</option>`;
        const options = [
            option('', game.i18n.localize("NEPHILIM.versionDuMonde") + " (" + game.i18n.localize("NEPHILIM." + monde) + ")"),
            ...Version.ALL.filter(v => v !== monde).map(v => option(v, game.i18n.localize("NEPHILIM." + v)))
        ];
        const choix = await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("NEPHILIM.versionPreparation") },
            content: `<select name="version">${options.join('')}</select>`,
            ok: { callback: (event, button) => button.form.elements.version.value },
            rejectClose: false
        });
        if (choix == null || choix === actuelle) return;
        await game.settings.set('neph5e', 'versionPreparation', choix);
    }

}
