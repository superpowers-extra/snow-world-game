Sup.Audio.setMasterVolume(0.3);

namespace Game {
  export let playersCount = 1;
  
  let activeThemeName: string = null;
  let themes = {
    Menu: new Sup.Audio.SoundPlayer("Sounds/Menus/Theme", 0.5, { loop: true }),
    Map: new Sup.Audio.SoundPlayer("Sounds/Map/Theme", 0.5, { loop: true }),
    Battle: new Sup.Audio.SoundPlayer("Sounds/Battle/Theme 1", 0.5, { loop: true }),
    Shop: new Sup.Audio.SoundPlayer("Sounds/Shop/Theme", 0.5, { loop: true })
  };
  
  export function setTheme(themeName: string) {
    if (activeThemeName === themeName) return;
    if (activeThemeName != null) themes[activeThemeName].stop();
    activeThemeName = themeName;
    if (activeThemeName != null) themes[activeThemeName].play();
  }
  
  export let victory: boolean;
  
  export let manager: GameManager;
  export let players: PlayerData[];
  export let enemies: EnemyBehavior[];
  export let loots: { actor: Sup.Actor, item: BattleData.Item }[];
  
  export let areas: { [name: string]: { encounterGroups: string[][]; treasureGroups: string[][], bossGroups: string[][]; finalBossGroup: string[]; }} = {};
  export let enemiesByName: { [name: string]: EnemyData } = {};
  export let chestEnemy: EnemyData = {
    health: 60, defense: 5,
    weapon: null,
    type: BattleData.AttackTypes.None,

    gold: 200,
    loot: { items: [
      BattleData.items.cape,
      BattleData.items.hood,
      BattleData.items.bag,
      BattleData.items.helmet,
      BattleData.items.spiritStaff,
      BattleData.items.physicalStaff,
      BattleData.items.natureStaff
    ], prob: 90 }
  };
  
  export function init() {
    for (let areaName in Game.areas) {
      let area = Game.areas[areaName];
      
      if (area.encounterGroups.length < 20) throw new Error(`Area "${area}" doesn't have enough encounter groups`);
      for (let group of area.encounterGroups) {
        for (let enemyName of group) {
          if (enemiesByName[enemyName] == null) throw new Error(`Enemy "${enemyName}" in encounter group isn't defined`);
        }
      }

      for (let group of area.treasureGroups) {
        for (let enemyName of group) {
          if (enemyName !== "Chest" && enemiesByName[enemyName] == null) throw new Error(`Enemy "${enemyName}" in trasure group isn't defined`);
        }
      }

      if (area.bossGroups.length < 3) throw new Error(`Area "${area}" doesn't have enough boss groups`);
      for (let group of area.bossGroups) {
        for (let enemyName of group) {
          if (enemiesByName[enemyName] == null) throw new Error(`Enemy "${enemyName}" in boss group isn't defined`);
        }
      }
      
      for (let enemyName of area.finalBossGroup) {
        if (enemiesByName[enemyName] == null) throw new Error(`Enemy "${enemyName}" in final boss group isn't defined`);
      }
    }
    
    players = [];
    for (let i = 0; i < playersCount; i++) {
      let staffs = [null, null, null];
      let activeStaff = Sup.Math.Random.integer(0, 2);
      
      switch (activeStaff) {
        case BattleData.AttackTypes.Spirit:
          staffs[activeStaff] = BattleData.items.spiritStaff;
          break;
        case BattleData.AttackTypes.Physical:
          staffs[activeStaff] = BattleData.items.physicalStaff;
          break;
        case BattleData.AttackTypes.Nature:
          staffs[activeStaff] = BattleData.items.natureStaff;
          break;
      }
      
      players.push({
        behavior: null,
        health: 200, maxHealth: 200,
        gold: 0, attackLevel: 1,
        activeStaff, staffs,
        shield: <BattleData.ProtectionItem>{
          name: "Basic Shield", type: BattleData.ItemTypes.Shield, description: `Every warrior's choice.`,
          attackType: BattleData.AttackTypes.Neutral, protection: 30
        },
        protections: { hood: null, helmet: null, boots: null, coat: null, cape: null, bag: null }
      })
    }
    
    AreaMap.generate(Object.keys(Game.areas)[0]);
  }
  
