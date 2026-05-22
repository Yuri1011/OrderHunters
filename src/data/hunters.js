export const hunters = [
    {
        id: 'reynar',
        name: 'Рейнар Вельм',
        role: 'Охотник',
        level: 1,
        maxHP: 100,
        damage: 18,
        available: true,
        description: 'Ветеран Пепельных походов. Молчит чаще, чем говорит.'
    },

    {
        id: 'old_tracker',
        name: 'Борен Следопыт',
        role: 'Следопыт',
        level: 1,
        maxHP: 70,
        damage: 12,
        available: true,
        description: 'Старый охотник, хорошо читает следы и знает лесные тропы.'
    },

    {
        id: 'young_spear',
        name: 'Терен Копейщик',
        role: 'Боец',
        level: 1,
        maxHP: 85,
        damage: 15,
        available: true,
        description: 'Молодой боец Ордена. Смелый, но ещё неопытный.'
    }
]

export function getHunterById(hunterId) {
    return hunters.find((hunter) => hunter.id === hunterId)
}

export function getPartyHunters(partyIds) {
    return partyIds
        .map((hunterId) => getHunterById(hunterId))
        .filter(Boolean)
}
