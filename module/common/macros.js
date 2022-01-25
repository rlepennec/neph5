export async function createMacro(bar, data, slot) {

    if ( data.type !== "Item" ) return;
    const item = game.items.get(data.id);
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

}