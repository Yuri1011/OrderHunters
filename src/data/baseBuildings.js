export const baseBuildings = [
    {
        id: 'contracts',
        title: 'Доска контрактов',
        subtitle: 'Задания Ордена',
        x: 600,
        y: 430
    },
    {
        id: 'infirmary',
        title: 'Лазарет',
        subtitle: 'Лечение и отдых',
        x: 790,
        y: 270
    },
    {
        id: 'storage',
        title: 'Склад',
        subtitle: 'Припасы',
        x: 760,
        y: 455
    },
    {
        id: 'training',
        title: 'Тренировочный двор',
        subtitle: 'Будущие улучшения',
        x: 455,
        y: 455
    },
    {
        id: 'council',
        title: 'Совет Ордена',
        subtitle: 'Решения и репутация',
        x: 610,
        y: 240
    },
    {
        id: 'rest',
        title: 'Место отдыха',
        subtitle: 'Передышка охотников',
        x: 610,
        y: 545
    }
]

export function getBaseBuildingById(id) {
    return baseBuildings.find((building) => building.id === id)
}
