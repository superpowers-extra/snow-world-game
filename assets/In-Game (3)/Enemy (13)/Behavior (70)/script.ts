class EnemyBehavior extends Sup.Behavior implements EnemyData {
  position: Sup.Math.Vector2;

  type: BattleData.AttackTypes;
  health: number;
  defense: number;
  weapon: BattleData.WeaponItem;
  
  attackIndex = 0;
  
  gold: number;
  loot: { items: BattleData.BattleItem[], prob: number };

  awake() {
    this.position = this.actor.getLocalPosition().toVector2();
    if (this.type === BattleData.AttackTypes.None) return;
    
    if (AreaMap.currentArea !== "Valley" && this.weapon.name !== "Ice") this.attackIndex = 1;
    this.scheduleAttack();
  }

  scheduleAttack() {
    new Sup.Tween(this.actor, {}).to({}, EnemyBehavior.attackCooldown + Sup.Math.Random.integer(0, 25) * 100)
    .onComplete(() => { this.doAttack(); })
    .start();
  }
  
  protected doAttack() {
      if (this.health === 0) return;

      let playersAlive: PlayerBehavior[] = [];
      for (let player of Game.players) {
        if (player.health > 0) playersAlive.push(player.behavior);
      }
      if (playersAlive.length === 0) return;

      let player = Sup.Math.Random.sample(playersAlive);
      let attack = this.weapon.attacks[this.attackIndex];
      if (attack.projectile != null) {
        let position = this.position.clone().add(3, 0);
        let targetPosition = player.position.clone().add(-1, 0);
        Fx.createProjectile(attack.projectile, position, targetPosition, 0.3, () => {
          player.hit(this.weapon, this.attackIndex);
        });
        this.scheduleAttack();

      } else if (attack.instant != null) {
        new Sup.Tween(this.actor, {}).to({}, 500)
          .onUpdate(() => { this.actor.setLocalPosition(this.position).moveLocal(Sup.Math.Random.float(-0.1, 0.1), Sup.Math.Random.float(-0.1, 0.1)); })
          .onComplete(() => {
            this.actor.setLocalPosition(this.position);
          
            Sup.setTimeout(400, () => {
              new Sup.Tween(this.actor, { x: 0 }).to({ x: 1 }, 120).yoyo(true).repeat(2)
                .onUpdate((object) => { this.actor.setLocalX(this.position.x + object.x); })
                .start();
              
              let targetPosition = player.position.clone().add(-1, 0);
              Fx.createInstant(attack.instant, targetPosition, () => {
                player.hit(this.weapon, this.attackIndex);
              });  
              this.scheduleAttack();
            })
          })
          .start();
      }
  }

  hit(weapon: BattleData.WeaponItem, attackLevel: number) {
    if (this.health === 0) return;
    
    let damage = BattleData.applyFactors(weapon.attackType, this.type, weapon.damage * attackLevel);
    let defense = BattleData.applyFactors(this.type, weapon.attackType, this.defense);

    damage = Math.max(0, damage - defense);
    this.applyDamage(damage);
  }
  
  protected applyDamage(damage: number) {
    if (damage === 0) {
      Utils.createFloatingText("Blocked", this.position, { color: new Sup.Color(0xffffff) });
      Sup.Audio.playSound("Sounds/Battle/Block");
      Game.manager.screenShake(200, 0.1);
      return;
    }
    
    Sup.Audio.playSound("Sounds/Battle/Hit");
    
    Utils.createFloatingText(`-${damage}`, this.position, { color: new Sup.Color(0x00ff00) });
    Game.manager.screenShake(400, 0.15);
    
    this.health = Math.max(0, this.health - damage);
    if (this.health > 0) {
      this.actor.spriteRenderer.setColor(EnemyBehavior.hitColor, EnemyBehavior.hitColor, EnemyBehavior.hitColor);
      Sup.setTimeout(EnemyBehavior.hitDuration, () => { this.actor.spriteRenderer.setColor(1, 1, 1); })
      return;
    }
    
    let alivePlayers: PlayerData[] = [];
    for (let player of Game.players) {
      if (player.health > 0) alivePlayers.push(player);
    }
    
    let baseGold = this.gold + Sup.Math.Random.integer(-8, 8);
    let amountPerPlayer = (alivePlayers.length === 2) ? Math.round(baseGold * 2 / 3) : baseGold;
    for (let player of alivePlayers) player.behavior.earnGold(amountPerPlayer);
    
    Sup.setTimeout(400, () => {
      Utils.createFloatingText(`+${amountPerPlayer}`, this.position, { color: new Sup.Color(0xffff44), icon: "Common/Gold" });
      Sup.Audio.playSound("Sounds/Battle/Pick Up Gold");
    });
    
    if (this.loot != null) {
      let prob = Sup.Math.Random.integer(0, 100);
      if (prob <= this.loot.prob) {
        let item = Sup.Math.Random.sample(this.loot.items);
        let lootActor = new Sup.Actor("Loot").setLocalPosition(this.position).moveLocalZ(-0.1).setLocalScale(0.3);
        new Sup.SpriteRenderer(lootActor, `Shop/Items/${item.name}`);
        
        Game.loots.push({ actor: lootActor, item });
      }
    }
    
    let index = Game.enemies.indexOf(this);
    if (index !== -1) Game.enemies.splice(index, 1);
    let sprite = this.actor.spriteRenderer.getSprite();
    this.actor.spriteRenderer.setSprite(sprite, Sup.SpriteRenderer.MaterialType.Shader, "In-Game/Enemy/Die");
    Sup.setTimeout(1000, () => { this.actor.destroy(); } );
    
    if (Game.enemies.length === 0) Game.winLevel();
  }
}
Sup.registerBehavior(EnemyBehavior);

namespace EnemyBehavior {
  export const hitColor = 2;
  export const hitDuration = 200;
  
  export const attackCooldown = 4000;
}
