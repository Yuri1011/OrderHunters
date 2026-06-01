export const baseBuildings = [
    {
        id: 'forge',
        title: 'Кузница',
        subtitle: 'Оружие и снаряжение',
        icon: 'icon_forge',
        sprite: 'location_forge',
        spritePath: '/assets/locations/base/forge.png',
        width: 330,
        height: 266,
        hoverScale: 1.015,
        originX: 0.5,
        originY: 1,
        x: 0.145,
        y: 0.690
    },
    {
        id: 'council',
        title: 'Совет Ордена',
        subtitle: 'Решения и репутация',
        icon: 'icon_council',
        sprite: 'location_citadel',
        spritePath: '/assets/locations/base/citadel.png',
        width: 640,
        height: 480,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.515,
        y: 0.600
    },
    {
        id: 'infirmary',
        title: 'Лазарет',
        subtitle: 'Лечение ран',
        icon: 'icon_infirmary',
        x: 0.640,
        y: 0.340
    },
    {
        id: 'barracks',
        title: 'Казармы',
        subtitle: 'Охотники Ордена',
        icon: 'icon_barracks',
        sprite: 'location_barracks',
        spritePath: '/assets/locations/base/barracks.png',
        width: 460,
        height: 350,
        hoverScale: 1.015,
        originX: 0.5,
        originY: 1,
        x: 0.820,
        y: 0.755
    },
    {
        id: 'quarters',
        title: 'Квартира охотника',
        subtitle: 'Личные покои',
        icon: 'icon_quarters',
        x: 0.800,
        y: 0.300
    },
    {
        id: 'rest',
        title: 'Место отдыха',
        subtitle: 'Восстановление сил',
        icon: 'icon_rest',
        x: 0.860,
        y: 0.640
    },
    {
        id: 'contracts',
        title: 'Доска контрактов',
        subtitle: 'Задания для охотников',
        icon: 'icon_contracts',
        x: 0.350,
        y: 0.520
    },
    {
        id: 'training',
        title: 'Тренировочный двор',
        subtitle: 'Боевые навыки',
        icon: 'icon_training',
        sprite: 'location_training_ground',
        spritePath: '/assets/locations/base/training-ground.png',
        width: 430,
        height: 323,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.600,
        y: 0.780
    }
]

export function getBaseBuildingById(id) {
    return baseBuildings.find((building) => building.id === id)
}
