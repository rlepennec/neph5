import { Constants } from "../common/constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { Periode } from "../../feature/periode/periode.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Viser } from "../../feature/combat/manoeuver/viser.js";

export class NephilimItem extends Item {

    /**
     * @returns the system identifier.
     */
    get sid() {
        return this?.system?.id;
    }

    /**
     * @returns the item description from the embedded or the original item if necessary.
     */
    get description() {
        if (this.system.hasOwnProperty('description')) {
            return this.system.description;
        }
        if (this.sid != null) {
            const original = game.items.find(i => i.sid === this.sid);
            if (original != null) {
                return original.system.description;
            }
        }
        return null;
    }

    /**
     * @override
     */
    prepareData() {
        super.prepareData();
        if (this.sid == null || this.sid === "") {
            this.system.id = CustomHandlebarsHelpers.UUID();
        }
        if (this.img === 'icons/svg/item-bag.svg') {
            const root = "systems/neph5e/assets/icons/";
            switch (this.type) {
                case 'alchimie':
                case 'ordonnance':
                case 'magie':
                    this.img = root + "voie.webp";
                    break;

                case 'rituel':
                    this.img = root + "epee.webp";
                    break;
               
                case 'technique':
                    this.img = root + "baton.webp";
                    break;

                case 'tekhne':
                    this.img = root + "coupe.webp";
                    break;

                default:
                    this.img = root + this.type + ".webp";
                    break;
            }
        }
    }