  export function loadLevel() {
    victory = false;
    loots = [];
    
    Sup.loadScene("In-Game/Scene");
    
    let battleground: string;
    if (AreaMap.playerPlace.type === AreaMap.PlaceType.FinalBoss) battleground = "Final Boss";
    else {
      let battlegrounds = Sup.get(`Areas/${AreaMap.currentArea}/Battlegrounds`, Sup.Folder).children;
      battleground = `Battlegrounds/${Sup.Math.Random.sample(battlegrounds)}`;
    }
    Sup.getActor("Background").spriteRenderer.setSprite(`Areas/${AreaMap.currentArea}/${battleground}`);
    
    if (AreaMap.currentArea === "Mountain")
      Fx.addSnow(AreaMap.playerPlace.position.x < AreaMap.finalPlace.position.x / 2);

    let placeholders = Sup.getActor("Placeholders");
    // Spawn players
    let addPlayer = (index: number, placeholder: string) => {
      let playerPlaceholder = placeholders.getChild(`Players/${placeholder}`);
      players[index].behavior =  Sup.appendScene("In-Game/Player/Prefab")[0].getBehavior(PlayerBehavior);
      players[index].behavior.setup(index, playerPlaceholder.getLocalPosition().toVector2());
    }
    if (playersCount === 1) addPlayer(0, "1 player");
    else { addPlayer(0, "2 players - 1"); addPlayer(1, "2 players - 2"); }

    // Spawn enemies
    enemies = [];
    let enemyNames = AreaMap.playerPlace.enemies;
    for (let index = 0; index < enemyNames.length; index++) {
      let enemyPlaceholder = placeholders.getChild(`Enemies/${enemyNames.length}/${index + 1}`);
      let enemyName = enemyNames[index];
      
      let enemyActor = new Sup.Actor("Enemy").setLocalPosition(enemyPlaceholder.getLocalPosition());
      let spritePath = `Areas/${AreaMap.currentArea}/Enemies/${enemyName}`;
      if (enemyName === "Chest") spritePath = "In-Game/Chest";
      
      let sprite = Sup.get(spritePath, Sup.Sprite);
      new Sup.SpriteRenderer(enemyActor, sprite);
      if (sprite.getAnimationList().indexOf("Idle") !== -1) enemyActor.spriteRenderer.setAnimation("Idle");

      let enemy = (enemyName === "Chest") ? chestEnemy : enemiesByName[enemyName];
      let behaviorClass = enemy.behaviorClass;
      if (behaviorClass == null) behaviorClass = EnemyBehavior;
      enemies.push(enemyActor.addBehavior(behaviorClass, enemy));
    }
    
    Fade.start(Fade.Direction.In);
  }
  
  export function winLevel() {
    Game.victory = true;
    
    Sup.setTimeout(1000, () => {
      for (let player of players) player.behavior.victory();
      Sup.setTimeout(2600, () => { Game.manager.showNextloot(); });
    })
  }
  
  export function looseLevel() {
    Fade.start(Fade.Direction.Out, { duration: 2000 }, () => { Sup.loadScene("Game Over/Scene"); })
  }
}

interface PlayerData {
  behavior: PlayerBehavior;
  health: number; maxHealth: number;
  gold: number; attackLevel: number; activeStaff: number;
  staffs: BattleData.WeaponItem[];
  shield: BattleData.ProtectionItem;
  protections: {
    hood: BattleData.ProtectionItem;
    helmet: BattleData.ProtectionItem;
    boots: BattleData.ProtectionItem;
    coat: BattleData.ProtectionItem;
    cape: BattleData.ProtectionItem;
    bag: BattleData.ProtectionItem;
  }
}

interface EnemyData {
  behaviorClass?: typeof EnemyBehavior;
  type: BattleData.AttackTypes;
  health: number; defense: number;
  weapon: BattleData.WeaponItem;
  
  gold: number;
  loot?: { items: BattleData.Item[]; prob: number; }
}
