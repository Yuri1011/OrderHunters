export const baseBuildings = [
    {
        id: 'forge',
        title: 'Кузница',
        subtitle: 'Оружие и снаряжение',
        icon: 'К',
        xPercent: 0.17,
        yPercent: 0.57,
        widthPercent: 0.22,
        heightPercent: 0.25
    },
    {
        id: 'council',
        title: 'Совет Ордена',
        subtitle: 'Решения и репутация',
        icon: 'С',
        xPercent: 0.50,
        yPercent: 0.25,
        widthPercent: 0.22,
        heightPercent: 0.32
    },
    {
        id: 'infirmary',
        title: 'Лазарет',
        subtitle: 'Лечение и припасы',
        icon: 'Л',
        xPercent: 0.62,
        yPercent: 0.50,
        widthPercent: 0.16,
        heightPercent: 0.20
    },
    {
        id: 'apartment',
        title: 'Квартира охотника',
        subtitle: 'Личное место Рейнара',
        icon: 'КВ',
        xPercent: 0.83,
        yPercent: 0.48,
        widthPercent: 0.24,
        heightPercent: 0.18
    },
    {
        id: 'barracks',
        title: 'Казармы',
        subtitle: 'Охотники и отряд',
        icon: 'Б',
        xPercent: 0.86,
        yPercent: 0.36,
        widthPercent: 0.24,
        heightPercent: 0.18
    },
    {
        id: 'rest',
        title: 'Место отдыха',
        subtitle: 'Передышка и восстановление',
        icon: 'О',
        xPercent: 0.83,
        yPercent: 0.75,
        widthPercent: 0.28,
        heightPercent: 0.25
    },
    {
        id: 'contracts',
        title: 'Доска контрактов',
        subtitle: 'Задания Ордена',
        icon: 'Д',
        xPercent: 0.34,
        yPercent: 0.58,
        widthPercent: 0.16,
        heightPercent: 0.18
    },
    {
        id: 'training',
        title: 'Тренировочный двор',
        subtitle: 'Навыки и подготовка',
        icon: 'Т',
        xPercent: 0.64,
        yPercent: 0.73,
        widthPercent: 0.24,
        heightPercent: 0.18
    }
]

export function getBaseBuildingById(id) {
    return baseBuildings.find((building) => building.id === id)
}
