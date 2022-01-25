import { UUID } from "../common/tools.js";
import { Rolls } from "../common/rolls.js";
import { getByPath } from "../common/tools.js";

export class NephilimItem extends Item {

    /**
     * @override
     */
    prepareData() {
        super.prepareData();
        if (this.data.data.id === "") {
            this.data.data.id = UUID();
        }
        if (this.data.img === 'icons/svg/item-bag.svg') {
            switch (this.data.type) {
                case 'alchimie':
                    this.data.img = "systems/neph5e/icons/voie.jpg";
                    break;
                case 'appel':
                    this.data.img = "systems/neph5e/icons/appel.jpg";
                    break;
                case 'arcane':
                    this.data.img = "systems/neph5e/icons/arcane.jpg";
                    break;
                case 'arme':
                    this.data.img = "systems/neph5e/icons/arme.webp";
                    break;
                case 'armure':
                    this.data.img = "systems/neph5e/icons/armure.webp";
                    break;
                case 'aspect':
                    this.data.img = "systems/neph5e/icons/aspect.jpg";
                    break;
                case 'capacite':
                    this.data.img = "systems/neph5e/icons/capacite.webp";
                    break;
                case 'catalyseur':
                    this.data.img = "systems/neph5e/icons/catalyseur.jpg";
                    break;
                case 'chute':
                    this.data.img = "systems/neph5e/icons/chute.png";
                    break;
                case 'competence':
                    this.data.img = "systems/neph5e/icons/competence.jpg";
                    break;
                case 'formule':
                    this.data.img = "systems/neph5e/icons/formule.jpg";
                    break;
                case 'invocation':
                    this.data.img = "systems/neph5e/icons/invocation.jpg";
                    break;
                case 'magie':
                    this.data.img = "systems/neph5e/icons/voie.jpg";
                    break;
                case 'materiae':
                    this.data.img = "systems/neph5e/icons/materiae.jpg";
                    break;
                case 'metamorphe':
                    this.data.img = "systems/neph5e/icons/metamorphe.jpg";
                    break;
                case 'ordonnance':
                    this.data.img = "systems/neph5e/icons/voie.jpg";
                    break;
                case 'passe':
                    this.data.img = "systems/neph5e/icons/passe.webp";
                    break;
                case 'periode':
                    this.data.img = "systems/neph5e/icons/periode.jpg";
                    break;
                case 'pratique':
                    this.data.img = "systems/neph5e/icons/denier.webp";
                    break;
                case 'quete':
                    this.data.img = "systems/neph5e/icons/quete.jpg";
                    break;
                case 'rite':
                    this.data.img = "systems/neph5e/icons/rite.jpg";
                    break;
                case 'rituel':
                    this.data.img = "systems/neph5e/icons/epee.webp";
                    break;
                case 'savoir':
                    this.data.img = "systems/neph5e/icons/savoir.jpg";
                    break;
                case 'science':
                    this.data.img = "systems/neph5e/icons/science.jpg";
                    break;
                case 'sort':
                    this.data.img = "systems/neph5e/icons/sort.jpg";
                    break;
                case 'technique':
                    this.data.img = "systems/neph5e/icons/baton.webp";
                    break;
                case 'tekhne':
                    this.data.img = "systems/neph5e/icons/coupe.webp";
                    break;
                case 'vecu':
                    this.data.img = "systems/neph5e/icons/vecu.jpg";
                    break;
            }
        }
    }



    /**
     * Gets the difficulty of the roll for the specified actor.
     * @param actor The actor for which to get the difficulty.
     * @returns the difficulty.
     */
    difficulty(actor) {
        switch (this.type) {
            case 'sort':
                return actor.getScience(this.data.data.cercle) - this.data.data.degre + actor.getKa(this.data.data.element === "luneNoire" ? "noyau" : this.data.data.element); 
            case 'invocation':
                return actor.getScience(this.data.data.sephirah) + actor.getKa(this.data.data.element);
            case 'formule':
                return actor.getScience(this.data.data.cercle) + actor.getKaOfConstruct(this.data.data.substance, this.data.data.elements) - this.data.data.degre;
            case 'competence':
                let base = actor.getCompetence(this);
                if (game.settings.get('neph5e', 'useV3')) {
                    let attribute = 0;
                    const elt = this.data.data.element;
                    switch (elt) {
                        case 'air':
                            attribute = actor.getAttribute('intelligent');
                            break;
                        case 'eau':
                            attribute = actor.getAttribute('agile');
                            break;
                        case 'feu':
                            attribute = actor.getAttribute('fort');
                            break;
                        case 'lune':
                            attribute = actor.getAttribute('seduisant');
                            break;
                        case 'terre':
                            attribute = actor.getAttribute('endurant');
                            break;
                    }
                    base = base + (attribute != -1 ? attribute - 3 : 0);
                }
                return base;
            case 'appel':
            case 'rite':
            case "pratique":
            case "technique":
            case "tekhne":
            case "rituel":
                return actor.getScience(this.data.data.cercle);
            case 'vecu':
                return this.data.data.degre;
            case 'quete':
            case 'savoir':
            case 'passe':
            case 'chute':
            case 'arcane':
                return actor.getSumFrom(this.type + 's', this);
            default:
                return 0;
        }
    }

