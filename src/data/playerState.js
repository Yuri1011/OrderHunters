export const REST_COST = 10
export const BANDAGE_COST = 5
export const MAX_BANDAGES = 3

const SAVE_KEY = 'orderOfHuntersPlayerState'

export const playerState = {
    name: 'Рейнар Вельм',
    title: 'Охотник Ордена',

    maxHP: 100,
    hp: 100,

    silver: 0,
    exp: 0,

    wounds: 'нет',

    // Расходники
    bandages: 2,

    // Список выполненных контрактов
    completedContracts: []
}

// Штрафы от ранений
export const woundEffects = {
    'нет': {
        maxHPPenalty: 0,
        canTakeContract: true
    },

    'ушибы': {
        maxHPPenalty: 10,
        canTakeContract: true
    },

    'лёгкое ранение': {
        maxHPPenalty: 20,
        canTakeContract: true
    },

    'тяжёлое ранение': {
        maxHPPenalty: 40,
        canTakeContract: false
    }
}

export function savePlayerState() {
    // Сохраняем состояние игрока в браузер
    localStorage.setItem(SAVE_KEY, JSON.stringify(playerState))
}

export function loadPlayerState() {
    const savedState = localStorage.getItem(SAVE_KEY)

    if (!savedState) return

    try {
        const parsedState = JSON.parse(savedState)

        // Аккуратно подмешиваем сохранённые данные в текущее состояние
        Object.assign(playerState, parsedState)

        // На всякий случай защищаемся от битого сохранения
        if (!Array.isArray(playerState.completedContracts)) {
            playerState.completedContracts = []
        }

        if (typeof playerState.bandages !== 'number') {
            playerState.bandages = 2
        }
    } catch (error) {
        console.error('Ошибка загрузки сохранения:', error)
    }
}

export function resetPlayerState() {
    // Полный сброс сохранения, пригодится для тестов
    localStorage.removeItem(SAVE_KEY)
    location.reload()
}

export function completeContract(contractId) {
    // Не добавляем один и тот же контракт дважды
    if (!playerState.completedContracts.includes(contractId)) {
        playerState.completedContracts.push(contractId)
    }

    savePlayerState()
}

export function isContractCompleted(contractId) {
    return playerState.completedContracts.includes(contractId)
}

export function getCurrentWoundEffect() {
    return woundEffects[playerState.wounds] || woundEffects['нет']
}

export function getEffectiveMaxHP() {
    const effect = getCurrentWoundEffect()

    return Math.max(playerState.maxHP - effect.maxHPPenalty, 1)
}

export function canTakeContract() {
    const effect = getCurrentWoundEffect()

    return effect.canTakeContract
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

    savePlayerState()

    return {
        success: true,
        message: 'Рейнар отдохнул и восстановил силы.'
    }
}

export function buyBandageAtBase() {
    // Нельзя носить бесконечно много бинтов
    if (playerState.bandages >= MAX_BANDAGES) {
        return {
            success: false,
            message: 'Больше бинтов не унести.'
        }
    }

    // Проверяем серебро
    if (playerState.silver < BANDAGE_COST) {
        return {
            success: false,
            message: 'Недостаточно серебра для покупки бинта.'
        }
    }

    // Покупка
    playerState.silver -= BANDAGE_COST
    playerState.bandages += 1

    savePlayerState()

    return {
        success: true,
        message: 'Бинт добавлен в припасы.'
    }
}

// Загружаем сохранение сразу при старте игры
loadPlayerState()
