// Encounters
Game.enemiesByName["Spider Golem"] = {
  health: 70, defense: 15,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 100,
  loot: { items: [BattleData.items.cape, BattleData.items.coat], prob: 20 }
};

Game.enemiesByName["Snow Boar"] = {
  health: 120, defense: 17,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Nature,
  
  gold: 130,
  loot: { items: [BattleData.items.fish, BattleData.items.boots], prob: 20 }
};

Game.enemiesByName["Dark Dragon"] = {
  health: 150, defense: 19,
  weapon: BattleData.enemyAttacks.fire,
  type: BattleData.AttackTypes.Nature,
  
  gold: 75,
  loot: { items: [BattleData.items.bag, BattleData.items.toast], prob: 20 }
};

Game.enemiesByName["Dark Knight"] = {
  health: 195, defense: 23,
  weapon: BattleData.enemyAttacks.fire,
  type: BattleData.AttackTypes.Physical,
  
  gold: 100,
  loot: { items: [BattleData.items.helmet, BattleData.items.coat], prob: 20 }
};


// Optional bosses
Game.enemiesByName["Giant Golem"] = {
  behaviorClass: BossEnemyBehavior,
  health: 250, defense: 18,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Physical,
  
  gold: 300,
  loot: { items: [BattleData.items.physicalStaff], prob: 30 }
};

Game.enemiesByName["Horned Giant"] = {
  behaviorClass: BossEnemyBehavior,
  health: 325, defense: 22,
  weapon: BattleData.enemyAttacks.thunder,
  type: BattleData.AttackTypes.Nature,
  
  gold: 350,
  loot: { items: [BattleData.items.natureStaff], prob: 30 }
};

Game.enemiesByName["Boar Rider"] = {
  behaviorClass: BossEnemyBehavior,
  health: 350, defense: 27,
  weapon: BattleData.enemyAttacks.water,
  type: BattleData.AttackTypes.Neutral,
  
  gold: 150,
  loot: { items: [BattleData.items.spiritStaff], prob: 30 }
};

// Final boss
Game.enemiesByName["Final Boss"] = {
  behaviorClass: BossEnemyBehavior,
  health: 500, defense: 30,
  weapon: BattleData.enemyAttacks.crystal,
  type: BattleData.AttackTypes.Spirit,
  
  gold: 1000
};
