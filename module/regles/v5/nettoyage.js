import { Incarnations } from "../../../feature/incarnation/incarnations.js";
import { Version } from "../../common/version.js";

/**
 * Le nettoyage du monde propre aux règles v5 (voir NettoyageDialog, et Regles pour le contrat) :
 * les types à ne jamais compter comme orphelins, et deux sections, les membres de fraternité
 * introuvables et les pactes hors du monde de l'ordonnance. Les actions s'exécutent sur la
 * fenêtre de nettoyage (this).
 */
export class NettoyageV5 {

    /**
     * Pactes hors du monde de l'ordonnance : une figure ne garde, à sa première ordonnance,
     * que les pactes avec les créatures du monde de kabbale de cette ordonnance (voir
     * Ordonnance.drop). Les figures qui avaient déjà leurs ordonnances avant cette règle ont
     * gardé tous leurs pactes : cet inventaire les retrouve. Toutes les ordonnances de la
     * figure comptent, quelle que soit leur époque, comme au dépôt.
     * @returns { lignes, conflits } : les pactes à retirer, et les figures dont les
     *          ordonnances relèvent de plusieurs mondes, à corriger à la main.
     */
    static pactesHorsMonde() {
        const lignes = [];
        const conflits = [];
        const monde = m => game.i18n.localize('NEPHILIM.' + m);
        for (const figure of game.actors.filter(a => a.type === 'figure')) {
            const mondes = new Set(figure.items
                .filter(i => i.type === 'ordonnance')
                .map(i => Version.data(game.items.find(w => w.system?.id === i.system?.id)).monde)
                .filter(m => m != null));
            if (mondes.size === 0) continue;
            if (mondes.size > 1) {
                conflits.push({ figure: figure.name, mondes: [...mondes].map(monde).join(', ') });
                continue;
            }
            const ordonnance = [...mondes][0];
            for (const invocation of figure.items.filter(i => i.type === 'invocation' && Version.data(i).pacte === true)) {
                const original = game.items.find(w => w.system?.id === invocation.system?.id);
                if (original == null || Version.data(original).monde === ordonnance) continue;
                lignes.push({
                    uuid: invocation.uuid,
                    figure: figure.name,
                    creature: original.name,
                    mondeCreature: monde(Version.data(original).monde),
                    mondeOrdonnance: monde(ordonnance)
                });
            }
        }
        return { lignes, conflits };
    }

    /**
     * Retire les pactes cochés dans la section des pactes hors du monde de l'ordonnance.
     */
    static async retirerPactes(event, target) {

        event.preventDefault();

        const uuids = [...this.element.querySelectorAll('input.pacte:checked')].map(input => input.dataset.uuid);
        if (uuids.length === 0) {
            ui.notifications.info(game.i18n.localize('NEPHILIM.nettoyageAucuneSelection'));
            return;
        }

        let retires = 0;
        for (const uuid of uuids) {
            const invocation = await fromUuid(uuid);
            if (invocation == null || Version.data(invocation).pacte !== true) continue;
            await invocation.update({ [Version.path(invocation, 'pacte')]: false });
            retires++;
        }

        ui.notifications.info(game.i18n.format('NEPHILIM.nettoyagePactesTermine', { nombre: retires }));
        await this.render(false);
    }

    /**
     * Dresse la liste des membres de fraternité introuvables : les entrées d'effectif
     * dont l'identifiant ne correspond plus à aucune fiche du monde (identifiant changé
     * par une duplication, une réimportation, la migration 1.0.6, ou fiche supprimée).
     * Même critère que Fraternite.membresIntrouvables.
     * @returns les entrées introuvables, chacune décrite pour l'affichage.
     */
    static membresIntrouvables() {
        const lignes = [];
        for (const fraternite of game.actors.filter(a => a.type === 'fraternite')) {
            // [rules] L'effectif désigne la période d'un membre par la clé de l'incarnation.
            const incarnations = new Incarnations(fraternite);
            for (const membre of Version.data(fraternite).effectif ?? []) {
                if (game.actors.find(a => a.system?.id === membre.actor) != null) continue;
                const periode = incarnations.incarnation(membre.periode);
                lignes.push({
                    fraternite: fraternite.name,
                    fraterniteUuid: fraternite.uuid,
                    sid: membre.actor,
                    periode: membre.periode ?? "",
                    periodeNom: periode?.name ?? membre.periode ?? "",
                    statut: membre.status
                });
            }
        }
        return lignes;
    }