    /**
     * @returns the roll sentence of the roll
     */
    sentence() {
        switch (this.type) {
            case 'sort':
                return "lance le sort " + this.data.name;
            case 'invocation':
                return "exécute le rituel d'invocation " + this.data.name;
            case 'formule':
                return "crée une dose de " + this.data.name;
            case 'appel':
                return "conjure " + this.data.name;
            case 'rite':
                return "effectue le rite de " + this.data.name;
            case 'competence':
                return "mobilise son expérience en " + this.data.name;
            case 'vecu':
                return "mobilise son experience de " + this.data.name;
            case 'quete':
                return "mobilise sa sapience sur " + this.data.name;
            case 'savoir':
                return "mobilise son savoir occulte sur " + this.data.name;
            case 'chute':
                return "contrôle sa chute de " + this.data.name;
            case 'passe':
                return "fait appel à son passé " + this.data.name;
            case 'arcane':
                return "mobilise sa sapience sur l'arcane " + this.data.name;
            case 'pratique':
                return "utilise la pratique " + this.data.name;
            case 'technique':
                return "utilise la technique " + this.data.name;
            case 'tekhne':
                return "utilise la tekhne " + this.data.name;
            case 'rituel':
                return "pratique le rituel " + this.data.name;
            default:
                return 0;
        }
    }

    // Donen le type de blessure pour appliquer des modificateurs
    blessure() {
        switch (this.type) {
            case 'competence':
            case 'vecu':
                return 'physique';
            case 'sort':
            case 'invocation':
            case 'formule':
            case 'appel':
            case 'rite':
            case 'arcane':
            case 'pratique':
            case 'technique':
            case 'tekhne':
            case 'rituel':
            case 'quete':
            case 'savoir':
                return 'magique';
            case 'chute':
            case 'passe':
                return 'aucune';
            default:
                return 'aucune';
        }
    }

    /**
     * Performs a item roll dice for the specified actor.
     * @param actor The actor for which to roll the dices.
     */
    async roll(actor) {

        if (this.type === 'sort') {
            const s = actor.data.data.magie.sorts.find(i => i.refid === this.data.data.id);
            if (s !== undefined) {
                if (s.focus !== true && s.appris !== true && s.tatoue !== true) {
                    ui.notifications.warn("Vous ne possédez pas le focus de ce sort");
                    return;
                }
            }
        }

        if (this.type === 'invocation') {
            const s = actor.data.data.kabbale.invocations.find(i => i.refid === this.data.data.id);
            if (s !== undefined) {
                if (s.focus !== true && s.appris !== true && s.tatoue !== true) {
                    ui.notifications.warn("Vous ne possédez pas le focus de cette invocation");
                    return;
                }
            }
        }

        if (this.type === 'formule') {
            const s = actor.data.data.alchimie.formules.find(i => i.refid === this.data.data.id);
            if (s !== undefined) {
                if (s.focus !== true && s.appris !== true && s.tatoue !== true) {
                    ui.notifications.warn("Vous ne possédez pas le focus de cette formule");
                    return;
                }
            }
        }

        return Rolls.check(
            actor,
            this,
            this.type,
            {
                ...this.data,
                owner: actor.id,
                difficulty: this.difficulty(actor),
                sentence: this.sentence()
            }
        );
    }

    /**
     * Gets the specified actors. Filtered actors must have the property [root].
     * If the optional paramerer [collection] is defined then each element of the
     * collection must have the property [key]. The filtered pattern is:
     *     actor.data.data.[root]
     *     actor.data.data.[collection][x][key] = value
     * Else the actor must have the property [key]. The filtered pattern is:
     *     actor.data.data.[root]
     *     actor.data.data.[key] = value
     * @param root       The required property.
     * @param key        The property of the element collection or the actor.
     * @param refid      The identifier of the property used to filter actors.
     * @param collection The optional collection.
     * @return the array of the filtered actors.
     */
    filterActorsBy(root, key, value, collection = null) {
        if (collection === null) {
            return Array
                .from(game.actors.values())
                .filter(actor =>
                    actor.data.data.hasOwnProperty(root) &&
                    actor.data.data[key] === value);
        } else {
            return Array
                .from(game.actors.values())
                .filter(actor =>
                    actor.data.data.hasOwnProperty(root) &&
                    getByPath(actor.data.data, collection).findIndex(item => (getByPath(item, key) === value)) != -1);
        }
    }