    /**
     * @Override
     */
    async _onDelete(options, userId) {

        // On process world item deletion
        if (this.isEmbedded === true) {
            return;
        }

        // Specific processing
        switch (this.type) {

            // Remove the catalyseur reference from formule items
            case 'catalyseur':
                const catalyseurs = duplicate(this.system.catalyseurs);
                const i = catalyseurs.findIndex(o => o.refid === this.sid);
                if (i !== -1) {
                    catalyseurs.splice(i, 1);
                    await this.update({ ["system.catalyseurs"]: catalyseurs });
                }
                break;

            case 'competence':

                // Update each actor of the world and scenes
                await this._actors('deleteCompetence');

                // Delete from all vecus of the world
                for (let item of game.items.filter(i => i.type === "vecu")) {
                    await item.deleteCompetence(this);
                }

                // Delete from all armes of the world
                for (let item of game.items.filter(i => i.type === 'arme' && i.system.competence === this.sid)) {
                    const system = duplicate(item.system);
                    system.competence = null;
                    await item.update({ ['system']: system });
                }

                break;

            case 'formule':

                // Delete from all formules of the world
                for (let item of game.items.filter(i => i.type === "formule")) {
                    await item.deleteVariante(this);
                }

                break;

            case 'magie':

                // Delete from all sorts of the world
                for (let item of game.items.filter(i => i.type === "sort" || i.type === "habitus")) {
                    await item.deleteMagie(this);
                }

                break;

            case 'periode':

                // Update each actor of the world and scenes
                await this._actors('deletePeriode');

                // Delete all vecus items of the world
                for (let item of game.items.filter(i => i.type === 'vecu' && i.system.periode === this.sid)) {
                    await item.delete();
                }

                break;

            case 'vecu':

                // Update each actor of the world and scenes
                await this._actors('deleteVecu');

                // Delete from all armes of the world
                for (let item of game.items.filter(i => i.type === 'arme' && i.system.competence === this.sid)) {
                    const system = duplicate(item.system);
                    system.competence = null;
                    await item.update({ ['system']: system });
                }

                break;

        }

        // Delete embedded actor items according to the system identifier
        for (let actor of game.actors) {
            for (let item of actor.items.filter(i => i.sid === this.sid)) {
                await actor.deleteEmbeddedDocuments('Item', [item.id]);
            }
            if (actor.system?.manoeuvres?.esquive === this.sid) {
                await this.actor.update({ ['system.manoeuvres.esquive']: null });
            }
            if (actor.system?.manoeuvres?.lutte === this.sid) {
                await this.actor.update({ ['system.manoeuvres.lutte']: null });
            }
        }
        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                if (token.actor != null) {
                    for (let item of token.actor.items.filter(i => i.sid === this.sid)) {
                        await token.actor.deleteEmbeddedDocuments('Item', [item.id]);
                    }
                    if (token.actor.system?.manoeuvres?.esquive === this.sid) {
                        await token.actor.update({ ['system.manoeuvres.esquive']: null });
                    }
                    if (token.actor.system?.manoeuvres?.lutte === this.sid) {
                        await token.actor.update({ ['system.manoeuvres.lutte']: null });
                    }
                }
            }
        }

        await super._onDelete(options, userId);

    }

    /**
     * Deletes the specified competence.
     * @param {*} item The item to delete.
     */
    async deleteCompetence(item) {
        const competences = duplicate(this.system.competences);
        const i = competences.findIndex(o => item.sid === o);
        if (i !== -1) {
            competences.splice(i, 1);
            await this.update({ ["system.competences"]: competences });
        }
    }

    /**
     * Deletes the specified magie.
     * @param {*} item The item to delete.
     */
    async deleteMagie(item) {
        const voies = duplicate(this.system.voies);
        const i = voies.findIndex(o => item.sid === o);
        if (i !== -1) {
            voies.splice(i, 1);
            await this.update({ ["system.voies"]: voies });
        }
    }

    /**
     * Delete the specified variante.
     * @param {*} sid The system identifier of the item to delete.
     */
    async deleteVariante(item) {
        const variantes = duplicate(this.system.variantes);
        const i = variantes.findIndex(o => item.sid === o);
        if (i !== -1) {
            variantes.splice(i, 1);
            await this.update({ ["system.variantes"]: variantes });
        }
    }

    /**
     * Delete the specified catalyseur.
     * @param sid The system identifier of the catalyseur to delete from the formule.
     */
    async deleteCatalyseur(sid) {
        const catalyseurs = duplicate(this.system.catalyseurs);
        const i = catalyseurs.findIndex(o => o === sid);
        if (i !== -1) {
            catalyseurs.splice(i, 1);
            await this.update({ ["system.catalyseurs"]: catalyseurs });
        }
    }

    /**
     * Updates the list of referenced items by adding the specified item.
     * Reset the degre to 0 if dropped again.
     * @param {*} item The item to drop.
     * @param {*} refs The collection in which to push the dropped item.
     * @param {*} name The name of the collection in which to push the dropped item.
     */
    async updateItemRefs(item, refs, name) {

        // Retrieve the system identifier of the dropped item
        const sid = item.id;

        // Retrieve the current references of the current item
        const references = refs == null ? [] : duplicate(refs);

        // Add the reference if not found
        if (references.find(i => i === sid) == null) {
            references.push(sid);
        }

        await this.update({ [name]: references });

    }

    /**
     * Deletes the reference of the objet to delete.
     * @param {*} event 
     * @param {*} references 
     * @param {*} name 
     */
    async deleteItemRefs(event, references, name) {
        event.preventDefault();

        const button = event.currentTarget;
        if (button.disabled) return;

        // Retrieve the id of the reference to delete
        const li = $(event.currentTarget).closest('.item');
        const sid = li.data("item-id");

        // Retrieve the current references of the item
        const refs = duplicate(references);

        // Remove the reference
        const index = refs.findIndex(i => i === sid);
        if (index != -1) {
            refs.splice(index, 1);
        }

        // Update the references of the item
        await this.update({ [name]: refs });

    }

    /**
     * @param callback The name of the method of the actor item object to call.
     * @param type     The optional actor type to match.
     * @returns actors of the world and actors of the scenes.
     */
    async _actors(callback, type) {

        // Process each actor of the world and scenes
        for (let actor of game.actors) {
            if (type == null || actor.type === type) {
                await actor[callback](this);
            }
        }

        // Process each actor of the scenes
        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                if (token.actor != null && (type == null || token.actor.type === type)) {
                    await token.actor[callback](this);
                }
            }
        }

    }

    /**
     * @param weapon The weapon item object.
     * @returns the number of munitions left of the weapon item.
     */
    get numberOfMunitionsLeft() {
        return this.system.munitions - this.system.tire;
    }

    /**
     * @return the status of the item, which can be dechiffre, appris or tatoue.
     */
    get getStatus() {
        return game.i18n.localize('NEPH5E.' + this.system.status)
    }

    /**
     * @returns true if the periode is active according to his activation and the current one.
     */
    get actif() {
        return new Periode(this.actor, this).actif();
    }

    /**
     * Asserts the item is a ranged weapon embedded to the actor which want to perform the manoeuver.
     * @returns true if the viser manoeuver can be performed with this weapon.
     */
    get viserAvailable() {
        const action = new Distance(this.actor, this);
        return new Viser().canBePerformed(action);
    }

    /**
     * Asserts the item is a weapon embedded to the actor which want to perform the manoeuver.
     * @returns true if the attack manoeuver can be performed with this weapon.
     */
    get attackCanBePerformed() {
        if (this.system.used === false) {
            return false;
        }
        if (this.actor.immobilise) {
            return false;
        }
        if (this.system.type === Constants.FEU) {
            if (this.numberOfMunitionsLeft === 0) {
                return false;
            }
        }
        if (this.actor.tokenOf == null) {
            return true;
        }
        return this.actor.target !== null;
    }

}