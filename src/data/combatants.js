export const combatants = {
    hunter: {
        id: 'hunter',
        name: 'Охотник',
        maxHP: 100
    },

    troll: {
        id: 'troll',
        name: 'Тролль',
        assetKey: 'troll',
        maxHP: 150,
        damageMin: 5,
        damageMax: 20,

        specialAttack: {
            name: 'Тяжёлый удар',
            chance: 35,
            damageMin: 18,
            damageMax: 30,
            logText: 'Тролль обрушил тяжёлый удар'
        }
    },

    millBeast: {
        id: 'millBeast',
        name: 'Зверь у мельницы',
        assetKey: 'troll', // временно используем картинку тролля
        maxHP: 110,
        damageMin: 8,
        damageMax: 16,

        specialAttack: {
            name: 'Рваный укус',
            chance: 30,
            damageMin: 12,
            damageMax: 22,
            logText: 'Зверь рванул охотника клыками',

            effect: {
                type: 'bleed',
                turns: 3,
                damage: 4
            }
        }
    }
}
