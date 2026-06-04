export const baseBuildings = [
    {
        id: 'forge',
        title: 'Кузница',
        subtitle: 'Оружие и снаряжение',
        icon: 'icon_forge',
        sprite: 'location_forge',
        spritePath: '/assets/locations/base/forge.png',
        width: 275,
        height: 222,
        hoverScale: 1.015,
        originX: 0.5,
        originY: 1,
        x: 0.125,
        y: 0.780
    },
    {
        id: 'council',
        title: 'Совет Ордена',
        subtitle: 'Решения и репутация',
        icon: 'icon_council',
        sprite: 'location_citadel',
        spritePath: '/assets/locations/base/citadel.png',
        width: 600,
        height: 450,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.515,
        y: 0.595
    },
    {
        id: 'infirmary',
        title: 'Лазарет',
        subtitle: 'Лечение ран',
        icon: 'icon_infirmary',
        sprite: 'location_infirmary',
        spritePath: '/assets/locations/base/infirmary.png',
        width: 345,
        height: 291,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.350,
        y: 0.700
    },
    {
        id: 'barracks',
        title: 'Казармы',
        subtitle: 'Охотники Ордена',
        icon: 'icon_barracks',
        sprite: 'location_barracks',
        spritePath: '/assets/locations/base/barracks.png',
        width: 420,
        height: 320,
        hoverScale: 1.015,
        originX: 0.5,
        originY: 1,
        x: 0.830,
        y: 0.675
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
        sprite: 'location_rest',
        spritePath: '/assets/locations/base/rest.png',
        width: 520,
        height: 390,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.735,
        y: 0.890
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
        width: 300,
        height: 225,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.900,
        y: 0.900
    }
]

export function getBaseBuildingById(id) {
    return baseBuildings.find((building) => building.id === id)
}
