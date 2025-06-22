import { Constants } from "../common/constants.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { Periode } from "../../feature/periode/periode.js";
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
        if (this._stats.duplicateSource != null) {
            const id = this._stats.duplicateSource.slice(5);
            const item = game.items.get(id);
            if (item != null && item.sid === this.sid) {
                this.system.id = CustomHandlebarsHelpers.UUID();
            }
        } else if (this.system.id == null || this.system.id === "") {
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
                const catalyseurs = foundry.utils.duplicate(this.system.catalyseurs);
                const i = catalyseurs.findIndex(o => o.refid === this.sid);
                if (i !== -1) {
                    catalyseurs.splice(i, 1);
                    await this.update({ ['system.catalyseurs']: catalyseurs });
                }
                break;

            case 'competence':

                // Delete the competence from each actor of the world and scenes
                await this._actors('deleteCompetence');

                // Delete from all vecus of the world
                for (let item of game.items.filter(i => i.type === 'vecu')) {
                    await item.deleteCompetence(this);
                }

                // Delete from all armes of the world
                for (let item of game.items.filter(i => i.type === 'arme' && i.system.competence === this.sid)) {
                    await item.update({ ['system.competence']: null });
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

                // Delete from all vecus of the world
                for (let item of game.items.filter(i => i.type === 'vecu' && i.system.periode === this.sid)) {
                    await item.update({ ['system.periode']: null });
                }

                break;

            case 'vecu':

                // Update each actor of the world and scenes
                await this._actors('deleteVecu');

                // Delete from all armes of the world
                for (let item of game.items.filter(i => i.type === 'arme' && i.system.competence === this.sid)) {
                    await item.update({ ['system.competence']: null });
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
     * Deletes the specified competence from the current vecu item.
     * @param item The competence item to remove from the vecu item.
     */
    async deleteCompetence(item) {
        const competences = foundry.utils.duplicate(this.system.competences);
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
        const voies = foundry.utils.duplicate(this.system.voies);
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
        const variantes = foundry.utils.duplicate(this.system.variantes);
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
        const catalyseurs = foundry.utils.duplicate(this.system.catalyseurs);
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
        const references = refs == null ? [] : foundry.utils.duplicate(refs);

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
        const refs = foundry.utils.duplicate(references);

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
     * @return the status of the item, which can be connu, dechiffre, appris or tatoue.
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
     * @returns the number of munitions left of the weapon item.
     */
    get numberOfMunitionsLeft() {
        return this.system.munitions - this.system.tire;
    }

    /**
     * Indicates if the item can be reloaded using the combat panel.
     * @returns true if the reload manoeuver can be performed with the item.
     */
    get reloadAvailable() {

        // Item must be an embedded and used weapon
        if (this?.type !== 'arme' || this.actor == null || this.system.used !== true) {
            return false;
        }

        // Actor must be free
        if (this.actor.immobilise === true) {
            return false;
        }

        // The actor token has been selected
        if (this.actor.tokenOf == null) {
            return false;
        }

        switch (this.system.type) {

            case Constants.TRAIT:
            case Constants.FEU:
                return this.system.tire > 0;

            default:
                return false;

        }

    }

    /**
     * Indicates if the item can be used to aim at a target using the combat panel.
     * @returns true if the aim manoeuver can be performed with the item.
     */
    get aimAvailable() {

        // Item must be an embedded and used weapon
        if (this?.type !== 'arme' || this.actor == null || this.system.used !== true) {
            return false;
        }

        // Actor must be free
        if (this.actor.immobilise === true) {
            return false;
        }

        // The actor token has selected a token target
        if (this.actor.tokenOf == null || this.actor.target == null) {
            return false;
        }

        switch (this.system.type) {

            case Constants.TRAIT:
            case Constants.FEU:
                const action = new Distance(this.actor, this);
                return new Viser().canBePerformed(action);

            default:
                return false;

        }

    }

    /**
     * Indicates if the roll dice can be clicked on the combat panel.
     * @returns true if the attack roll can be performed with the item.
     */
    get attackAvailable() {

        // Item must be an embedded and used weapon
        if (this?.type !== 'arme' || this.actor == null || this.system.used !== true) {
            return false;
        }

        // Actor must be free
        if (this.actor.immobilise === true) {
            return false;
        }

        // The actor token has selected a token target
        if (this.actor.tokenOf == null || this.actor.target == null) {
            return false;
        }

        switch (this.system.type) {

            case Constants.NATURELLE:
            case Constants.MELEE:
            case Constants.TRAIT:
                return true;

            case Constants.FEU:
                return this.system.munitions - this.system.tire > 0;

            default:
                return false;

        }
        
    }

}