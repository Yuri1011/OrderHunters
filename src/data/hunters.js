export const hunters = [
    {
        id: 'reynar',
        name: 'Рейнар Вельм',
        role: 'Ветеран',
        level: 1,
        maxHP: 100,
        damage: 18,
        available: true,
        avatarKey: 'hunter_reynar_velm',
        avatarPath: '/assets/characters/hunters/reynar-velm.png',
        description: 'Ветеран Пепельных походов.'
    },

    {
        id: 'born',
        name: 'Борн Кривой Бык',
        role: 'Тяжёлый боец',
        level: 1,
        maxHP: 125,
        damage: 16,
        available: true,
        avatarKey: 'hunter_born_krivoy_byk',
        avatarPath: '/assets/characters/hunters/born-krivoy-byk.png',
        description: 'Огромный, тяжёлый, упрямый здоровяк. Боец, который не отступает, даже когда уже надо.'
    },

    {
        id: 'marra',
        name: 'Марра Каменная Жила',
        role: 'Воин',
        level: 1,
        maxHP: 105,
        damage: 17,
        available: true,
        avatarKey: 'hunter_marra_kamennaya_zhila',
        avatarPath: '/assets/characters/hunters/marra-kamennaya-zhila.png',
        description: 'Крепкая женщина-воин. Жёсткая, немногословная, с лицом человека, который давно перестал ждать милости от мира.'
    },

    {
        id: 'old_tracker',
        name: 'Осрик Сухой',
        role: 'Старый ветеран',
        level: 1,
        maxHP: 72,
        damage: 14,
        available: true,
        avatarKey: 'hunter_osrik_suhoy',
        avatarPath: '/assets/characters/hunters/osrik-suhoy.png',
        description: 'Худой старый ветеран. Измотанный, злой, внимательный. Такой, кто выжил не силой, а привычкой не умирать.'
    },

    {
        id: 'gart',
        name: 'Гарт Безмолвный',
        role: 'Тяжёлый боец',
        level: 1,
        maxHP: 120,
        damage: 18,
        available: true,
        avatarKey: 'hunter_gart_bezmolvnyy',
        avatarPath: '/assets/characters/hunters/gart-bezmolvnyy.png',
        description: 'Лысый тяжёлый боец. Мрачный, пугающе спокойный, почти не говорит.'
    },

    {
        id: 'eyla',
        name: 'Эйла Волчий Рубец',
        role: 'Боец',
        level: 1,
        maxHP: 82,
        damage: 19,
        available: true,
        avatarKey: 'hunter_eyla_volchiy_rubec',
        avatarPath: '/assets/characters/hunters/eyla-volchiy-rubec.png',
        description: 'Сухая, жилистая, резкая. На лице не красота, а следы жизни, где каждый день мог быть последним.'
    },

    {
        id: 'young_spear',
        name: 'Торрен Пепельный',
        role: 'Пепельный ветеран',
        level: 1,
        maxHP: 110,
        damage: 17,
        available: true,
        avatarKey: 'hunter_torren_pepelnyy',
        avatarPath: '/assets/characters/hunters/torren-pepelnyy.png',
        description: 'Коренастый мужчина с тяжёлым взглядом. Бывший участник Пепельных походов, вернулся оттуда другим человеком.'
    },

    {
        id: 'mikel',
        name: 'Микель Чёрный Зуб',
        role: 'Охотник',
        level: 1,
        maxHP: 78,
        damage: 16,
        available: true,
        avatarKey: 'hunter_mikel_chernyy_zub',
        avatarPath: '/assets/characters/hunters/mikel-chernyy-zub.png',
        description: 'Злой, цепкий охотник в рваном капюшоне. За его оскалом давно закрепилось это прозвище.'
    }
]

export function getHunterById(hunterId) {
    return hunters.find((hunter) => hunter.id === hunterId)
}

export function getPartyHunters(partyIds) {
    return partyIds
        .map((hunterId) => getHunterById(hunterId))
        .filter(Boolean)
}
