import { AbstractDialog } from "../../feature/core/abstractDialog.js";

/**
 * Nettoyage des items embarqués orphelins.
 *
 * QU'EST-CE QU'UN ORPHELIN
 *
 * Un item posé sur une fiche — un sort, un vécu, une période… — n'est pas une
 * copie indépendante : il garde le system.id de l'item du monde dont il est
 * issu, et c'est par cet identifiant que le système retrouve sa source pour en
 * lire le degré, la description ou la période. Quand la source disparaît, la
 * copie reste sur la fiche, d'apparence normale, mais ne mène plus à rien :
 * HistoricalFeature.withEmbeddedItem() ne trouve plus l'original, et le premier
 * accès à ses données lève une erreur. Le symptôme typique est un item qui
 * s'affiche mais dont le clic ne fait rien.
 *
 * DEUX EXCLUSIONS, ET POURQUOI
 *
 * 1. Les armes et les armures ne sont JAMAIS concernées. Elles arrivent sur une
 *    fiche par dropHandlers, pas par EmbeddedItem : la copie embarque toutes ses
 *    données et se suffit à elle-même. Une arme sans item du monde correspondant
 *    est parfaitement normale, et la supprimer retirerait son équipement au
 *    personnage.
 *
 * 2. Un item dont la source vit dans un COMPENDIUM n'est pas orphelin. Glisser
 *    un item d'un compendium sur une fiche sans l'importer dans le monde est un
 *    usage courant : le sid embarqué n'est alors dans aucun game.items, ce qui
 *    donnerait un faux positif massif. Les index des compendiums sont donc lus
 *    avec le champ system.id.
 *
 * L'inventaire ne modifie rien. La suppression demande une confirmation et ne
 * touche que des items EMBARQUÉS : aucun item du monde, aucun compendium.
 */
export class NettoyageDialog extends AbstractDialog {

    /**
     * Types dont la copie embarquée est autonome : ils n'ont pas de source à
     * retrouver. La liste vient de dropHandlers, elle n'est pas arbitraire.
     */
    static AUTONOMES = ['arme', 'armure'];

    static DEFAULT_OPTIONS = {
        id: "nephilim-nettoyage",
        classes: ["nephilim", "sheet", "nettoyage"],
        position: {
            width: 900,
            height: "auto"
        },
        window: {
            title: "NEPHILIM.nettoyage",
            resizable: true
        },
        actions: {
            supprimer: NettoyageDialog._onSupprimer,
            toutCocher: NettoyageDialog._onToutCocher,
            toutDecocher: NettoyageDialog._onToutDecocher
        }
    };

    static PARTS = {
        main: {
            template: "systems/neph5e/module/common/nettoyage.hbs"
        }
    };

    constructor() {
        super(null);
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const orphelins = await NettoyageDialog.inventaire();
        return {
            orphelins: orphelins,
            nombre: orphelins.length,
            autonomes: NettoyageDialog.AUTONOMES.map(t => game.i18n.localize('TYPES.Item.' + t)).join(', ')
        };
    }

    /**
     * Dresse l'inventaire des items embarqués sans source.
     *
     * Le parcours couvre les acteurs du monde ET les acteurs des tokens des
     * scènes — un token non lié porte ses propres items. Les tokens liés
     * renvoient vers l'acteur du monde : le dédoublonnage se fait sur l'uuid de
     * l'acteur, faute de quoi les mêmes items seraient listés deux fois.
     *
     * @returns la liste des orphelins, chacun décrit pour l'affichage.
     */
    static async inventaire() {

        const sources = await NettoyageDialog.sources();
        const orphelins = [];
        const vus = new Set();

        const examiner = (acteur, origine) => {
            if (acteur == null || vus.has(acteur.uuid)) return;
            vus.add(acteur.uuid);
            for (const item of acteur.items) {
                if (NettoyageDialog.AUTONOMES.includes(item.type)) continue;
                const sid = item.system?.id;
                if (sid == null || sid === "" || sources.has(sid)) continue;
                orphelins.push({
                    uuid: item.uuid,
                    acteur: acteur.name,
                    origine: origine,
                    item: item.name,
                    type: game.i18n.localize('TYPES.Item.' + item.type),
                    sid: sid
                });
            }
        };

        for (const acteur of game.actors) {
            examiner(acteur, game.i18n.localize('NEPHILIM.nettoyageMonde'));
        }
        for (const scene of game.scenes) {
            for (const token of scene.tokens) {
                examiner(token.actor, scene.name);
            }
        }

        return orphelins;
    }

    /**
     * @returns l'ensemble des system.id disponibles : ceux des items du monde,
     *          puis ceux des items de tous les compendiums d'items.
     */
    static async sources() {

        const sources = new Set();

        for (const item of game.items) {
            const sid = item.system?.id;
            if (sid != null && sid !== "") sources.add(sid);
        }

        for (const pack of game.packs.filter(p => p.documentName === 'Item')) {
            // Le champ system.id n'est pas indexé par défaut : il faut le
            // demander explicitement, sinon tout item de compendium passerait
            // pour absent.
            const index = await pack.getIndex({ fields: ['system.id'] });
            for (const entree of index) {
                const sid = entree.system?.id;
                if (sid != null && sid !== "") sources.add(sid);
            }
        }

        return sources;
    }

    /**
     * @returns les uuid des lignes cochées.
     */
    selection() {
        return [...this.element.querySelectorAll('input.selection:checked')]
            .map(input => input.dataset.uuid);
    }

    static async _onToutCocher(event, target) {
        event.preventDefault();
        this.element.querySelectorAll('input.selection').forEach(i => i.checked = true);
    }

    static async _onToutDecocher(event, target) {
        event.preventDefault();
        this.element.querySelectorAll('input.selection').forEach(i => i.checked = false);
    }

    /**
     * Supprime les items embarqués sélectionnés, après confirmation.
     */
    static async _onSupprimer(event, target) {

        event.preventDefault();

        const uuids = this.selection();
        if (uuids.length === 0) {
            ui.notifications.info(game.i18n.localize('NEPHILIM.nettoyageAucuneSelection'));
            return;
        }

        const confirme = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize('NEPHILIM.nettoyage') },
            content: '<p>' + game.i18n.format('NEPHILIM.nettoyageConfirmation', { nombre: uuids.length }) + '</p>',
            rejectClose: false,
            modal: true
        });
        if (confirme !== true) return;

        let supprimes = 0;
        for (const uuid of uuids) {
            // fromUuid plutôt qu'un identifiant conservé en mémoire : la fenêtre
            // a pu rester ouverte pendant qu'un item disparaissait ailleurs.
            const item = await fromUuid(uuid);
            if (item == null) continue;
            await item.delete();
            supprimes++;
        }

        ui.notifications.info(game.i18n.format('NEPHILIM.nettoyageTermine', { nombre: supprimes }));
        await this.render(false);
    }

}