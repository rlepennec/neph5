import { Constants } from "./constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { DocumentIdentifier } from "./documentIdentifier.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { NephilimActorSheet } from "../actor/nephilimActorSheet.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

export const CombatantMixinSheet = Base => {

    return class CombatantSheet extends Base {

		static DEFAULT_OPTIONS = {
			actions: {
				rollWeapon: CombatantSheet._onRollWeapon,
				rollWrestle: CombatantSheet._onRollWrestle,
				useArmor: CombatantSheet._onUseEquipment,
				useWeapon: CombatantSheet._onUseEquipment
			},
			deleteHandlers: {
				"arme": NephilimActorSheet._onDeleteItem,
				"armure": NephilimActorSheet._onDeleteItem
			},
			dropHandlers: {
				"arme": NephilimActorSheet._onDropItem,
				"armure": NephilimActorSheet._onDropItem
			}
		}

		static async _onRollWeapon(event, target) {
			event.preventDefault();
			const document = new DocumentIdentifier(target).toDocument();
			if (document?.attackAvailable === true) {

				// Combat system activated can be standard or simplified
				if (this.#combatActivated()) {
					switch (document.system.type) {
						case Constants.NATURELLE:
							await new Naturelle(this.document, document).initializeRoll();
							break;
						case Constants.MELEE:
							await new Melee(this.document, document).initializeRoll();
							break;
						case Constants.FEU:
						case Constants.TRAIT:
							await new Distance(this.document, document).initializeRoll();
							break;
					}

				// No combat system activated, just roll a martial skill roll
				} else {
					const feature = new FeatureBuilder(this.document).withScope("actor").withOriginalItem(document.system.competence).create();
					await feature.initializeRoll();
				}

			}
		}

		static async _onRollWrestle(event, target) {
			event.preventDefault();
			if (this.document.lutteCanBePerformed) {
				if (this.#combatActivated()) {
					await new Wrestle(this.document).initializeRoll();
				} else {
					const feature = new FeatureBuilder(this.document).withScope("actor").withOriginalItem(this.document.system.manoeuvres.lutte).create();
					await feature.initializeRoll();
				}
			}
		}

		static async _onUseEquipment(event, target) {
			event.preventDefault();
			const document = new DocumentIdentifier(target).toDocument();
			switch (document.type) {
				case 'arme':
				case 'armure':
					// Set the usage of the melee or the ranged weapon
					await this.document.toggleEquipmentUsage(document);
					break;
			}
		}

		#combatActivated() {
			return (['normal', 'low'].includes(game.settings.get('neph5e', 'useCombatSystem')));
		}


		/**
		 * Aim at the specified target.
		 * @param event The event to handle.
		 */
		/*
		async _onAim(event) {
			event.preventDefault();
			const li = $(event.currentTarget).parents("li");
			const id = li.data("id");
			const item = this.document.getEmbeddedDocument('Item', id);
			const action = new Distance(this.document, item);
			await new Viser().apply(action);
		}
			*/

		/**
		 * Reload the specified fire weapon.
		 * @param event The event to handle.
		 */
		/*
		async _onReload(event) {
			event.preventDefault();
			const li = $(event.currentTarget).parents("li");
			const id = li.data("id");
			const item = this.document.getEmbeddedDocument('Item', id);
			const action = new Distance(this.document, item);
			await new Recharger().apply(action);
		}
		*/

	}
		
}