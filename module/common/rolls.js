import { Game } from "./game.js";
import { NephilimItem } from "../item/entity.js";

export class Rolls {

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
     * @param item  The purpose of the action.
     * @param type  The type of roll.
     * @param data  The action data.
     */
    static async check(actor, item, type, data) {

        let selectElement = false;
        let blessure = 0;
        const isItem = item instanceof NephilimItem;
        if (isItem) {
            selectElement = item.type === 'invocation' && item.data.data.element === 'choix';
            blessure = actor.getWoundModifier(item.blessure());
        } else {
            selectElement = false;
            const typeOfBlessure = Rolls.blessureOf(type);
            blessure = actor.getWoundModifier(typeOfBlessure);
        }

        // Create the action panel to display
        const html = await renderTemplate(
            "systems/neph5e/templates/dialog/basic/basic-action.html",
            {
                actor: actor,
                item: item,
                action: data,
                blessure: blessure,
                selectElement: selectElement,
                elements: Game.pentacle.elements
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
                        const modifier = parseInt(Math.floor(parseInt(html.find("#modifier")[0].value)/10));
                        const skipBlessure = html.find("#skipBlessure")[0].checked;
                        
                        let additionalKa = 0;
                        if (selectElement) {
                            const selectedKa = $("#element").val()
                            additionalKa = actor.getKa(selectedKa);
                        }

                        data.difficulty = parseInt(data.difficulty) + (isNaN(modifier) ? 0 : modifier) + (skipBlessure ? 0 : blessure) + additionalKa;
                        await Rolls.displayRoll(actor, item, data);
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Abandonner"),
                    callback: () => {},
                },
            },
            default: "roll",
            close: () => {},
        }).render(true);
    }

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
        const theRoll = roll1.roll();
        await theRoll.toMessage({
            speaker: ChatMessage.getSpeaker()
        }, { async:true });

        
        // Wait for the 3D dices
        await new Promise(r => setTimeout(r, 2000));

        // Indicates if roll is a double
        let isDouble = false;
        if (theRoll._total === 100 ||
            theRoll._total === 11 ||
            theRoll._total === 22 ||
            theRoll._total === 33 ||
            theRoll._total === 44 ||
            theRoll._total === 55 ||
            theRoll._total === 66 ||
            theRoll._total === 77 ||
            theRoll._total === 88 ||
            theRoll._total === 99) {
            isDouble = true;
        }

        // Result
        let result = "";
        const diffpc = cardData.difficulty * 10;

        if (theRoll._total === 100 || theRoll._total > diffpc) {
            if (theRoll._total === 1) {
                result = "réussit par miracle";
            }else if (diffpc < 100 && isDouble == true) {
                result = "échoue, triste coup du sort, de façon lamentable";
            } else if (cardData.difficulte === 0) {
                result = "échoue, c'était prévisible, de façon lamentable";
            } else {
                result = "échoue";
            }

        // Reussite
        } else {

            // Marge
            const dizaine = Math.floor(theRoll._total / 10);
            let over = 0;
            if (cardData.difficulty > 10) {
                over = cardData.difficulty - 10;
            }
            const marge = dizaine + over;

            if (isDouble == true) {
                if (marge === 0) {
                    result = "réussit de façon spectaculaire";
                } else {
                    result = "réussit de façon spectaculaire avec une marge de réussite de " + marge;
                }
            } else {
                if (marge === 0) {
                    result = "réussit tout juste";
                } else {
                    result = "réussit avec une marge de réussite de " + marge;
                }
            }

        }

        const lastData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            actor: actor,
            roll: theRoll,
            result: result
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