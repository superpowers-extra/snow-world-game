class PlayerBehavior extends Sup.Behavior {
  static setupSprites(index: number, spriteRndrs: Sup.SpriteRenderer[]) {
    for (let spriteRndr of spriteRndrs) PlayerBehavior.equipSprite(index, spriteRndr);
  }
  
  static equipSprite(index: number, spriteRndr: Sup.SpriteRenderer) {
    function setSprite(spriteRndr: Sup.SpriteRenderer, path: string) {
      spriteRndr.setSprite(path, Sup.SpriteRenderer.MaterialType.Shader, "In-Game/Player/Switch Color");
    }

    let data = Game.players[index];
    switch (spriteRndr.actor.getName()) {
      case "Staff":
        setSprite(spriteRndr, `In-Game/Player/Items/Staffs/${data.staffs[data.activeStaff].name}`);
        break;
      case "Shield":
        setSprite(spriteRndr, `In-Game/Player/Items/Shields/${data.shield.name}`);
        break;
      case "Hair":
        if (data.protections.helmet == null && data.protections.hood == null) 
          setSprite(spriteRndr, `In-Game/Player/Hairs/${index + 1}`);
        else {
          spriteRndr.setSprite(null);
          return;
        }
        break;
      case "Hood":
        if (data.protections.hood == null) return;
        setSprite(spriteRndr, `In-Game/Player/Items/${data.protections.hood.name}`);  
        break;
      case "Helmet":
        if (data.protections.helmet == null) return;
        let helmetName = data.protections.helmet.name;
        if (data.protections.hood != null) helmetName = `Hood - ${helmetName}`;
        setSprite(spriteRndr, `In-Game/Player/Items/${helmetName}`);  
        break;
      case "Boots":
        if (data.protections.boots == null) return;
        setSprite(spriteRndr, `In-Game/Player/Items/${data.protections.boots.name}`);
        break;
      case "Coat":
        if (data.protections.coat == null) return;
        setSprite(spriteRndr, `In-Game/Player/Items/${data.protections.coat.name}`);
        break;
      case "Cape":
        if (data.protections.cape == null) return;
        setSprite(spriteRndr, `In-Game/Player/Items/${data.protections.cape.name}`);
        break;
      case "Bag":
        if (data.protections.bag == null) return;
        setSprite(spriteRndr, `In-Game/Player/Items/${data.protections.bag.name}`);
        break;
    }
    spriteRndr.uniforms.setFloat("colorIndex", index);
  }
  
  static walkSprites(spriteRndrs: Sup.SpriteRenderer[], callback: (spriteRndr: Sup.SpriteRenderer) => void) {
    for (let spriteRndr of spriteRndrs) {
      if (spriteRndr.getSprite() == null) continue;
      callback(spriteRndr);
    }
  }

  static getLoot(index: number, loot: BattleData.Item) {
    let player = Game.players[index];
    
    if (BattleData.isFood(loot)) {
      player.health += loot.amount;
      player.maxHealth += loot.amount / 2;
      player.health = Math.min(player.health, player.maxHealth);
      
    } else if (BattleData.isWeapon(loot)) {
      player.staffs[loot.attackType] = loot;
      player.activeStaff = loot.attackType;
    } else if (BattleData.isShield(loot)) player.shield = loot;
    else if (BattleData.isHood(loot)) player.protections.hood = loot;
    else if (BattleData.isHelmet(loot)) player.protections.helmet = loot;
    else if (BattleData.isBoots(loot)) player.protections.boots = loot;
    else if (BattleData.isCoat(loot))player.protections.coat = loot;
    else if (BattleData.isCape(loot)) player.protections.cape = loot;
    else if (BattleData.isBag(loot)) player.protections.bag = loot;
  }
  
  private playerIndex: number;
  globalData: PlayerData;

  position: Sup.Math.Vector2;
  private spriteRndrs: Sup.SpriteRenderer[];
  private staffRndr: Sup.SpriteRenderer;

  isRunning = true;
  isCharging = false;
  isDefending = false;

  private hudActor: Sup.Actor;
  private healthBarActor: Sup.Actor;
  private visualHealth: number;

  private actionBarActor: Sup.Actor;
  private actionBarGauge = 0;
  private actionChargeBarActor: Sup.Actor;
  private actionChargeBarGauge = 0;  
  private actionChargeCursorActor: Sup.Actor;
  private actionCompleteChargeActors: Sup.Actor[] = [];

  private goldRndr: Sup.TextRenderer;

  private attackCooldown = 0;
  private currentAttackLevel: number;
  private hasShot = false;

  setup(playerIndex: number, position: Sup.Math.Vector2) {
    this.playerIndex = playerIndex;
    this.globalData = Game.players[playerIndex];
    
    this.position = position;
    this.actor.setLocalPosition(position);
    this.spriteRndrs = [];
    for (let spriteActor of this.actor.getChild("Sprites").getChildren()) {
      let spriteRndr = spriteActor.spriteRenderer;
      if (spriteActor.getName() === "Staff") this.staffRndr = spriteRndr;
      this.spriteRndrs.push(spriteRndr);
    }
    PlayerBehavior.setupSprites(this.playerIndex, this.spriteRndrs);
    
    // Setup HUD
    this.hudActor = this.actor.getChild("HUD");
    
    this.healthBarActor = this.hudActor.getChild("Health/Bar");
    this.visualHealth = this.globalData.health;
    
    this.actionBarActor = this.hudActor.getChild("Action/Bar");
    this.actionChargeBarActor = this.hudActor.getChild("Action/Charge Bar");
    this.actionChargeBarActor.setVisible(false);
    this.actionChargeCursorActor = this.hudActor.getChild("Action/Charge Cursor");
    this.actionChargeCursorActor.setVisible(false);
    
    for (let i = 0; i < this.globalData.attackLevel; i++) {
      let actionCompleteChargeActor = new Sup.Actor("Complete Bar", this.hudActor.getChild("Action")).setLocalZ(0.2);
      new Sup.SpriteRenderer(actionCompleteChargeActor, "In-Game/Player/HUD/Action/Complete Bar");
      actionCompleteChargeActor.setLocalX((-0.5 + (i + 0.5) / this.globalData.attackLevel) * PlayerBehavior.actionBarSize);
      actionCompleteChargeActor.setLocalScaleX(1 / this.globalData.attackLevel);
      actionCompleteChargeActor.setVisible(false);
      this.actionCompleteChargeActors.push(actionCompleteChargeActor);
    }
    
    if (this.globalData.attackLevel > 1) this.hudActor.getChild("Action/Top").spriteRenderer.setSprite(`In-Game/Player/HUD/Action/Top ${this.globalData.attackLevel}`);
    
    this.goldRndr = this.hudActor.getChild("Gold").textRenderer;
    this.goldRndr.setText(this.globalData.gold);
    
    // Enter battle
    PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Run"); });
    this.hudActor.setVisible(false);
    let startOffset = 12;
    this.actor.setLocalX(this.position.x + startOffset);
    new Sup.Tween(this.actor, { x: startOffset }).to({ x: 0 }, 1200)
      .delay(Sup.Math.Random.integer(0, 30) * 10)
      .onUpdate((object) => { this.actor.setLocalX(this.position.x + object.x); })
      .onComplete(() => {
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle Battle"); });
        this.hudActor.setParent(Game.manager.actor);
        this.hudActor.setVisible(true);
        this.isRunning = false;
      }).start();
  }

  update() {
    if (this.isRunning) return;
    
    // Update health
    this.visualHealth = Sup.Math.lerp(this.visualHealth, this.globalData.health, 0.1);
    Utils.setProgressBar(this.healthBarActor, this.visualHealth, this.globalData.maxHealth, PlayerBehavior.healthBarSize);
    if (this.globalData.health === 0) {
      if (!this.spriteRndrs[0].isAnimationPlaying()) this.hudActor.setVisible(false);
      return;
    }

    let currentAnimation = this.spriteRndrs[0].getAnimation();
    if (currentAnimation === "Hit") { this.beingHit(); return; }
    else if (currentAnimation.indexOf("Attack") !== -1) { this.attacking(); return; }
    else if (currentAnimation === "Defense" && !this.isDefending) { this.removingDefense(); return; }
    else if (currentAnimation === "Change Weapon") { this.changingWeapon(); return; }
    
    if (Game.victory) {
      if (currentAnimation !== "Victory") PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle Battle"); });
      return;
    }
    
    if (!this.isCharging && !this.isDefending && Input.wasAction1JustPressed(this.playerIndex) && Input.wasAction2JustPressed(this.playerIndex)) {
      this.startChangeWeapon();
      return;
    }

    // Update action
    if (this.attackCooldown > 0) this.attackCooldown -= 1;
    
    if (Input.isAction1Down(this.playerIndex) && !this.isCharging && !this.isDefending && this.attackCooldown === 0) this.startCharging();
    if (!this.isDefending && Input.wasAction2JustPressed(this.playerIndex)) this.startDefense();
    
    if (this.isCharging) this.charging();
    else if (this.isDefending) this.defending();
    
    this.refillActionBar();
  }

  hit(weapon: BattleData.WeaponItem, attackIndex: number) {
    if (this.globalData.health === 0 || Game.victory) return;
    
    if (this.isCharging) this.stopCharging();
    
    let damage = Math.floor(weapon.damage * (1 + attackIndex * 0.5));
    
    if (this.spriteRndrs[0].getAnimation() === "Defense")
      damage -= BattleData.applyFactors(weapon.attackType, this.globalData.shield.attackType, this.globalData.shield.protection);
    
    for (let protectionName in this.globalData.protections) {
      let protection = this.globalData.protections[protectionName];
      if (protection == null) continue;
      
      let protectionValue = BattleData.applyFactors(weapon.attackType, protection.attackType, protection.protection);
      damage -= protectionValue;
    }
    damage = Math.max(0, damage);
    
    if (damage === 0) {
      Utils.createFloatingText("Blocked", this.position, { color: new Sup.Color(0xffffff) });
      Sup.Audio.playSound("Sounds/Battle/Block");
      Game.manager.screenShake(200, 0.1);
      return;
    }
    
    Sup.Audio.playSound("Sounds/Battle/Hit");
    
    this.isDefending = false;
    Utils.createFloatingText(`-${damage}`, this.position, { color: new Sup.Color(0xff0000) });
    Game.manager.screenShake(400, 0.15);

    PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setPlaybackSpeed(1); });

    this.globalData.health = Math.max(0, this.globalData.health - damage);
    if (this.globalData.health === 0) {
      PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Die", false); });
      
      for (let player of Game.players) {
        if (player.health > 0) return;
      }
      Game.looseLevel();
    } else PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Hit", false); });
  }

  victory() {
    if (this.globalData.health > 0) {
      this.actionBarActor.getParent().setVisible(false);
      Sup.setTimeout(Sup.Math.Random.integer(0, 50) * 10, () => {
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Victory"); });
        Sup.setTimeout(2000, () => {
          this.hudActor.setVisible(false);
          PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle"); });
        })
      });
    } else {
      Sup.setTimeout(2000, () => {
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle"); });
      });
    }
  }

  leaveBattle(direction: number) {
    this.isRunning = true;
    this.actor.setLocalScaleX(direction * -1);
    
    PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Run"); });
    new Sup.Tween(this.actor, { x: 0 }).to({ x: 30 }, 2000)
      .onUpdate((object) => { this.actor.setLocalX(this.position.x + direction * object.x); })
      .start();
  }

  earnGold(amount: number) {
    this.globalData.gold += amount;
    this.goldRndr.setText(this.globalData.gold);
  }

  private isAnimationDone() { return !this.spriteRndrs[0].isAnimationPlaying(); }

  private startDefense() {
    this.stopCharging();
    this.isDefending = true;
    PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => {
      spriteRndr.setAnimation("Defense", false)
        .pauseAnimation()
        .setAnimationFrameTime(2);
    });
  }

  private stopDefense() {
    this.isDefending = false;
    PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.playAnimation(false); });
  }

  private defending() {
    if (!Input.isAction2Down(this.playerIndex)) this.stopDefense();
    else {
      this.actionBarGauge = Math.max(0, this.actionBarGauge - PlayerBehavior.actionDefenseDropSpeed);
      Utils.setProgressBar(this.actionBarActor, this.actionBarGauge, PlayerBehavior.actionGaugeMax, PlayerBehavior.actionBarSize);
      if (this.actionBarGauge === 0) this.stopDefense();
    }
  }

  private removingDefense() {
    if (!this.spriteRndrs[0].isAnimationPlaying())
      PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle Battle"); });
  }

  private startCharging() {
    this.isCharging = true;
    PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Charge Start", false); });
  }

  private stopCharging() {
    this.isCharging = false;
    this.actionChargeBarGauge = 0;
    this.actionChargeBarActor.setVisible(false);
    this.actionChargeCursorActor.setVisible(false);
    for (let completeChargeActor of this.actionCompleteChargeActors) completeChargeActor.setVisible(false);
  }

  private charging() {
    this.currentAttackLevel = Math.floor(this.actionChargeBarGauge / (PlayerBehavior.actionGaugeMax / this.globalData.attackLevel));
      
    if (!Input.isAction1Down(this.playerIndex)) {
      this.hasShot = false;
      if (this.currentAttackLevel > 0)
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation(`Attack ${this.currentAttackLevel}`, false); });
      else {
        this.stopCharging();
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle Battle"); });
        this.attackCooldown = PlayerBehavior.attackCooldownDuration;
      }

    } else {
      let chargeSpeed = PlayerBehavior.actionChargeSpeeds[Math.min(this.globalData.attackLevel - 1, this.currentAttackLevel)];  
      this.actionChargeBarGauge = Math.min(this.actionBarGauge, this.actionChargeBarGauge + chargeSpeed);
      this.actionChargeBarActor.setVisible(true);
      Utils.setProgressBar(this.actionChargeBarActor, this.actionChargeBarGauge, PlayerBehavior.actionGaugeMax, PlayerBehavior.actionBarSize);

      for (let completeChargeIndex = 0; completeChargeIndex < this.globalData.attackLevel; completeChargeIndex++)
        this.actionCompleteChargeActors[completeChargeIndex].setVisible(this.currentAttackLevel > completeChargeIndex);

      if (this.actionChargeBarGauge === PlayerBehavior.actionGaugeMax) this.actionChargeCursorActor.setVisible(false);
      else {
        this.actionChargeCursorActor.setVisible(true);
        this.actionChargeCursorActor.setLocalX((-0.5 + this.actionChargeBarGauge / PlayerBehavior.actionGaugeMax) * PlayerBehavior.actionBarSize);
      }

      if (this.spriteRndrs[0].getAnimation() !== "Charge Start" || this.isAnimationDone())
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation(this.currentAttackLevel >= 2 ? "Charge 3" : "Charge"); });
    }
  }

  private beingHit() {
    if (this.isAnimationDone())
      PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle Battle"); });
  }

  private refillActionBar() {
    if (this.actionBarGauge === PlayerBehavior.actionGaugeMax || Input.isAction2Down(this.playerIndex)) return;

    let refillSpeed = Input.isAction1Down(this.playerIndex) ? PlayerBehavior.slowActionRefillSpeed : PlayerBehavior.actionRefillSpeed;
    this.actionBarGauge = Math.min(PlayerBehavior.actionGaugeMax, this.actionBarGauge + refillSpeed);
    Utils.setProgressBar(this.actionBarActor, this.actionBarGauge, PlayerBehavior.actionGaugeMax, PlayerBehavior.actionBarSize);
  }

  private startChangeWeapon() {
    let staffCount = 0;
    for (let staff of this.globalData.staffs) if (staff != null) staffCount++;
    
    if (staffCount === 1) {
      // TODO: play some error sound ?
    } else PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Change Weapon", false); });
  }

  private changingWeapon() {
    if (this.isAnimationDone()) {
      if (this.spriteRndrs[0].getPlaybackSpeed() === 1) {
        if (!this.staffRndr.actor.getVisible()) return;

        do {
          this.globalData.activeStaff++;
          if (this.globalData.activeStaff >= this.globalData.staffs.length) this.globalData.activeStaff = 0;
        } while (this.globalData.staffs[this.globalData.activeStaff] == null)

        let staffName = this.globalData.staffs[this.globalData.activeStaff].name;
        this.staffRndr.setSprite(`In-Game/Player/Items/Staffs/${staffName}`).setAnimation("Change Weapon", false);
        this.staffRndr.actor.setVisible(false);

        Sup.setTimeout(100, () => {
          this.staffRndr.actor.setVisible(true);
          PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => {
            spriteRndr.setPlaybackSpeed(-1);
            spriteRndr.playAnimation(false);
          });
        });

      } else {
        PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => {
          spriteRndr.setPlaybackSpeed(1);
          spriteRndr.setAnimation("Idle Battle");
        });
      }
    }
  }

  private attacking() {
    if (!this.hasShot && this.spriteRndrs[0].getAnimationFrameTime() / this.spriteRndrs[0].getAnimationFrameCount() > 0.6) {
      this.hasShot = true;
      this.stopCharging();

      this.actionBarGauge -= PlayerBehavior.actionGaugeMax / this.globalData.attackLevel * this.currentAttackLevel;
      let enemy = Sup.Math.Random.sample(Game.enemies);
      for (let otherEnemy of Game.enemies) {
        if (otherEnemy.health < enemy.health) enemy = otherEnemy;
      }
      if (enemy == null) return;

      let staff = this.globalData.staffs[this.globalData.activeStaff];
      let attackLevel = this.currentAttackLevel;
      let attack = staff.attacks[attackLevel - 1];
      
      if (attack.projectile != null) {
        let spriteRndr = Fx.createProjectile(staff.attacks[attackLevel - 1].projectile, this.position.clone().add(-4, 0.5), enemy.position, 0.3, () => {
          if (!enemy.isDestroyed()) enemy.hit(staff, attackLevel);
        });
        spriteRndr.setHorizontalFlip(true);
      } else if (attack.instant != null) {
        Fx.createInstant(staff.attacks[attackLevel - 1].instant, enemy.position.clone().add(0, 1), () => {
          if (!enemy.isDestroyed()) enemy.hit(staff, attackLevel);
        });
      }

    } else if (this.isAnimationDone()) {
      PlayerBehavior.walkSprites(this.spriteRndrs, (spriteRndr) => { spriteRndr.setAnimation("Idle Battle"); });
    }
  }
}
Sup.registerBehavior(PlayerBehavior);

namespace PlayerBehavior {
  let healthBarSprite = Sup.get("In-Game/Player/HUD/Health/Bar", Sup.Sprite);
  export const healthBarSize = healthBarSprite.getGridSize().width / healthBarSprite.getPixelsPerUnit();
  
  let actionBarSprite = Sup.get("In-Game/Player/HUD/Action/Bar", Sup.Sprite);
  export const actionBarSize = actionBarSprite.getGridSize().width / actionBarSprite.getPixelsPerUnit();
  
  export const actionGaugeMax = 100;
  export const actionRefillSpeed = 2;
  export const slowActionRefillSpeed = 0.2;
  export const actionChargeSpeeds = [2.5, 0.8, 0.3];
  export const actionDefenseDropSpeed = 3;
  
  export const maxAttackLevel = 3;
  export const attackCooldownDuration = 10;
}
