// Encounters
Game.enemiesByName["Skeleton"] = {
  health: 70, defense: 10,
  weapon: BattleData.enemyAttacks.thunder,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 40,
  loot: { items: [BattleData.items.helmet], prob: 20 }
};

Game.enemiesByName["Larva"] = {
  health: 50, defense: 5,
  weapon: BattleData.enemyAttacks.fire,
  type: BattleData.AttackTypes.Nature,
  
  gold: 20
};

Game.enemiesByName["Chest Trap"] = {
  health: 60, defense: 2,
  weapon: BattleData.enemyAttacks.rock,
  type: BattleData.AttackTypes.Physical,
  
  gold: 90,
};

Game.enemiesByName["Fallen Keeper"] = {
  health: 120, defense: 8,
  weapon: BattleData.enemyAttacks.ice,
  type: BattleData.AttackTypes.Neutral,
  
  gold: 90,
  loot: { items: [BattleData.items.boots, BattleData.items.bag], prob: 20 }
};

Game.enemiesByName["Mage"] = {
  health: 75, defense: 10,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 30,
  loot: { items: [BattleData.items.cape, BattleData.items.boots], prob: 20 }
};

Game.enemiesByName["Skeleton Warrior"] = {
  health: 60, defense: 12,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 50,
  loot: { items: [BattleData.items.hood, BattleData.items.cape], prob: 20 }
};

// Optional bosses
Game.enemiesByName["Mother Larva"] = {
  behaviorClass: BossEnemyBehavior,
  health: 120, defense: 15,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Nature,
  
  gold: 220,
  loot: { items: [BattleData.items.spiritStaff], prob: 30 }
};

Game.enemiesByName["Traveler"] = {
  behaviorClass: BossEnemyBehavior,
  health: 300, defense: 20,
  weapon: BattleData.enemyAttacks.thunder,
  type: BattleData.AttackTypes.Physical,
  
  gold: 400,
  loot: { items: [BattleData.items.physicalStaff, BattleData.items.toast], prob: 30 }
};

// Final boss
Game.enemiesByName["Lizard"] = {
  behaviorClass: BossEnemyBehavior,
  health: 180, defense: 20,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 360,
  loot: { items: [<BattleData.BattleItem>{ name: "Spell Tome 2", type: BattleData.ItemTypes.Magic, description: `Learn ultimate\nmagic spells!` }], prob: 100 }
};
