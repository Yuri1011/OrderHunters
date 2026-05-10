export const contracts = [
    {
        id: 'old-road-troll',
        title: 'Тролль на старой дороге',
        region: 'Темноводье',
        danger: 'Высокая',
        dangerColor: '#ff7777',

        // Доступен сразу
        requiredCompletedContracts: [],

        description: [
            'Старая дорога у Темноводья стала опасной.',
            'Караваны пропадают, следы ведут к лесной чаще.',
            'Местные говорят о тяжёлых шагах в тумане.'
        ],

        enemyId: 'troll',

        reward: {
            silverMin: 45,
            silverMax: 80,
            exp: 20,
            defeatExp: 5,
            bandagesMin: 0,
            bandagesMax: 1
        },

        travelEvent: {
            title: 'Старая дорога у Темноводья',

            text: [
                'Старая дорога тонет в сыром тумане.',
                'На влажной земле видны глубокие следы.',
                'Кто-то тяжёлый прошёл здесь совсем недавно.'
            ],

            hint: 'Осмотр следов может дать преимущество перед боем.',

            choices: [
                {
                    text: 'ОСМОТРЕТЬ СЛЕДЫ',
                    firstStrikeBonus: 10,
                    battleLog: 'Следы помогли выбрать слабое место'
                },
                {
                    text: 'ИДТИ ДАЛЬШЕ',
                    firstStrikeBonus: 0,
                    battleLog: ''
                }
            ]
        }
    },

    {
        id: 'mill-beast',
        title: 'Зверь у старой мельницы',
        region: 'Темноводье',
        danger: 'Средняя',
        dangerColor: '#ffaa55',

        // Откроется после первого контракта
        requiredCompletedContracts: ['old-road-troll'],

        description: [
            'У старой мельницы по ночам слышат рёв.',
            'Скот пропадает, а у воды находят разорванные сети.',
            'Староста просит Орден разобраться, пока не погиб кто-то из людей.'
        ],

        enemyId: 'millBeast',

        reward: {
            silverMin: 30,
            silverMax: 55,
            exp: 15,
            defeatExp: 4,
            bandagesMin: 0,
            bandagesMax: 2
        },

        travelEvent: {
            title: 'Туман у старой мельницы',

            text: [
                'Мельничное колесо давно не двигается.',
                'У воды стоит густой туман, пахнет гнилью и мокрой шерстью.',
                'На грязи видны следы когтей, уходящие к зарослям.'
            ],

            hint: 'Осмотр берега может помочь начать бой с преимуществом.',

            choices: [
                {
                    text: 'ОСМОТРЕТЬ БЕРЕГ',
                    firstStrikeBonus: 7,
                    battleLog: 'Следы у воды помогли подготовиться'
                },
                {
                    text: 'ИДТИ К МЕЛЬНИЦЕ',
                    firstStrikeBonus: 0,
                    battleLog: ''
                }
            ]
        }
    },

    {
        id: 'mossy-meadow-tracks',
        title: 'Следы у Мшистого Луга',
        region: 'Темноводье',
        danger: 'Высокая',
        dangerColor: '#ff7777',

        // Откроется после второго контракта
        requiredCompletedContracts: ['mill-beast'],

        description: [
            'У Мшистого Луга нашли следы, которые не похожи на звериные.',
            'Селяне говорят, что по ночам кто-то ходит вокруг домов.',
            'Орден не любит такие слухи. Обычно за ними что-то стоит.'
        ],

        // Пока используем существующего врага технически.
        // Позже заменим на отдельного монстра.
        enemyId: 'millBeast',

        reward: {
            silverMin: 55,
            silverMax: 90,
            exp: 25,
            defeatExp: 6,
            bandagesMin: 0,
            bandagesMax: 1
        },

        travelEvent: {
            title: 'Тропа к Мшистому Лугу',

            text: [
                'Дорога становится уже, воздух тяжелее.',
                'На мху видны тёмные пятна и глубокие отпечатки босых ног.',
                'Кто-то шёл рядом с дорогой, но старался не выходить на неё.'
            ],

            hint: 'Осмотр следов может открыть слабость врага перед боем.',

            choices: [
                {
                    text: 'ИЗУЧИТЬ СЛЕДЫ',
                    firstStrikeBonus: 12,
                    battleLog: 'Следы у Мшистого Луга раскрыли повадку твари'
                },
                {
                    text: 'ИДТИ В ДЕРЕВНЮ',
                    firstStrikeBonus: 0,
                    battleLog: ''
                }
            ]
        }
    }
]

export function getContractById(id) {
    return contracts.find((contract) => contract.id === id)
}