    /**            CLEAN             */
    /******************************* */

    /**
     * @Override
     */
     async _onDelete(options, userId) {

        switch (this.type) {

            case 'alchimie':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteAlchimie(this);
                }

                break;

            case 'arcane':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteArcane(this);
                }

                break;

            case 'appel':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteAppel(this);
                }

                break;

            case 'aspect':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteAspect(this);
                }

                break;

            case 'catalyseur':

                // Delete from all formules of the world
                for (let item of game.items.filter(i => i.type === "formule")) {
                    await item.deleteCatalyseur(this);
                }

                break;

            case 'chute':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteChute(this);
                }

                break;

            case 'competence':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure' || a.type === 'simulacre')) {
                    await actor.deleteCompetence(this);
                }

                // Delete from all vecus of the world
                for (let item of game.items.filter(i => i.type === "vecu")) {
                    await item.deleteCompetence(this);
                }

                break;

            case 'formule':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteFormule(this);
                }

                // Delete from all formules of the world
                for (let item of game.items.filter(i => i.type === "formule")) {
                    await item.deleteVariante(this);
                }

                break;

            case 'invocation':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteInvocation(this);
                }
                
                break;

            case 'magie':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteMagie(this);
                }

                // Delete from all sorts of the world
                for (let item of game.items.filter(i => i.type === "sort")) {
                    await item.deleteMagie(this);
                }

                break;

            case 'materiae':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteMateriae(this);
                }

                break;

            case 'metamorphe':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteMetamorphe(this);
                }

                break;

            case 'ordonnance':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteOrdonnance(this);
                }

                break;

            case 'passe':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deletePasse(this);
                }

                break;

            case 'periode':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure' || a.type === 'simulacre')) {
                    await actor.deletePeriode(this);
                }

                // Delete all vecus items of the world
                for (let item of game.items.filter(i => i.type === 'vecu' && i.data.data.periode === this.data.data.id)) {
                    await item.delete();
                }

                break;

            case 'pratique':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deletePratique(this);
                }

                break;

            case 'quete':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteQuete(this);
                }

                break;

            case 'rite':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteRite(this);
                }

                break;

            case 'rituel':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteRituel(this);
                }

                break;

            case 'savoir':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteSavoir(this);
                }

                break;

            case 'science':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteScience(this);
                }

                break;

            case 'sort':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteSort(this);
                }

                break;

            case 'technique':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteTechnique(this);
                }

                break;

            case 'tekhne':

                // Update each actor
                for (let actor of game.actors.filter(a => a.type === 'figure')) {
                    await actor.deleteTekhne(this);
                }

                break;

        }

        await super._onDelete(options, userId);

    }

    /**
     * Deletes the specified catalyseur.
     * @param {*} item The item to delete.
     */
     async deleteCatalyseur(item) {
        const data = duplicate(this.data.data.catalyseurs);
        const i = data.findIndex(o => item.data.data.id === o.refid);
        if (i !== -1) {
            data.splice(i, 1);
            await this.update({ ["data.catalyseurs"]: data });
        }
    }

    /**
     * Deletes the specified competence.
     * @param {*} item The item to delete.
     */
     async deleteCompetence(item) {
        const data = duplicate(this.data.data.competences);
        const i = data.findIndex(o => item.data.data.id === o.refid);
        if (i !== -1) {
            data.splice(i, 1);
            await this.update({ ["data.competences"]: data });
        }
    }

    /**
     * Deletes the specified magie.
     * @param {*} item The item to delete.
     */
     async deleteMagie(item) {
        const data = duplicate(this.data.data.voies);
        const i = data.findIndex(o => item.data.data.id === o.refid);
        if (i !== -1) {
            data.splice(i, 1);
            await this.update({ ["data.voies"]: data });
        }
    }

    /**
     * Deletes the specified variante.
     * @param {*} item The item to delete.
     */
     async deleteVariante(item) {
        const data = duplicate(this.data.data.variantes);
        const i = data.findIndex(o => item.data.data.id === o.refid);
        if (i !== -1) {
            data.splice(i, 1);
            await this.update({ ["data.variantes"]: data });
        }
    }

}