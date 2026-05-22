export const REST_COST = 10
export const BANDAGE_COST = 5
export const MAX_BANDAGES = 3
export const INFIRMARY_UPGRADE_COST = 50
export const MAX_REPUTATION = 100
export const MAX_PARTY_SIZE = 5

const SAVE_KEY = 'orderOfHuntersPlayerState'

export const playerState = {
    name: 'Рейнар Вельм',
    title: 'Охотник Ордена',

    maxHP: 100,
    hp: 100,

    silver: 0,
    exp: 0,
    reputation: 50,

    wounds: 'нет',

    // Расходники
    bandages: 2,

    // Текущий отряд на контракт
    party: ['reynar'],

    // Список выполненных контрактов
    completedContracts: [],

    // Список контрактов, о которых игрок уже был уведомлён
    viewedContracts: [],

    // Текущий активный контракт
    activeContractId: null,

    // Развитие базы Ордена
    base: {
        infirmaryLevel: 0
    }
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

        // Если в старом сохранении ещё нет отряда — создаём отряд с одним Рейнаром
        if (!Array.isArray(playerState.party) || playerState.party.length === 0) {
            playerState.party = ['reynar']
        }

        // На всякий случай защищаемся от битого сохранения
        if (!Array.isArray(playerState.completedContracts)) {
            playerState.completedContracts = []
        }

        if (!Array.isArray(playerState.viewedContracts)) {
            playerState.viewedContracts = []
        }

        if (typeof playerState.activeContractId !== 'string' || playerState.activeContractId.length === 0) {
            playerState.activeContractId = null
        }

        if (playerState.completedContracts.includes(playerState.activeContractId)) {
            playerState.activeContractId = null
        }

        if (typeof playerState.bandages !== 'number') {
            playerState.bandages = 2
        }

        if (!Number.isFinite(playerState.reputation)) {
            playerState.reputation = 50
        }

        playerState.reputation = Math.max(0, Math.min(playerState.reputation, MAX_REPUTATION))

        if (!playerState.base) {
            playerState.base = {
                infirmaryLevel: 0
            }
        }

        if (typeof playerState.base.infirmaryLevel !== 'number') {
            playerState.base.infirmaryLevel = 0
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

    if (playerState.activeContractId === contractId) {
        playerState.activeContractId = null
    }

    savePlayerState()
}

export function isContractCompleted(contractId) {
    return playerState.completedContracts.includes(contractId)
}

export function acceptContract(contractId) {
    playerState.activeContractId = contractId

    savePlayerState()
}

export function clearActiveContract() {
    playerState.activeContractId = null

    savePlayerState()
}

export function isContractActive(contractId) {
    return playerState.activeContractId === contractId
}

export function getReputationTitle(reputation = playerState.reputation) {
    if (reputation >= 85) return 'Легенда'
    if (reputation >= 65) return 'Прославленный'
    if (reputation >= 40) return 'Уважаемый'
    if (reputation >= 20) return 'Известный'

    return 'Безвестный'
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

export function getRestCost() {
    // Лазарет 1 уровня снижает цену отдыха
    if (playerState.base.infirmaryLevel >= 1) {
        return 5
    }

    return REST_COST
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
    const restCost = getRestCost()

    if (playerState.silver < restCost) {
        return {
            success: false,
            message: 'Недостаточно серебра для отдыха.'
        }
    }

    // Оплата отдыха
    playerState.silver -= restCost

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

export function upgradeInfirmary() {
    if (playerState.base.infirmaryLevel >= 1) {
        return {
            success: false,
            message: 'Лазарет уже улучшен.'
        }
    }

    if (playerState.silver < INFIRMARY_UPGRADE_COST) {
        return {
            success: false,
            message: 'Недостаточно серебра для улучшения Лазарета.'
        }
    }

    playerState.silver -= INFIRMARY_UPGRADE_COST
    playerState.base.infirmaryLevel = 1

    savePlayerState()

    return {
        success: true,
        message: 'Лазарет улучшен. Отдых стал дешевле.'
    }
}

// Загружаем сохранение сразу при старте игры
loadPlayerState()

export function getPartySize() {
    // Минимум 1, чтобы не было деления на ноль
    if (!Array.isArray(playerState.party) || playerState.party.length === 0) {
        return 1
    }

    return playerState.party.length
}

export function canAddHunterToParty() {
    // В отряде не может быть больше 5 охотников
    return getPartySize() < MAX_PARTY_SIZE
}

export function splitRewardByParty(totalReward) {
    const partySize = getPartySize()

    // Делим награду поровну между участниками отряда
    return Math.floor(totalReward / partySize)
}

export function addHunterToParty(hunterId) {
    // Если отряда почему-то нет — создаём его с Рейнаром
    if (!Array.isArray(playerState.party)) {
        playerState.party = ['reynar']
    }

    // Не добавляем одного и того же охотника дважды
    if (playerState.party.includes(hunterId)) {
        return false
    }

    // Больше 5 охотников в отряде быть не может
    if (!canAddHunterToParty()) {
        return false
    }

    playerState.party.push(hunterId)
    savePlayerState()

    return true
}

export function removeHunterFromParty(hunterId) {
    // Рейнара нельзя убрать из отряда
    if (hunterId === 'reynar') {
        return false
    }

    if (!Array.isArray(playerState.party)) {
        playerState.party = ['reynar']
        savePlayerState()
        return false
    }

    playerState.party = playerState.party.filter((id) => id !== hunterId)
    savePlayerState()

    return true
}
