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
