import { Constants } from "./constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { DocumentIdentifier } from "./documentIdentifier.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

export const CombatantMixinSheet = Base => {

    return class CombatantSheet extends Base {

		static DEFAULT_OPTIONS = {
			actions: {
				rollWeapon: CombatantSheet._onRollWeapon,
				rollWrestle: CombatantSheet._onRollWrestle,
				useArmor: CombatantSheet._onUseArmor,
				useWeapon: CombatantSheet._onUseWeapon
				
			}
		}

		static async _onRollWeapon(event, target) {
			this._onRollWeapon(event, target)
		}

		static async _onRollWrestle(event, target) {
			await this._onRollWrestle(event, target);
		}

		static async _onUseArmor(event, target) {
			this._onUse(event, target)
		}

		static async _onUseWeapon(event, target) {
			this._onUse(event, target)
		}

		async _onRollWeapon(event, target) {
			event.preventDefault();
			const document = new DocumentIdentifier(target).toDocument();
			switch (document.type) {
				case 'arme':
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
					break;
			}
		}

		async _onRollWrestle(event, target) {
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

		async _onUse(event, target) {
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

	}
		
}