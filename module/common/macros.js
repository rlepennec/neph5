export class Macros {

    /**
     * 
     */
    static async create(bar, data, slot) {

        if (data?.process !== 'macro') {
            return;
        }

        let name = null;
        let img = null;
        switch (data.type) {
            case 'appel':
            case 'chute':
            case 'competence':
            case 'formule':
            case 'invocation':
            case 'quete':
            case 'passe':
            case 'rite':
            case 'savoir':
            case 'sort':
            case 'vecu':
            case 'weapon-attack':
                const item = game.items.find(i => i.sid === data.sid);
                name = item?.name;
                img = item?.img;
                break;
            case 'lutte':
                name = "Lutte";
                img = "systems/neph5e/assets/icons/lutte.webp";
                break;
            case 'ka':
                name = "Ka " + data.id;
                img = "systems/neph5e/assets/icons/ka.webp";
                break;
            case 'noyau':
                name = "Noyau";
                img = "systems/neph5e/assets/icons/noyau.webp";
                break;
            case 'pavane':
                name = "Pavane";
                img = "systems/neph5e/assets/icons/pavane.webp";
                break;
            default:
                return;
        }

        let command = `( async () => {
            if (token?.actor != null) {
                await token.actor.processMacro('` + data.type + `', '` + data.id + `', '` + data.sid + `');
            }
        })()`;

        let macro = await Macro.create({
            name: name,
            type: "script",
            img: img,
            command: command,
            flags: {"neph5e.macro": true}
        });

        game.user.assignHotbarMacro(macro, slot);


    }
    

}


/*
export async function createMacro(bar, data, slot) {

    if ( data.type !== "Item" ) return;
    const item = game.items.get(data.id);

    if (item !== undefined) {

        const uuid = item.data.data.id;

        let command = null;
        if (['appel', 'competence', 'formule', 'invocation', 'quete', 'savoir', 'sort', 'vecu'].includes(item.type)) {
            command = `( async () => {
                const uuid = '${uuid}';
                if (actor) {
                await actor.skill(uuid);
                } else if (token) {
                await token.actor.skill(uuid);
                }
            })()`;
        }

        if (command !== null) {
            let macro = game.macros.find(m => (m.name === item.name) && (m.data.command === command));
            if ( !macro ) {
            macro = await Macro.create({
                name: item.name,
                type: "script",
                img: item.img,
                command: command,
                flags: {"neph5e.macro": true}
            });
            }
            game.user.assignHotbarMacro(macro, slot);
            return false;
        }

    } else {

        if (data.data.type === 'arme') {

            let command = null;
            const actor = game.actors.get(data.actorId);
            const arme = actor.items.get(data.data._id);
            const skill = data.data.data.skill;
            let uuid = null;
            switch (skill) {
                case 'melee':
                    uuid = game.settings.get('neph5e', 'uuidMelee');
                    break;
                case 'esquive':
                    uuid = game.settings.get('neph5e', 'uuidDodge');
                    break;
                case 'martial':
                    uuid = game.settings.get('neph5e', 'uuidHand');
                    break;
                case 'trait':
                    uuid = game.settings.get('neph5e', 'uuidDraft');
                    break;
                case 'feu':
                    uuid = game.settings.get('neph5e', 'uuidFire');
                    break;
                case 'lourde':
                    uuid = game.settings.get('neph5e', 'uuidHeavy');
                    break;
                default:
                    uuid = null;
            }

            if (skill === 'melee')  {
                command = `( async () => {
                    const id = '${data.data._id}';
                    const uuid = '${uuid}';
                    const arme = token.actor.items.get(id);
                    if (actor) {
                    await actor.skill(uuid);
                    } else if (token) {
                    await token.actor.frapper(token, arme);
                    }
                })()`;
            } else if (skill === 'feu' || skill === 'trait' || skill === 'lourde') {
                command = `( async () => {
                    const id = '${data.data._id}';
                    const uuid = '${uuid}';
                    const arme = token.actor.items.get(id);
                    if (actor) {
                    await actor.skill(uuid);
                    } else if (token) {
                    await token.actor.tirer(token, arme);
                    }
                })()`;
            }

            if (command !== null) {
                let macro = game.macros.find(m => (m.name === arme.name) && (m.data.command === command));
                if ( !macro ) {
                macro = await Macro.create({
                    name: arme.name,
                    type: "script",
                    img: arme.img,
                    command: command,
                    flags: {"neph5e.macro": true}
                });
                }
                game.user.assignHotbarMacro(macro, slot);
                return false;
    
            }

        }

    }

}
*/