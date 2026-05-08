export const REST_COST = 10

export const playerState = {
    name: 'Рейнар Вельм',
    title: 'Охотник Ордена',

    maxHP: 100,
    hp: 100,

    silver: 0,
    exp: 0,

    wounds: 'нет',

    // Список выполненных контрактов
    completedContracts: []
}

export function completeContract(contractId) {
    // Не добавляем один и тот же контракт дважды
    if (!playerState.completedContracts.includes(contractId)) {
        playerState.completedContracts.push(contractId)
    }
}

export function isContractCompleted(contractId) {
    return playerState.completedContracts.includes(contractId)
}

export function needsRest() {
    return playerState.hp < playerState.maxHP || playerState.wounds !== 'нет'
}

export function restAtBase() {
    // Если лечиться не нужно
    if (!needsRest()) {
        return {
            success: false,
            message: 'Рейнар не нуждается в отдыхе.'
        }
    }

    // Если не хватает серебра
    if (playerState.silver < REST_COST) {
        return {
            success: false,
            message: 'Недостаточно серебра для отдыха.'
        }
    }

    // Оплата отдыха
    playerState.silver -= REST_COST

    // Восстановление
    playerState.hp = playerState.maxHP
    playerState.wounds = 'нет'

    return {
        success: true,
        message: 'Рейнар отдохнул и восстановил силы.'
    }
}
