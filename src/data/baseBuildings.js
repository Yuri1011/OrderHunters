export const baseBuildings = [
    {
        id: 'forge',
        title: 'Кузница',
        subtitle: 'Оружие и снаряжение',
        icon: 'icon_forge',
        sprite: 'location_forge',
        spritePath: '/assets/locations/base/forge.png',
        width: 255,
        height: 206,
        hoverScale: 1.015,
        originX: 0.5,
        originY: 1,
        x: 0.135,
        y: 0.785
    },
    {
        id: 'council',
        title: 'Совет Ордена',
        subtitle: 'Решения и репутация',
        icon: 'icon_council',
        sprite: 'location_citadel',
        spritePath: '/assets/locations/base/citadel.png',
        width: 585,
        height: 439,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.515,
        y: 0.590
    },
    {
        id: 'infirmary',
        title: 'Лазарет',
        subtitle: 'Лечение ран',
        icon: 'icon_infirmary',
        sprite: 'location_infirmary',
        spritePath: '/assets/locations/base/infirmary.png',
        width: 325,
        height: 274,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.335,
        y: 0.705
    },
    {
        id: 'barracks',
        title: 'Казармы',
        subtitle: 'Охотники Ордена',
        icon: 'icon_barracks',
        sprite: 'location_barracks',
        spritePath: '/assets/locations/base/barracks.png',
        width: 395,
        height: 301,
        hoverScale: 1.015,
        originX: 0.5,
        originY: 1,
        x: 0.815,
        y: 0.670
    },
    {
        id: 'quarters',
        title: 'Квартира охотника',
        subtitle: 'Личные покои',
        icon: 'icon_quarters',
        x: 0.815,
        y: 0.305
    },
    {
        id: 'rest',
        title: 'Место отдыха',
        subtitle: 'Восстановление сил',
        icon: 'icon_rest',
        sprite: 'location_rest',
        spritePath: '/assets/locations/base/rest.png',
        width: 470,
        height: 353,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.710,
        y: 0.875
    },
    {
        id: 'contracts',
        title: 'Доска контрактов',
        subtitle: 'Задания для охотников',
        icon: 'icon_contracts',
        x: 0.295,
        y: 0.640
    },
    {
        id: 'training',
        title: 'Тренировочный двор',
        subtitle: 'Боевые навыки',
        icon: 'icon_training',
        sprite: 'location_training_ground',
        spritePath: '/assets/locations/base/training-ground.png',
        width: 270,
        height: 203,
        hoverScale: 1.012,
        originX: 0.5,
        originY: 1,
        x: 0.895,
        y: 0.885
    }
]

export function getBaseBuildingById(id) {
    return baseBuildings.find((building) => building.id === id)
}
