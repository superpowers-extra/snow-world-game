namespace BattleData {
  export enum AttackTypes { Spirit, Physical, Nature, Neutral, None };

  export let typeResistance = [AttackTypes.Physical, AttackTypes.Nature, AttackTypes.Spirit];
  export let resistanceFactor = 0.85;
  export let typeWeakness = [AttackTypes.Nature, AttackTypes.Spirit, AttackTypes.Physical];
  export let weaknessFactor = 1.2;
  
  export function applyFactors(ownType: AttackTypes, targetType: AttackTypes, value: number) {
    if (ownType === AttackTypes.Neutral || targetType === AttackTypes.Neutral) return value;

    if (BattleData.typeWeakness[targetType] === ownType) value *= BattleData.weaknessFactor;
    else if (BattleData.typeResistance[targetType] === ownType) value *=BattleData.resistanceFactor;
    return Math.round(value);
  }
  
  export enum ItemTypes { Food, Weapon, Magic, Shield, Hood, Helmet, Boots, Coat, Cape, Bag };
  
  export let items = {
    // Staffs
    spiritStaff: <WeaponItem>{
      name: "Spirit Staff", type: ItemTypes.Weapon,
      description: `A powerful weapon\nfor the strong mind...\nUse both keys\nto switch weapon`,
      attackType: AttackTypes.Spirit, damage: 25,
      attacks: [{ projectile: "Thunder/1" }, { instant: "Thunder/2"}, { instant: "Thunder/3" } ]
    },
    physicalStaff: <WeaponItem>{
      name: "Physical Staff", type: ItemTypes.Weapon,
      description: `Shatters the earth\nin a single strike\nUse both keys\nto switch weapon`,
      attackType: AttackTypes.Physical, damage: 25,
      attacks: [{ instant: "Rock/1" }, { projectile: "Rock/2"}, { instant: "Rock/3" } ]
    },
    natureStaff: <WeaponItem>{
      name: "Nature Staff", type: ItemTypes.Weapon,
      description: `Given enough time\ngrass pierces the rock.\nUse both keys\nto switch weapon`,
      attackType: AttackTypes.Nature, damage: 25,
      attacks: [{ projectile: "Water/1" }, { instant: "Water/2"}, { projectile: "Water/3" } ]
    },
    
    // Protections
    hood: <ProtectionItem>{
      name: "Hood", type: ItemTypes.Hood,
      description: `For rain, snow and wind.`,
      attackType: AttackTypes.Nature, protection: 6
    },
    helmet: <ProtectionItem>{
      name: "Helmet", type: ItemTypes.Helmet,
      description: `Always wear a helmet.`,
      attackType: AttackTypes.Neutral, protection: 11
    },
    boots: <ProtectionItem>{
      name: "Boots", type: ItemTypes.Boots,
      description: `Comfy but stinky.`,
      attackType: AttackTypes.Neutral, protection: 3
    },
    coat: <ProtectionItem>{
      name: "Coat", type: ItemTypes.Coat,
      description: `It's cold out there.`,
      attackType: AttackTypes.Neutral, protection: 7
    },
    cape: <ProtectionItem>{
      name: "Cape", type: ItemTypes.Cape,
      description: `Style comes first.`,
      attackType: AttackTypes.Neutral, protection: 3
    },
    bag: <ProtectionItem>{
      name: "Bag", type: ItemTypes.Bag,
      description: `A tough bag.`,
      attackType: AttackTypes.Neutral, protection: 2
    },
    
    // Food
    fish: <FoodItem>{
      name: "Fish", type: ItemTypes.Food, description: `Smells fishy.`,
      amount: 70
    },
    toast: <FoodItem>{
      name: "Toast", type: ItemTypes.Food, description: `Bacon not included.`,
      amount: 130
    }
  };
  
  export let enemyAttacks = {
    thunder: <WeaponItem>{
      name: "Thunder", type: ItemTypes.Weapon, description: null,
      attackType: AttackTypes.Spirit, damage: 20,
      attacks: [{ projectile: "Thunder/1" }, { instant: "Thunder/2"}, { instant: "Thunder/3" } ]
    },
    rock: <WeaponItem>{
      name: "Rock", type: ItemTypes.Weapon, description: null,
      attackType: AttackTypes.Physical, damage: 20,
      attacks: [{ instant: "Rock/1" }, { projectile: "Rock/2"}, { instant: "Rock/3" } ]
    },
    water: <WeaponItem>{
      name: "Water", type: ItemTypes.Weapon, description: null,
      attackType: AttackTypes.Nature, damage: 20,
      attacks: [{ projectile: "Water/1" }, { instant: "Water/2"}, { projectile: "Water/3" } ]
    },
    fire: <WeaponItem>{
      name: "Fire", type: ItemTypes.Weapon, description: null,
      attackType: AttackTypes.Spirit, damage: 25,
      attacks: [{ projectile: "Fire/1" }, { projectile: "Fire/2" }]
    },
    ice: <WeaponItem>{
      name: "Ice", type: ItemTypes.Weapon, description: null,
      attackType: AttackTypes.Nature, damage: 25,
      attacks: [{ projectile: "Ice/1" }]
    },
    crystal: <WeaponItem>{
      name: "Crystal", type: ItemTypes.Weapon, description: null,
      attackType: AttackTypes.Physical, damage: 25,
      attacks: [{ projectile: "Crystal/1" }, { instant: "Crystal/2" }, { instant: "Crystal/3" }]
    }
  }
  
  export interface Item {
    name: string;
    type: ItemTypes;
    description: string;
  }
  
  export interface FoodItem extends Item {
    amount: number;
  }
  
  export interface BattleItem extends Item {
    attackType: AttackTypes;
  }
  
  export interface WeaponItem extends BattleItem {
    damage: number;
    attacks: { projectile?: string; instant?: string; }[];
  }
  
  export interface ProtectionItem extends BattleItem {
    protection: number;
  }
  
  export function isFood(item: Item): item is FoodItem { return item.type === ItemTypes.Food; }
  export function isWeapon(item: Item): item is WeaponItem { return item.type === ItemTypes.Weapon; }
  export function isMagic(item: Item): item is Item { return item.type === ItemTypes.Magic; }
  export function isShield(item: Item): item is ProtectionItem { return item.type === ItemTypes.Shield; }
  export function isHood(item: Item): item is ProtectionItem { return item.type === ItemTypes.Hood; }
  export function isHelmet(item: Item): item is ProtectionItem { return item.type === ItemTypes.Helmet; }
  export function isBoots(item: Item): item is ProtectionItem { return item.type === ItemTypes.Boots; }
  export function isCoat(item: Item): item is ProtectionItem { return item.type === ItemTypes.Coat; }
  export function isCape(item: Item): item is ProtectionItem { return item.type === ItemTypes.Cape; }
  export function isBag(item: Item): item is ProtectionItem { return item.type === ItemTypes.Bag; }
}
