Game.enemiesByName["Tutorial"] = {
  behaviorClass: TutorialEnemyBehavior,
  health: 20, defense: 5,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Neutral,
  
  gold: 10
};

// Encounter
Game.enemiesByName["Crabi"] = {
  health: 40, defense: 5,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Nature,
  
  gold: 78,
  loot: { items: [BattleData.items.boots, BattleData.items.fish], prob: 20 }
};

Game.enemiesByName["Wild Boar"] = {
  health: 30, defense: 8,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Physical,
  
  gold: 84,
  loot: { items: [BattleData.items.boots, BattleData.items.hood], prob: 20 }
};

// Optional boss - Gladiator
Game.enemiesByName["Gladiator"] = {
  behaviorClass: BossEnemyBehavior,
  health: 70, defense: 7,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Physical,
  
  gold: 180,
  loot: { items: [BattleData.items.physicalStaff], prob: 30 }
};

Game.enemiesByName["Bandit"] = {
  health: 45, defense: 6,
  weapon: BattleData.enemyAttacks.ice,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 60,
  loot: { items: [BattleData.items.bag], prob: 20 }
};

// Optional boss - Dragon
Game.enemiesByName["Dragon"] = {
  behaviorClass: BossEnemyBehavior,
  health: 75, defense: 10,
  weapon: BattleData.enemyAttacks.thunder,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 150,
  loot: { items: [BattleData.items.spiritStaff], prob: 30 }
};

Game.enemiesByName["Crabi Ice"] = {
  health: 45, defense: 6,
  weapon: BattleData.enemyAttacks.ice,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 90,
  loot: { items: [BattleData.items.boots, BattleData.items.hood, BattleData.items.fish], prob: 35 }
};

// Optional boss - Leonard
Game.enemiesByName["Leonard"] = {
  behaviorClass: BossEnemyBehavior,
  health: 80, defense: 10,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 160,
  loot: { items: [BattleData.items.spiritStaff], prob: 30 }
};

// Final boss
Game.enemiesByName["Conan"] = {
  behaviorClass: BossEnemyBehavior,
  health: 110, defense: 15,
  weapon: BattleData.enemyAttacks.rock,
  type: BattleData.AttackTypes.Physical,
  
  gold: 250,
  loot: { items: [<BattleData.BattleItem>{ name: "Spell Tome 1", type: BattleData.ItemTypes.Magic, description: `Take your magic\nto a new level!`}], prob: 100 }
};

