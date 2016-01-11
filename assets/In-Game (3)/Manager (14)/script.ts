class GameManager extends Sup.Behavior {
  private screenShakeTween: Sup.Tween;

  private canLoadNextLevel = false;
  private givingLoots = false;

  private lootActor: Sup.Actor;
  private lootActionsActor: Sup.Actor;
  private lootFadingIn = false;
  private lootFadingOut = false;

  private playerHasSkipped: boolean[];
  
  awake() {
    Game.setTheme("Battle");
    Game.manager = this;
    
    this.lootActor = this.actor.getChild("Loot");
    this.lootActionsActor = this.actor.getChild("Loot Actions");
  }

  update() {
    // if (Input.wasBackJustPressed()) Sup.loadScene("Menus/Main Menu/Scene");
    
    if (!Game.victory) return;
    
    if (this.canLoadNextLevel && Input.wasAction1JustPressed(0)) {
      this.canLoadNextLevel = false;
      this.actor.getChild("Action Background").setVisible(false);
      this.actor.getChild("Continue").setVisible(false);
      if (!Fade.isFading()) Sup.Audio.playSound("Sounds/Menus/Select Mode");
      Fade.start(Fade.Direction.Out, { duration: 2000 }, () => {
        if (AreaMap.currentArea === "Mountain" && AreaMap.playerPlace.childPlaces.length === 1 && AreaMap.playerPlace.childPlaces[0].type === AreaMap.PlaceType.FinalBoss) {
          Sup.loadScene("Cutscenes/Scene");
        } else {
          Sup.loadScene("Area Map/Scene");
        }
      });
      for (let player of Game.players) {
        if (player.health <= 0) player.health = Math.floor(player.maxHealth / 2);
        let direction = -1;
        if (AreaMap.currentArea === "Temple" && AreaMap.playerPlace.type === AreaMap.PlaceType.FinalBoss) direction = 1;
        player.behavior.leaveBattle(direction);
      }
    }

    if (!this.givingLoots) return;    
    if (!this.lootActor.getBehavior(ItemSlideBehavior).isOver) return;
    
    if (this.lootFadingIn) {
      this.lootFadingIn = false;
      this.lootActionsActor.setVisible(true);
      return;
      
    } else if (this.lootFadingOut) {
      this.lootFadingOut = false;
      this.showNextloot();
      return;
    }
    
    for (let i = 0; i < 2; i++) {
      let player = Game.players[i];
      if (player == null || player.health === 0 || this.playerHasSkipped[i]) continue;
      
      let loot = Game.loots[0];
      let item = loot.item;
      let animationTime = player.behavior.actor.getChild("Sprites/Base").spriteRenderer.getAnimationFrameTime();
      if (Input.wasAction1JustPressed(i)) {
        PlayerBehavior.getLoot(i, item);
        
        loot.actor.destroy();
        this.hideLoot();
        
        if (BattleData.isFood(item)) {
          Utils.createFloatingText(`+${item.amount}`, player.behavior.actor.getLocalPosition().toVector2().add(0, 1), { color: new Sup.Color(0xffff00) });
          break;
        }
        
        if (BattleData.isMagic(item)) {
          for (let player of Game.players) player.attackLevel = Math.min(player.attackLevel + 1, PlayerBehavior.maxAttackLevel);
          break;
        }
        
        let spriteRndr: Sup.SpriteRenderer;
        if (BattleData.isWeapon(item)) spriteRndr = player.behavior.actor.getChild("Sprites/Staff").spriteRenderer;  
        else if (BattleData.isShield(item)) spriteRndr = player.behavior.actor.getChild("Sprites/Shield").spriteRenderer;  
        else if (BattleData.isHood(item)) {
          spriteRndr = player.behavior.actor.getChild("Sprites/Hood").spriteRenderer;
          player.behavior.actor.getChild("Sprites/Hair").setVisible(false);

          if (player.protections.helmet != null) {
            let helmetSpriteRndr = player.behavior.actor.getChild("Sprites/Helmet").spriteRenderer;
            PlayerBehavior.equipSprite(i, helmetSpriteRndr);
            helmetSpriteRndr.setAnimation("Idle").setAnimationFrameTime(animationTime);
          }
          
        } else if (BattleData.isHelmet(item)) {
          spriteRndr = player.behavior.actor.getChild("Sprites/Helmet").spriteRenderer;
          player.behavior.actor.getChild("Sprites/Hair").setVisible(false);
          
        } else if (BattleData.isBoots(item)) spriteRndr = player.behavior.actor.getChild("Sprites/Boots").spriteRenderer;  
        else if (BattleData.isCoat(item)) spriteRndr = player.behavior.actor.getChild("Sprites/Coat").spriteRenderer;
        else if (BattleData.isCape(item)) spriteRndr = player.behavior.actor.getChild("Sprites/Cape").spriteRenderer;
        else if (BattleData.isBag(item)) spriteRndr = player.behavior.actor.getChild("Sprites/Bag").spriteRenderer;
        
        PlayerBehavior.equipSprite(i, spriteRndr);
        spriteRndr.setAnimation("Idle").setAnimationFrameTime(animationTime);
        break;

      } else if (Input.wasAction2JustPressed(i) && !BattleData.isMagic(item)) {
        this.playerHasSkipped[i] = true;
        if (this.playerHasSkipped[0] && this.playerHasSkipped[1]) {
          this.hideLoot();
          break;
        } else this.lootActionsActor.getChild(`P${i + 1}`).setVisible(false);          
      }
    }
  }
  
  screenShake(duration: number, intensity: number) {
    if (this.screenShakeTween != null) this.screenShakeTween.stop();

    this.screenShakeTween = new Sup.Tween(this.actor, {}).to({}, duration)
      .onUpdate(() => { this.actor.setLocalPosition(Sup.Math.Random.float(-intensity, intensity), Sup.Math.Random.float(-intensity, intensity)); })
      .onComplete(() => { this.actor.setLocalPosition(0, 0); })
      .start();
  }

  showNextloot() {
    if (Game.loots.length === 0) { this.finishLoot(); return; }
    
    this.givingLoots = true;
    this.actor.getChild("Loot Background").setVisible(true);
    
    let loot = Game.loots[0].item;
    
    this.lootActor.getChild("Name").textRenderer.setText(loot.name);
    this.lootActor.getChild("Icon").spriteRenderer.setSprite(`Shop/Items/${loot.name}`);
    this.lootActor.getChild("Description").textRenderer.setText(loot.description);
    this.lootActor.getBehavior(ItemSlideBehavior).slide(ItemSlideBehavior.Direction.In);
    this.lootFadingIn = true;
    this.lootActor.setVisible(true);
    
    this.playerHasSkipped = [false, false];
    for (let i = 0; i < 2; i++) {
      let player = Game.players[i];
      let lootActionsActor = this.lootActionsActor.getChild(`P${i + 1}`);
      if (player != null && player.health > 0) {
        lootActionsActor.setVisible(true);
        lootActionsActor.getChild("Skip").setVisible(!BattleData.isMagic(loot));
        
        lootActionsActor.getChild("Equip").getChild("Text").textRenderer.setText(BattleData.isFood(loot) ? "Eat" : BattleData.isMagic(loot) ? "Master" : "Equip");
      }
      else {
        lootActionsActor.setVisible(false);
        this.playerHasSkipped[i] = true;
      }
    }
  }

  hideLoot() {
    this.lootActor.getBehavior(ItemSlideBehavior).slide(ItemSlideBehavior.Direction.Out);
    this.lootFadingOut = true;
    this.lootActionsActor.setVisible(false);
    Game.loots.shift();
    if (Game.loots.length === 0) this.finishLoot();
  }

  finishLoot() {
    this.givingLoots = false;
    this.actor.getChild("Loot Background").setVisible(false);
    this.canLoadNextLevel = true;  

    this.actor.getChild("Action Background").setVisible(true);
    this.actor.getChild("Continue").setVisible(true);
  }
}
Sup.registerBehavior(GameManager);
