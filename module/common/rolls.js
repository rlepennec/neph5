import { Game } from "./game.js";
import { NephilimItem } from "../item/entity.js";

export class Rolls {

    static isDouble(n) {
        return n === 100 || n === 11 || n === 22 ||n === 33 || n === 44 || n === 55 || n === 66 || n === 77 || n === 88 || n === 99;
    }

    /**
     * 
     * @param {*} roll            The roll result is 1d100
     * @param {*} difficultyLevel The difficulty level
     */
    static getRollResult(roll, difficultyLevel) {
        const fail = roll === 100 || ( roll > (difficultyLevel * 10) && roll !== 1);
        const isFumble = Rolls.isDouble(roll) && fail;
        const isCritical = Rolls.isDouble(roll) && !fail;
        const successMargin = fail ? 0 : Math.floor(roll / 10) + (difficultyLevel > 10 ? difficultyLevel  - 10 : 0);
        return {
            isSuccess: !fail,
            isFumble: isFumble,
            isCritical: isCritical,
            successMargin: successMargin
        }
    }

    static getResultSentence(rollResult) {
        const margin = rollResult.successMargin === 0 ? "" : " avec une marge de réussite de " + rollResult.successMargin;
        if (rollResult.isCritical) {
            return "réussit de façon spectaculaire" + margin;
        } else if (rollResult.isFumble) {
            return "échoue de façon désastreuse";
        } else if (rollResult.isSuccess) {
            return "réussit" + margin;
        } else {
            return "échoue";
        }
    }

    static getBest(active, passive) {
        const ACTIVE = 'active';
        const PASSIVE = 'passive';
        const NONE = 'none';
        if (active.successMargin > passive.successMargin) {
            return ACTIVE;
        } else if (passive.successMargin > active.successMargin) {
            return PASSIVE;
        } else {
            return NONE;
        }
    }

    static getOppositeResult(active, passive) {
        const ACTIVE = 'active';
        const PASSIVE = 'passive';
        const NONE = 'none';
        if (active.isCritical) {
            if (passive.isCritical) {
                return Rolls.getBest(active, passive);
            } else {
                return ACTIVE;
            }
        } else if (active.isFumble) {
            if (passive.isFumble) {
                return NONE;
            } else {
                return PASSIVE;
            }
        } else if (active.isSuccess) {
            if (passive.isCritical) {
                return PASSIVE;
            } else if (passive.isSuccess) {
                return Rolls.getBest(active, passive);
            } else {
                return ACTIVE;
            }
        } else {
            if (passive.isSuccess) {
                return PASSIVE;
            } else if (passive.isFumble) {
                return ACTIVE;
            } else {
                return NONE;
            }
        }
    }

    static getOppositeSentence(result, type) {
        const ACTIVE = 'active';
        const PASSIVE = 'passive';
        const NONE = 'none';
        switch(type) {
            case 'invocation':
                switch(result) {
                    case ACTIVE:
                        return " parvient à controler la créature";
                    case PASSIVE:
                    case NONE:
                        return " ne parvient pas à contrôler la créature";
                }
            default:
                switch(result) {
                    case ACTIVE:
                        return " parvient à ses fins";
                    case PASSIVE:
                    case NONE:
                        return " ne parvient pas à ses fins";
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

        // Retrieve if the action must be resolved as a opposite action. The following opposite actions are:
        //   - invocation without pacte
        const oppositeAction = item instanceof NephilimItem && item.type === 'invocation' && !actor.hasPactWith(item);

        // Retrieve if action must be resolved as an alone action. The following alone actions are:
        // - 
        const aloneAction = item instanceof NephilimItem && (item.type === 'sort' || item.type === 'formule');

        let rollType = 'none';
        if (oppositeAction) {
            rollType = 'opposite';
        } else if (aloneAction) {
            rollType = 'alone';
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
                rollType: rollType
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

                        // Calculate the final difficulty
                        data.difficulty = parseInt(data.difficulty) + (isNaN(modifier) ? 0 : modifier) + (skipWoundModifier ? 0 : woundModifier) + additionalKa;

                        // Indicates if the action is an opposite one
                        data.oppositeAction = oppositeAction ? true : aloneAction ? false : html.find("#opposite")[0].checked;;

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
     * @param {*} cardData 
     */
    static async displayRoll(actor, item, cardData) {

        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker()
        }
        chatData.content = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-chat.html", {
            actor: actor,
            item: item,
            action: cardData
        });
        chatData.roll = true;

        const rollMode = game.settings.get('core', 'rollMode');
        //blindroll (aveugle), roll (public), gmroll (cache), selfroll (prive)
        if (['gmroll', 'blindroll'].includes(rollMode))
            chatData.whisper = ChatMessage.getWhisperRecipients('GM').map((u) => u.id);
        if (rollMode === 'selfroll')
            chatData.whisper = [game.user.id];
        if (rollMode === 'blindroll')
            chatData.blind = true;

        await ChatMessage.create(chatData);

        const roll1 = new Roll("1d100", {});
        const theRoll = roll1.roll({async:false});
        await theRoll.toMessage({
            speaker: ChatMessage.getSpeaker()
        }, { async: true });


        // Wait for the 3D dices
        await new Promise(r => setTimeout(r, 2000));

        const rollResult = Rolls.getRollResult(theRoll._total, cardData.difficulty);
        const result = Rolls.getResultSentence(rollResult) + (cardData.oppositeAction ? " mais..." : "");

        const lastData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            actor: actor,
            roll: theRoll,
            result: result
        }
        lastData.content = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-result.html", lastData);
        if (cardData.oppositeAction) {
            const flags = {
                neph5e: {
                    opposite: {
                        item: item,
                        rollResult: rollResult,
                        initialActorImg: actor.img,
                        initialActorName: actor.name
                    }
                 }
            }
            lastData.flags = flags;
        }

        //blindroll (aveugle), roll (public), gmroll (cache), selfroll (prive)
        if (['gmroll', 'blindroll'].includes(rollMode)) {
            lastData.whisper = ChatMessage.getWhisperRecipients('GM').map((u) => u.id);
        }
        if (rollMode === 'selfroll') {
            lastData.whisper = [game.user.id];
        }
        if (rollMode === 'blindroll') {
            lastData.blind = true;
        }

        if (rollMode !== 'blindroll') {
            await ChatMessage.create(lastData);
        }

    }


