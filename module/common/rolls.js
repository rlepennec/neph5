import { Game } from "./game.js";
import { NephilimChat } from "./chat.js";
import { NephilimItem } from "../item/entity.js";

export class Rolls {

    static get ACTIVE() {
        return 'active';
    }

    static get PASSIVE() {
        return 'passive';
    }

    static get NONE() {
        return 'none';
    }

    static get SIMPLE() {
        return 'simple';
    }

    static get OPPOSED() {
        return 'opposed';
    }

    /**
     * @param {*} n The number to evaluate.
     * @returns true if a double has been rolled.
     */
    static isDouble(n) {
        return n === 100 || n === 11 || n === 22 || n === 33 || n === 44 || n === 55 || n === 66 || n === 77 || n === 88 || n === 99;
    }

    /**
     * @param {*} roll  The roll value is 1d100.
     * @param {*} level The difficulty level, multiply by 10 to get %.
     * @return the roll result according to the difficulty level.
     */
    static getResult(roll, level) {
        const fail = roll === 100 || (roll > (level * 10) && roll !== 1);
        const fumble = Rolls.isDouble(roll) && fail;
        const critical = Rolls.isDouble(roll) && !fail;
        const margin = fail ? 0 : Math.floor(roll / 10) + (level > 10 ? level - 10 : 0);
        return {
            success: !fail,
            fumble: fumble,
            critical: critical,
            margin: margin
        }
    }

    /**
     * @param {*} result  The roll result to evaluate.
     * @returns the sentence according to the roll result.
     */
    static getSentence(result) {
        if (result.success) {
            const margin = result.margin === 0 ? "" : " avec une marge de réussite de " + result.margin;
            if (result.critical) {
                return "réussit de façon spectaculaire" + margin;
            }
            return "réussit" + margin;
        }
        if (result.fumble) {
            return "échoue de façon désastreuse";
        }
        return "échoue";
    }

    static getOpposedSentence(winner, type) {
        switch (type) {
            case 'invocation':
                switch (winner) {
                    case this.ACTIVE:
                        return " parvient à établir un pacte avec la créature";
                    case this.PASSIVE:
                    case this.NONE:
                        return " ne parvient pas à établir un pacte avec la créature";
                }
            default:
                switch (winner) {
                    case this.ACTIVE:
                        return " parvient à ses fins";
                    case this.PASSIVE:
                    case this.NONE:
                        return " ne parvient pas à ses fins";
                }
        }
    }

    static getBest(active, passive) {
        if (active.margin > passive.margin) {
            return this.ACTIVE;
        } else if (passive.margin > active.margin) {
            return this.PASSIVE;
        } else {
            return this.NONE;
        }
    }

    /**
     * @param {*} active  The active roll result. 
     * @param {*} passive The passive roll result.
     * @returns  the winner or none if equality.
     */
    static getWinner(active, passive) {
        if (active.critical) {
            if (passive.critical) {
                return Rolls.getBest(active, passive);
            } else {
                return this.ACTIVE;
            }
        } else if (active.fumble) {
            if (passive.fumble) {
                return this.NONE;
            } else {
                return this.PASSIVE;
            }
        } else if (active.success) {
            if (passive.critical) {
                return this.PASSIVE;
            } else if (passive.success) {
                return Rolls.getBest(active, passive);
            } else {
                return this.ACTIVE;
            }
        } else {
            if (passive.success) {
                return this.PASSIVE;
            } else if (passive.fumble) {
                return this.ACTIVE;
            } else {
                return this.NONE;
            }
        }
    }

    static blessureOf(type) {
        switch (type) {
            case 'Noyau':
            case 'Pavane':
            case 'soleil':
            case 'ka':
            case 'Ka air':
            case 'Ka eau':
            case 'Ka feu':
            case 'Ka lune':
            case 'Ka terre':
                return 'magique';

            case 'agile':
            case 'endurant':
            case 'fort':
            case 'intelligent':
            case 'seduisant':
            case 'soleil':
            case 'savant':
            case 'sociable':
            case 'fortune':
            case 'menace':
            case 'vecu':
                return 'physique';
        }
    }

