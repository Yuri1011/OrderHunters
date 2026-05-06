export const contracts = [
    {
        id: 'old-road-troll',
        title: 'Тролль на старой дороге',
        region: 'Темноводье',
        danger: 'Высокая',
        dangerColor: '#ff7777',

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
            defeatExp: 5
        }
    }
]

export function getContractById(id) {
    return contracts.find((contract) => contract.id === id)
}