    /**
     * This method is used to display a roll result.
     * @param {*} intialActionFlags    The actor which performs the action.
     * @param {*} item     The purpose of the action, that is the item, the attribute or the ka. 
     */
    static async resolveOppositeRoll(flags) {

        const intialActionFlags = flags.opposite;

        // Create action panel
        let htmlData = null;
        if (intialActionFlags.item.type === 'invocation') {
            htmlData =
                {
                    actor: {
                        name: intialActionFlags.item.name + " s'oppose à l'invocation",
                        sentence: " s'oppose à l'invocation",
                        img: intialActionFlags.item.img
                    },
                    action: {
                        difficulty: intialActionFlags.item.data.degre
                    },
                    item: {
                        img: intialActionFlags.initialActorImg
                    },
                    blessure: 0,
                    selectElement: false,
                    elements: {}
                };

        } else {
            htmlData =
                {
                    actor: {
                        name: "La situation n'est pas si simple",
                        sentence: "La situation n'est pas si simple",
                        img: "systems/neph5e/icons/opposition.webp"
                    },
                    action: {
                        difficulty: 0
                    },
                    item: {
                        img: intialActionFlags.initialActorImg
                    },
                    blessure: 0,
                    selectElement: false,
                    elements: {}
                };
        }

        const html = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-action.html", htmlData);

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
                        const difficulty = parseInt(htmlData.action.difficulty)  + (isNaN(modifier) ? 0 : modifier);
                        await Rolls.displayOppositeRoll(intialActionFlags, difficulty);
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

    static async displayOppositeRoll(intialActionFlags, difficulty) {

        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker()
        }

        let charContentData = null;
        if (intialActionFlags.item.type === 'invocation') {
            charContentData = {
                actor: {
                    name: intialActionFlags.item.name + " s'oppose à l'invocation",
                    sentence: " s'oppose à l'invocation",
                    img: intialActionFlags.item.img
                },
                item: {
                    img: intialActionFlags.initialActorImg
                },
                action: {
                    difficulty: difficulty
                },
            }
        } else {
            charContentData = {
                actor: {
                    name: "La situation n'est pas si simple",
                    sentence: "La situation n'est pas si simple",
                    img: "systems/neph5e/icons/opposition.webp"
                },
                item: {
                    img: intialActionFlags.initialActorImg
                },
                action: {
                    difficulty: difficulty
                },
            } 
        }


        chatData.content = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-chat.html", charContentData);
        chatData.roll = true;

        const rollMode = game.settings.get('core', 'rollMode');
        //blindroll (aveugle), roll (public), gmroll (cache), selfroll (prive)
        if (['gmroll', 'blindroll'].includes(rollMode))
            chatData.whisper = ChatMessage.getWhisperRecipients('GM').map((u) => u.id);
        if (rollMode === 'selfroll')
            chatData.whisper = [game.user.id];
        if (rollMode === 'blindroll')
            chatData.blind = true;

        await ChatMessage.create(chatData);

        const roll1 = new Roll("1d100", {});
        const theRoll = roll1.roll({async:false});
        await theRoll.toMessage({
            speaker: ChatMessage.getSpeaker()
        }, { async: true });


        // Wait for the 3D dices
        await new Promise(r => setTimeout(r, 2000));

        const oppositeRollResult = Rolls.getRollResult(theRoll._total, difficulty);
        const result = Rolls.getOppositeResult(intialActionFlags.rollResult ,oppositeRollResult);
        const resultSentence = Rolls.getOppositeSentence(result, intialActionFlags.item.type);

        const lastData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            actor: {
                data: {
                    name: intialActionFlags.initialActorName,
                },
                img: intialActionFlags.initialActorImg
            },
            roll: theRoll,
            result: resultSentence
        }
        lastData.content = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-result.html", lastData);

        //blindroll (aveugle), roll (public), gmroll (cache), selfroll (prive)
        if (['gmroll', 'blindroll'].includes(rollMode)) {
            lastData.whisper = ChatMessage.getWhisperRecipients('GM').map((u) => u.id);
        }
        if (rollMode === 'selfroll') {
            lastData.whisper = [game.user.id];
        }
        if (rollMode === 'blindroll') {
            lastData.blind = true;
        }

        if (rollMode !== 'blindroll') {
            await ChatMessage.create(lastData);
        }

    }

}