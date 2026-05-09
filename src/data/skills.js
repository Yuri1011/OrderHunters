export const playerActions = [
    {
        id: 'attack',
        label: 'УДАР',
        type: 'damage',
        minDamage: 10,
        maxDamage: 25,
        statusText: 'Охотник атакует',
        logText: 'Охотник нанёс',
        moveX: 500,
        moveDuration: 150
    },

    {
        id: 'defend',
        label: 'ЗАЩИТА',
        type: 'defend',
        statusText: 'Охотник защищается',
        logText: 'Охотник приготовился к защите',
        damageMultiplier: 0.5
    },

    {
        id: 'powerStrike',
        label: 'НАВЫК',
        type: 'damage',
        minDamage: 20,
        maxDamage: 40,
        statusText: 'Охотник использует навык',
        logText: 'Навык нанёс',
        moveX: 540,
        moveDuration: 200
    },

    {
        id: 'bandage',
        label: 'ПЕРЕВЯЗКА',
        type: 'bandage'
    }
]

export function getPlayerActionById(id) {
    return playerActions.find((action) => action.id === id)
}

// Старый объект оставляем для совместимости с текущим кодом
export const skills = {
    hunterAttack: getPlayerActionById('attack'),
    hunterSkill: getPlayerActionById('powerStrike'),
    defend: getPlayerActionById('defend')
}
