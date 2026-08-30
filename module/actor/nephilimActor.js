import { Arcane } from "../../feature/arcane/arcane.js";
import { Aspect } from "../../feature/selenim/aspect.js";
import { Capacite } from "../../feature/capacite/capacite.js";
import { Catalyseur } from "../../feature/alchimie/catalyseur.js";
import { Chute } from "../../feature/chute/chute.js";
import { CombattantMixin } from "./combattantMixin.js";
import { Competence } from "../../feature/competence/competence.js";
import { Constants } from "../common/constants.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Fraternite } from "../../feature/fraternite/fraternite.js";
import { Laboratoire } from "../../feature/alchimie/laboratoire.js";
import { Materiae } from "../../feature/alchimie/materiae.js";
import { Metamorphe } from "../../feature/nephilim/metamorphe.js";
import { Ordonnance } from "../../feature/kabbale/ordonnance.js";
import { Periode } from "../../feature/periode/periode.js";
import { Savoir } from "../../feature/savoir/savoir.js";
import { Science } from "../../feature/science/science.js";
import { Vecu } from "../../feature/vecu/vecu.js";

/**
 * [V14] Le combat a ete extrait dans CombattantMixin (combattantMixin.js) :
 * jets d'arme et de lutte, viser, recharger, etats actifs, armes et armures,
 * degats, initiative, protection et modificateurs de blessures. Les membres
 * restent accessibles sur l'acteur, donc les fiches et les macros n'ont pas
 * change. Ce fichier ne garde que ce qui n'est pas martial.
 */
export class NephilimActor extends CombattantMixin(Actor) {

    /**
     * @returns the system identifier.
     */
    get sid() {
        return this?.system?.id;
    }

    /**
     * Garantit l'unicité de l'identifiant métier system.id.
     *
     * system.id est distinct de l'_id de Foundry : c'est par lui que les
     * documents se retrouvent (game.actors.find(a => a.sid === …)). Deux
     * acteurs du monde qui le partagent rendent ces recherches ambiguës, sans
     * la moindre erreur affichée.
     *
     * L'ancienne règle vivait dans un hook global de neph5e.js et reconnaissait
     * un doublon au suffixe " (Copy)" du nom : elle ne couvrait que le bouton
     * Dupliquer, et seulement tant que le module de traduction française du
     * cœur de Foundry n'était pas installé — sinon le nom finit par « (Copie) »
     * et plus aucun doublon n'était détecté. La règle porte désormais sur trois
     * signaux indépendants de la langue, dans l'ordre du moins cher au plus
     * cher. C'est la transposition de ce que NephilimItem._preCreate faisait
     * déjà pour les items ; les acteurs n'en avaient pas d'équivalent.
     *
     * @override
     */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;

        // 1. Foundry marque lui-même les duplications, quelle que soit la langue.
        const duplique = data._stats?.duplicateSource != null && !this.isToken;

        // 2. Identifiant absent : UUIDField en fournit normalement un, mais un
        //    document importé d'une version ancienne peut arriver sans.
        const absent = data.system?.id == null || data.system?.id === "";

        // 3. Filet de sécurité : identifiant déjà porté par un acteur du monde.
        //    Couvre le copier-coller et le ré-import d'un acteur déjà présent,
        //    que duplicateSource ne marque pas. Laisser l'identifiant au premier
        //    ne casse aucun lien : game.actors.find renvoie déjà celui-là.
        //
        //    L'acteur d'un token non lié est exclu, comme l'est un item embarqué
        //    dans NephilimItem : il est une copie de l'acteur du monde et doit en
        //    garder l'identifiant. Sans cette exclusion, il en recevrait un neuf
        //    et se détacherait de sa source.
        const pris = !this.isToken && !duplique && !absent
            && game.actors.find(a => a.sid === data.system.id) != null;