    /**
     * @returns les fiches auxquelles rattacher un membre : figures et figurants du monde,
     *          par ordre alphabétique.
     */
    static candidats() {
        return game.actors
            .filter(a => (a.type === 'figure' || a.type === 'figurant') && a.system?.id != null)
            .map(a => ({ sid: a.system.id, nom: a.name }))
            .sort((a, b) => a.nom.localeCompare(b.nom));
    }

    /**
     * Applique les choix faits sur les membres introuvables : retrait de l'effectif, ou
     * rattachement à une fiche existante. Si cette fiche est déjà membre pour la même
     * période, l'entrée introuvable est retirée, pour ne pas créer de doublon.
     */
    static async rattacher(event, target) {

        event.preventDefault();

        const choix = [...this.element.querySelectorAll('select.rattachement')]
            .filter(select => select.value !== "")
            .map(select => ({
                fraternite: select.dataset.fraternite,
                sid: select.dataset.sid,
                periode: select.dataset.periode,
                action: select.value
            }));
        if (choix.length === 0) {
            ui.notifications.info(game.i18n.localize('NEPHILIM.nettoyageMembresAucuneAction'));
            return;
        }

        let corriges = 0;
        for (const uuid of new Set(choix.map(c => c.fraternite))) {
            const fraternite = await fromUuid(uuid);
            if (fraternite == null) continue;
            const effectif = foundry.utils.duplicate(Version.data(fraternite).effectif);
            for (const c of choix.filter(c => c.fraternite === uuid)) {
                const memePeriode = m => (m.periode ?? "") === c.periode;
                const index = effectif.findIndex(m => m.actor === c.sid && memePeriode(m));
                if (index < 0) continue;
                if (c.action === 'retirer' || effectif.some(m => m.actor === c.action && memePeriode(m))) {
                    effectif.splice(index, 1);
                } else {
                    effectif[index] = { ...effectif[index], actor: c.action };
                }
                corriges++;
            }
            await fraternite.update({ [Version.path(fraternite, 'effectif')]: effectif });
        }

        ui.notifications.info(game.i18n.format('NEPHILIM.nettoyageMembresTermine', { nombre: corriges }));
        await this.render(false);
    }

}

/**
 * Ce que le jeu v5 fournit au nettoyage (voir Regles, nettoyage).
 */
export const NETTOYAGE_V5 = {
    // Les armes et les armures arrivent sur une fiche par dropHandlers : leur copie se suffit
    autonomes: ['arme', 'armure'],
    // Les objets de règles d'une incarnation (voir IncarnationsV5.REGLES)
    internes: ['laboratoire', 'akasha', 'ka'],
    sections: [
        {
            template: "systems/neph5e/module/regles/v5/nettoyage-membres.hbs",
            contexte: () => {
                const membres = NettoyageV5.membresIntrouvables();
                return { membres, nombreMembres: membres.length, candidats: NettoyageV5.candidats() };
            }
        },
        {
            template: "systems/neph5e/module/regles/v5/nettoyage-pactes.hbs",
            contexte: () => {
                const pactes = NettoyageV5.pactesHorsMonde();
                return { pactes: pactes.lignes, nombrePactes: pactes.lignes.length, conflitsMondes: pactes.conflits };
            }
        }
    ],
    actions: {
        rattacher: NettoyageV5.rattacher,
        retirerPactes: NettoyageV5.retirerPactes
    }
};
