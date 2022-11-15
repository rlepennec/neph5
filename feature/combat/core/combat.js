
import { AbstractRollBuilder } from "../../core/abstractRollBuilder.js";
import { Menace } from "../core/menace.js";

export class Combat {

    /**
     * Constructor.
     * @param actor   The actor object which performs the combat.
     * @param attack  The initial attack, purpose of the action.             
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * Process a simple attack roll, that is with actor and not with token.
     * @param weapon The weapon object used to attack or null to wrestle.
     */
    async simpleAttack(weapon) {

        switch (this.actor.type) {
            case 'figure':

                // Check competence or vecu
                const _competence = weapon == null ? this.actor.system.manoeuvres.lutte : weapon.system.competence;
                const skill = game.items.find(i => i.sid === _competence);
                if (skill == null) {
                    ui.notifications.error("Le vécu (ou la compétence) nécessaire pour " +  (weapon == null ? "lutter" : "manier cette arme n'est plus referencé"));
                    return;
                }

                switch (skill.type) {
                    case 'competence': {
                        await new AbstractRollBuilder(this.actor).withItem(skill).create().initialize();
                        break;
                    }
                    case 'vecu': {
                        const item = this.actor.items.find(i => i.sid === _competence);
                        if (item == null && skill.type === 'vecu') {
                            ui.notifications.warn("Vous ne possédez pas le vécu nécessaire pour " + (weapon == null ? "lutter" : "utiliser cette arme"));
                            return;
                        }
                        await new AbstractRollBuilder(this.actor).withItem(item).create().initialize();
                        break;
                    }
                }

                break;

            case 'figurant':
                await new Menace(this.actor).initialize();
        }

    }

}