        if (duplique || absent || pris) {
            this.updateSource({ "system.id": NephilimActor.identifiantLibre() });
        }
    }

    /**
     * @returns un identifiant métier qu'aucun acteur du monde ne porte.
     */
    static identifiantLibre() {
        let sid;
        do {
            sid = CustomHandlebarsHelpers.UUID();
        } while (game.actors.find(a => a.sid === sid) != null);
        return sid;
    }

    


    /**
     * @returns the simulacre as actor object, undefined if not exist.
     */
    get simulacre() {
        return game.actors.find(a => a.sid === this.system.simulacre);
    }


    /**
     * @returns the actor mouvement.
     */
    get mouvement() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return this.system.ka.eau * 2;
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                return this.system.ka.soleil ?? 0;
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor perspicacite.
     */
    get perspicacite() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return 11 - this.system.ka.air;
                }
                if (this.system.options?.selenim === true) {
                    return 11 - this.system.ka.noyau;
                }
                return 11 - (this.system.ka.soleil ?? 0);
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor recuperation.
     */
    get recuperation() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return 11 - this.system.ka.terre;
                }
                if (this.system.options?.selenim === true) {
                    return 11 - this.system.ka.noyau;
                }
                return 11 - this.system.soleil;
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor voile.
     */
    get voile() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return Math.floor(this.system.ka.lune / 5);
                }
                if (this.system.options?.selenim === true) {
                    return Math.floor(this.system.ka.noyau / 10);
                }
                return Math.floor((this.system.ka.soleil ?? 0) / 10);
            case 'figurant':
            default:
                return 0;
        }
    }


    /**
     * @returns the actor ka dominant.
     */
    get ka() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return Math.max(
                        this.system.ka.air,
                        this.system.ka.eau,
                        this.system.ka.feu,
                        this.system.ka.lune,
                        this.system.ka.terre);
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                return 0;
            case 'figurant':
                return this.system.ka;
            default:
                return 0;
        }
    }

    /**
     * @returns the voie magique of the actor.
     */
    get voieMagique() {
        return this.items.find(i => i.type === 'magie');
    }

    /**
     * @returns the voie alchimique of the actor.
     */
    get voieAlchimique() {
        return this.items.find(i => i.type === 'alchimie');
    }


    /**
     * @returns the data to display. 
     */
    get arcanes() {
        return Arcane.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get capacites() {
        return Capacite.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get catalyseurs() {
        return Catalyseur.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get chutes() {
        return FeatureBuilder.getAll(this, 'chute');
    }

    /**
     * @returns the current chute
     */
    get khaiba() {
        return Chute.getKhaiba(this);
    }

    /**
     * @returns the current chute
     */
    get narcose() {
        return Chute.getNarcose(this);
    }

    /**
     * @returns the current chute
     */
    get ombre() {
        return Chute.getOmbre(this);
    }

    /**
     * @returns the current chute
     */
    get luneNoire() {
        return Chute.getLuneNoire(this);
    }

    /**
     * @returns the data to display. 
     */
    get competences() {
        return Competence.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get imago() {
        return Aspect.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get metamorphe() {
        return Metamorphe.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get ordonnances() {
        return Ordonnance.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get materiae() {
        return Materiae.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get passes() {
        return FeatureBuilder.getAll(this, 'passe');
    }

    /**
     * @returns the data to display. 
     */
    get periodes() {
        return Periode.getAll(this);
    }

    /**
     * @returns the name of the current periode.
     */
    get currentPeriode() {
        if (this.system.periode == null) {
            return "Aucune periode courante";
        }
        const periode = game.items.find(i => i.sid === this.system.periode);
        return periode == null ? "Periode non trouvee" : periode.name;
    }

    /**
     * @returns the data to display. 
     */
    get quetes() {
        return FeatureBuilder.getAll(this, 'quete');
    }

    /**
     * @returns the data to display. 
     */
    get savoirs() {
        return FeatureBuilder.getAll(this, 'savoir');
    }

    /**
     * @returns the data to display. 
     */
    get sciences() {
        return FeatureBuilder.getAll(this, 'science');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfActor() {
        return Vecu.getAll(this, 'actor');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfSimulacre() {
        return Vecu.getAll(this, 'simulacre');
    }

    /**
     * @param sid The system identifier of the item for which to retrieve the degre of the fraternite.
     * @returns the fraternite degre for the specified item.
     */
    fraternite(sid) {
        let degre = 0;
        if (this.system?.options?.fraternites === true) {
            for (let f of this.fraternites.filter(a => a.system.options.active === true)) {
                const d = new FeatureBuilder(f).withOriginalItem(sid).create().degre;
                if (d != null && d > degre) {
                    degre = d;
                }
            }
        }
        return degre;
    }


    /**
     * @param science The name of the science.
     * @returns true if some focus are owned.
     */
    numberOfFocus(science) {
        return this.focus(science).length;
    }

    /**
     * @param science The key of the science.
     * @returns the level of the science.
     */
    science(science) {
        const i = Science.getScience(science);
        return new Science(this).withItem(i).degre;
    }

    /**
     * @param savoir The key of the savoir.
     * @returns the level of the savoir.
     */
    savoir(savoir) {

        let item = null;
        switch (savoir) {
            case "denier": {
                item = game.items.find(i => i.sid === "2e59bafc-c15ad33f-ecf2b0b5-552ae23e");
                break;
            }
            case "coupe": {
                item = game.items.find(i => i.sid === "1ca3f53b-b487e304-2260922e-b9d29476");
                break;
            }
            case "epee": {
                item = game.items.find(i => i.sid === "6d3727df-99a5a34a-cd599572-c9d755dd");
                break;
            }
            case "baton": {
                item = game.items.find(i => i.sid === "83a3e42e-5af77cbd-df0f4d7c-38dd775d");
                break;
            }
            case "bohemien": {
                item = game.items.find(i => i.sid === "0168fa19-a6141d9e-65eaa5b4-d6e9dcb1");
                break;
            }
        }

        return item == null ? null : new Savoir(this).withItem(item);

    }

    /**
     * @param science The type 'sort', 'formule' etc...
     * @param options The option parameters:
     *   - all: if true, all cercles are returned.
     * @returns the information datas about the specified cercles.
     */
    cercles(science, options) {
        return Science.cercles(this, science, options);
    }

    /**
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    focus(science) {
        return Science.getFocus(this, science);
    }

    /**
     * @returns the actor laboratories.
     */
    get laboratoires() {
        return Laboratoire.getAll(this);
    }

    /**
     * @returns the fraternites objects in which the actor is member.
     */
    get fraternites() {
        const fraternites = [];
        for (let f of game.actors.filter(a => a.type === 'fraternite')) {
            if (new Fraternite(f).isActiveMember(this)) {
                fraternites.push(f);
            }
        }
        return fraternites;
    }

    /**
     * @returns the members of the fraternite sorted by status.
     */
    get membres() {
        return new Fraternite(this).membres();
    }

    /**
     * @param actor   The actor identifier.
     * @param periode The periode system identifier.
     * @returns true if new member for the periode (in), false is out
     */
    isNewMember(actor, periode) {
        return new Fraternite(this).isNewMember(actor, periode);
    }


    get locked() {
        return this.system.options.locked;
    }

    /**
     * Create the specified feature.
     * @param type The type of macro which can be 
     *   - ka      with id in [air, eau, feu, lune, terre, soleil, ka]
     *   - item    with sid
     *   - wrestle without id or sid
     *   - 
     * 
     *   - chute
     *   - competence
     *   - ka 
     *      * element [air, eau, feu, lune, terre, soleil, ka]
     *   - noyau
     *   - passe
     *   - pavane
     *   - quete
     *   - savoir
     *   - science
     *   - vecu
     * @param id  The object identifier
     * @param sid The object system identifier.
     * @returns the instance.
     */
    async processMacro(type, id, sid) {
        let builder = null;
        switch (type) {

            case 'item': {
                builder = new FeatureBuilder(this)
                    .withOriginalItem(sid)
                    .withScope('actor')
                    .withPeriode(this.system.periode);
                break;
            }

            case 'vecu': {
                builder = new FeatureBuilder(this)
                    .withEmbeddedItem(id)
                    .withScope(this.items.get(id) != null ? 'actor' : 'simulacre')
                    .withPeriode(this.system.periode);
                break;
            }

            case 'ka': {
                builder = new FeatureBuilder(this)
                    .withKa(id)
                    .withScope('actor');
                break;
            }

            case 'noyau': {
                builder = new FeatureBuilder(this)
                    .withNoyau();
                break;
            }

            case 'pavane': {
                builder = new FeatureBuilder(this)
                    .withPavane();
                break;
            }

            case 'weapon': {
                const weapon = this.items.get(id);
                if (weapon == null) {
                    ui.notifications.warn("Vous ne possédez pas cette arme pour attaquer.");
                    return;
                }
                await this.rollWeapon(weapon, this.combatant);
                break;
            }

            case 'wrestle':
                await this.rollWrestle(this.combatant);
                break;

        }

        if (builder != null) {
            const feature = builder.create();
            if (feature != null) {
                await feature.initializeRoll();
            }
        }

    }


    // ----------------------------------------------------------------------------------------------

    /**
     * @param element The element for which to retrieve to max MP.
     * @returns the maximum number of materiae primae.
     */
    getMaxBaseMP(element) {
        return new Laboratoire(this).getMaxBaseMP(element);
    }

    /**
     * Gets the construct associated with the specified substance.
     * @param substance The substance of the construct to get.
     * @return the construct.
     */
    getConstruct(substance) {
        return new Laboratoire(this).getConstruct(substance);
    }

    /**
     * @returns the allowed approches with the label of the element and the value if > 0.
     *
     * La clef de chaque entrée est le nom du ka dans le schéma — 'noyau', 'air',
     * 'ka' — et c'est elle, et elle seule, qui identifie l'approche : c'est
     * l'argument attendu par getKa(). Les gabarits l'émettent en valeur d'option.
     *
     * Le champ 'name' portait auparavant un chemin i18n ('NEPHILIM.luneNoire')
     * qui servait aussi de valeur d'option, ce qui mélangeait identité et
     * affichage. Comme il ne coïncidait pas toujours avec la clef, l'approche
     * de noyau d'un sélénim était résolue en getKa('luneNoire') — champ
     * inexistant, donc bonus nul. Le champ est supprimé : le libellé traduit
     * suffit à l'affichage, la clef suffit à l'identité.
     *
     * Un champ 'degre' recopiait par ailleurs le niveau du ka dans chaque
     * entrée, sans qu'aucun lecteur ne s'en serve : le bonus est recalculé
     * depuis la clef par actionDialog._approche(), via getKa(). Cette copie
     * muette est supprimée — deux sources pour une même valeur finissent par
     * diverger.
     */
    approches() {
        const approches = {};
        approches['none'] = {
            label: game.i18n.localize('NEPHILIM.aucuneApproche')
        };
        switch (this.type) {
            case 'figure':
                if (this.system.options.selenim === true) {
                    if (this.system.ka.noyau > 0) {
                        approches['noyau'] = {
                            label: NephilimActor.libelleApproche('luneNoire')
                        };
                    }
                }
                if (this.system.options.nephilim === true) {
                    // NEPHILIM porte déjà les mêmes libellés d'élément que
                    // l'ancien bloc NEPH5E.pentacle.elements, à l'identique.
                    for (let elt of Constants.ELEMENTS) {
                        if (this.system.ka[elt] > 0) {
                            approches[elt] = {
                                label: NephilimActor.libelleApproche(elt)
                            };
                        }
                    }
                }
                break;
            case 'figurant':
                approches['ka'] = {
                    label: NephilimActor.libelleApproche('ka')
                };
                break;
        }
        return approches;
    }

    /**
     * Le libellé d'une approche était construit en concaténant la chaîne
     * française 'Approche de ' au nom traduit du ka : le système n'était donc
     * pas traduisible sur ce point. La phrase entière vit désormais dans
     * NEPHILIM.approcheDe, avec le ka en paramètre.
     *
     * @param ka Le nom du ka, tel qu'il sert de clef dans NEPHILIM.
     * @returns le libellé affiché dans la liste des approches.
     */
    static libelleApproche(ka) {
        return game.i18n.localize('NEPHILIM.approcheDe' + ka.charAt(0).toUpperCase() + ka.slice(1));
    }

    /**
     * Gets the level of the specified ka.
     * @param element The element of the ka to get. Allowed ka are:
     *   air,
     *   brume,
     *   eau,
     *   feu,
     *   lune,
     *   noyau,
     *   orichalque,
     *   reserve,
     *   soleil,
     *   terre
     * @returns the level of the specified ka.
     */
    getKa(element) {
        switch (this.type) {
            case 'figure':
                return this.system.ka[element] ?? 0;
            case 'figurant':
                return this.system.ka;
        }
    }


    getSentence(quality, self) {
        const prefixe = self ? 'NEPHILIM.tenteSelf' : 'NEPHILIM.tenteSimulacre';
        return game.i18n.localize(prefixe + quality.charAt(0).toUpperCase() + quality.slice(1));
    }

    /**
     * Deletes the specified embedded item.
     * @param item The embedded item to delete.
     */
    async deleteEmbeddedItem(item) {
        if (item != null) {
            switch (item.type) {
                case 'periode':
                    await this.deletePeriode(item.sid);
                    break;
                case 'vecu':
                    await this.deleteVecu(item);
                    break;
                case 'competence':
                    await this.deleteCompetence(item);
                    break;
                default:
                    await this.deleteEmbeddedDocuments('Item', [item.id]);
                    break;
            }
        }
    }

    /**
     * Deletes the specified vecu, used as callback.
     * @param item The original or embedded vecu item to delete.
     */
    async deleteVecu(item) {
        const embedded = this.items.find(i => i.sid === item.sid);
        if (embedded != null) {
            await new Vecu(this, 'actor').withItem(embedded).delete();
        }
    }

    /**
     * Deletes the specified competence, used as callback.
     * @param item The competence item object to delete.
     */
    async deleteCompetence(item) {
        await new Competence(this, item).delete();
    }   

    /**
     * @param sid The system identifier of the periode to delete.
     */
    async deletePeriode(sid) {
        const original = game.items.find(i => i.sid === sid);
        if (original != null) {
            await new Periode(this, original).delete();
        }
    }
 
    /**
     * @param sid The system identifier of current periode to set.
     */
    async setCurrentPeriode(sid) {
        await this.update({ ["system.periode"]: sid });
    }

    /**
     * @Override
     */
     async _onDelete(options, userId) {

        // On process world actor deletion
        if (this.isEmbedded === true) {
            return;
        }

        for (let actor of game.actors) {
            await this.onDeleteEmbeddedActor(actor);
        }

        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                if (token.actor != null) {
                    await this.onDeleteEmbeddedActor(token.actor);
                }
            }
        }

        await super._onDelete(options, userId);

    }

    /**
     * Delete the current actor from the specified container actor
     * @param actor The actor for which to delete the current actor object.
     */
    async onDeleteEmbeddedActor(actor) {

        // Remove the current actor if it is a simulacre of a figure
        if (actor.system?.simulacre === this.sid) {
            await actor.update({ ['system.simulacre']: null });
        }

        // Remove the current actor if it is a member of a fraternite
        if (actor.type === 'fraternite') {
            await new Fraternite(actor).onDeleteActor(this);
        }

    }

    /**
     * Render the sheet if opened.
     */
    async render() {
        if (this?.sheet?.rendered === true) {
            await this.sheet.render(true);
        }
    }

    /**
     * Le jet d'un passé.
     *
     * Le passé peut arriver sous sa forme embarquée — c'est ce que la fiche a
     * sous la main — ou comme item du monde. Les deux voies convergent :
     * HistoricalFeature.withEmbeddedItem repose this.item sur l'item du monde
     * retrouvé par sid, et le degré vient de degreFromPeriodes(sid).
     *
     * @param item Le passé, embarqué ou item du monde. Ne doit pas être null,
     *             l'appelant s'en assure.
     */
    async rollPasse(item) {

        const builder = new FeatureBuilder(this).withScope('actor');
        const feature = (item.isEmbedded
            ? builder.withEmbeddedItem(item.id)
            : builder.withOriginalItem(item.sid)).create();

        if (feature == null) {
            ui.notifications.error("Le passé est introuvable");
            return;
        }

        // La feature peut exister sans son item du monde : withEmbeddedItem le
        // retrouve par sid et rend undefined pour un embarqué ORPHELIN. data lit
        // alors this.item.name et lèverait, après le contrôle ci-dessus.
        if (feature.item == null) {
            ui.notifications.error("Le passé « " + item.name + " » ne correspond à aucun item du monde");
            return;
        }

        await feature.initializeRoll();
    }


}