    /**
     * Rolls dices for 
     * @param actor The actor which performs the action.
     * @param item  The purpose of the action, that is the item, the attribute or the ka.
     * @param type  The type of roll, used for display and to retrieve the wound modifier. Can be attribute
     * the name of the ka, of the attribute or the item.  
     * @param data  The action data.
     */
    static async check(actor, item, type, data) {

        // Retrieve the optional wound modifier
        const woundModifier = item instanceof NephilimItem ? actor.getWoundsModifier(item.blessure()) : actor.getWoundsModifier(Rolls.blessureOf(type));

        // Retrieve if the choice of the element must be displayed in the dialog.
        // Used for specific invocations where the choice of the element must be done during the cast of the spell.
        const selectElement = item instanceof NephilimItem && item.type === 'invocation' && item.data.data.element === 'choix';

        // Retrieve if the action must be resolved as a opposed action. The following opposed actions are:
        //   - invocation without pacte
        const opposed = item instanceof NephilimItem && item.type === 'invocation' && !actor.hasPactWith(item);

        // Retrieve if action must be resolved as an simple action. The following simple actions are:
        // - 
        const simple = item instanceof NephilimItem && (item.type === 'sort' || item.type === 'formule');

        let rollType = this.NONE;
        if (opposed) {
            rollType = this.OPPOSED;
        } else if (simple) {
            rollType = this.SIMPLE;
        }

        // Create the dialog panel to display.
        const html = await renderTemplate(
            "systems/neph5e/templates/dialog/basic/basic-action.html",
            {
                actor: actor,
                item: item,
                action: data,
                blessure: woundModifier,
                selectElement: selectElement,
                elements: Game.pentacle.elements,
                rollType: rollType,
                selectApproche: item.type === 'vecu' || item.type === 'competence' || type === 'vecu',
                approches: actor.getApproches()
            });

        // Display the action panel
        await new Dialog({
            title: "Jet de " + type,
            content: html,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("Lancer"),
                    callback: async (html) => {

                        // The optional modifier
                        const modifier = parseInt(Math.floor(parseInt(html.find("#modifier")[0].value) / 10));

                        // Skip wound modifier if necessary
                        const skipWoundModifier = html.find("#skipBlessure")[0].checked;

                        // Add the optional ka element, used for specified invocation
                        const additionalKa = selectElement ? actor.getKa($("#element").val()) : 0;

                        // Add the optional approche
                        const app = $("#approche").val();
                        const approche = app === 'none' ? 0 : actor.getKa(app);

                        // Calculate the final difficulty
                        data.difficulty = parseInt(data.difficulty) + (isNaN(modifier) ? 0 : modifier) + (skipWoundModifier ? 0 : woundModifier) + additionalKa + approche;

                        // Indicates if the action is an opposed one
                        data.opposed = opposed ? true : simple ? false : html.find("#opposed")[0].checked;;

                        // Process to the roll
                        await Rolls.displayRoll(actor, item, data);

                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Abandonner"),
                    callback: () => { },
                },
            },
            default: "roll",
            close: () => { },

        }).render(true);
    }

    /**
     * This method is used to display a roll result.
     * @param {*} actor    The actor which performs the action.
     * @param {*} item     The purpose of the action, that is the item, the attribute or the ka. 
     * @param {*} data 
     */
    static async displayRoll(actor, item, data) {

        // Display the roll action
        await new NephilimChat(actor)
            .withTemplate("systems/neph5e/templates/dialog/basic/basic-chat.html")
            .withData({
                actor: actor,
                item: item,
                sentence: data.sentence,
                difficulty: data.difficulty
            })
            .withRoll(true)
            .create();

        // Roll the dice
        const result = await Rolls.getRollResult({
            actor: actor.id,
            alias: actor.name,
            scene: null,
            token: null,
        }, data.difficulty);
        const sentence = Rolls.getSentence(result) + (data.opposed ? " mais..." : "");

        // Display the roll result and dispatch the event to the GM if an opposed roll
        if (game.settings.get('core', 'rollMode') !== 'blindroll') {
            await new NephilimChat(actor)
                .withTemplate("systems/neph5e/templates/dialog/basic/basic-result.html")
                .withData({
                    actor: actor,
                    sentence: sentence
                })
                .withFlags(data.opposed ? {
                    neph5e: {
                        opposed: {
                            actor: actor,
                            item: item,
                            result: result
                        }
                    }
                } : {})
                .withRoll(true)
                .create();
        }

    }

    /**
     * This method is used to display a roll result.
     * @param {*} flags    The actor which performs the action.
     */
    static async resolveOpposedRoll(flags) {

        // Create action panel
        const data = {
            actor: flags.opposed.item.type === 'invocation' ? {
                name: flags.opposed.item.name + " s'oppose à l'invocateur",
                sentence: " s'oppose à l'invocateur",
                img: flags.opposed.item.img
            } : {
                name: "La situation n'est pas si simple",
                sentence: "La situation n'est pas si simple",
                img: "systems/neph5e/icons/opposition.webp"
            },
            action: flags.opposed.item.type === 'invocation' ? {
                difficulty: flags.opposed.item.data.degre
            } : {
                difficulty: 0
            },
            item: {
                img: flags.opposed.actor.img
            },
            blessure: 0,
            selectElement: false,
            elements: {},
            selectApproche: false,
            approches: {}
        };

        const html = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-action.html", data);

        // Display the action panel
        await new Dialog({
            title: "Jet d'opposition",
            content: html,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("Lancer"),
                    callback: async (html) => {
                        const modifier = parseInt(Math.floor(parseInt(html.find("#modifier")[0].value) / 10));
                        const difficulty = parseInt(data.action.difficulty) + (isNaN(modifier) ? 0 : modifier);
                        await Rolls.displayOpposedRoll(flags.opposed, difficulty);
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Abandonner"),
                    callback: () => { },
                },
            },
            default: "roll",
            close: () => { },

        }).render(true);

    }

    static async displayOpposedRoll(flags, difficulty) {

        await new NephilimChat(flags.actor)
            .withTemplate("systems/neph5e/templates/dialog/basic/basic-chat.html")
            .withData({
                actor: flags.item.type === 'invocation' ? {
                    name: flags.item.name + " s'oppose à l'invocateur",
                    img: flags.item.img
                } : {
                    name: "La situation n'est pas si simple",
                    img: "systems/neph5e/icons/opposition.webp"
                },
                item: {
                    img: flags.actor.img
                },
                sentence: flags.item.type === 'invocation' ? " s'oppose à l'invocateur" : "La situation n'est pas si simple",
                difficulty: difficulty
            })
            .withRoll(true)
            .create();

        const result = await this.getRollResult(ChatMessage.getSpeaker(), difficulty);
        const winner = Rolls.getWinner(flags.result, result);
        const sentence = Rolls.getOpposedSentence(winner, flags.item.type);

        await new NephilimChat(flags.actor)
            .withTemplate("systems/neph5e/templates/dialog/basic/basic-result.html")
            .withData({
                actor: flags.actor,
                sentence: sentence
            })
            .create();

    }

    /**
     * Rolls 1d100, displays the specified message and returns the result.
     * @param {*} speaker 
     * @param {*} difficulty 
     * @returns the roll result. 
     */
    static async getRollResult(speaker, difficulty) {
        const roll = new Roll("1d100", {}).roll({ async: false });
        await roll.toMessage({ speaker: speaker }, { async: true });
        await new Promise(r => setTimeout(r, 2000));
        return Rolls.getResult(roll._total, difficulty);
    }

}