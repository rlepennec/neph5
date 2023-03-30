export class Macros {

    /**
     * Create the macro.
     */
    static async create(bar, data, slot) {

        if (data?.process !== 'macro') {
            return;
        }

        let name = null;
        let img = null;
        switch (data.type) {
            case 'item':
                const item = game.items.find(i => i.sid === data.sid);
                name = item?.name;
                img = item?.img;
                break;
            case 'wrestle':
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