class ShopManager extends Sup.Behavior {
  private saleStatusRenderer: Sup.TextRenderer;

  // Welcome
  private welcomed = false;

  // Sale start and end
  private saleStartCountdown = ShopManager.startCountdownDuration;
  private saleEndCountdown = 0;

  // Sale
  private itemActor: Sup.Actor;
  private items: BattleData.Item[];
  private currentItemIndex = 0;
  private currentPrice: number;
  private itemDisplayCoutdown = ShopManager.itemDisplayDuration;
  private saleCountdownRenderer: Sup.TextRenderer;

  private itemNameActor: Sup.Actor;
  private itemDescriptionActor: Sup.Actor;
  private itemPriceActor: Sup.Actor;
  
  awake() {
    Game.setTheme("Shop");
    
    this.items = [];
    let availableItems = Object.keys(BattleData.items);
    for (let i = 0; i < Sup.Math.Random.integer(2, 4); i++) {
      let itemIndex = Sup.Math.Random.integer(0, availableItems.length - 1);
      this.items.push(BattleData.items[availableItems[itemIndex]]);
      availableItems.splice(itemIndex, 1);
    }
    
    this.saleStatusRenderer = Sup.getActor("Sale Status").textRenderer;
    this.saleCountdownRenderer = Sup.getActor("Countdown").textRenderer;
    this.itemActor = Sup.getActor("Item");
    this.itemNameActor = Sup.getActor("Tag").getChild("Name").setVisible(false);
    this.itemDescriptionActor = Sup.getActor("Tag").getChild("Description").setVisible(false);
    this.itemPriceActor = Sup.getActor("Tag").getChild("Price").setVisible(false);

    Sup.getActor("P1").getChild("Gold Amount").textRenderer.setText(Game.players[0].gold);
    Utils.setProgressBar(Sup.getActor("P1").getChild("Health/Bar"), Game.players[0].health, Game.players[0].maxHealth, PlayerBehavior.healthBarSize);

    if (Game.playersCount === 1) {
      Sup.getActor("P2").destroy();
      Sup.getActor("P1").textRenderer.setText("");
      Sup.getActor("P1").moveLocalX(-1);
    } else {
      Sup.getActor("P2").getChild("Gold Amount").textRenderer.setText(Game.players[1].gold);
      Utils.setProgressBar(Sup.getActor("P2").getChild("Health/Bar"), Game.players[1].health, Game.players[1].maxHealth, PlayerBehavior.healthBarSize);
    }
    
    Fade.start(Fade.Direction.In);
    
    let keeper = Sup.getActor("Keeper");
    let keeperX = keeper.getLocalX();
    new Sup.Tween(keeper, { x: keeperX - 20 })
    .to({ x: keeperX }, 300)
    .easing(TWEEN.Easing.Circular.Out)
    .onUpdate((object) => { keeper.setLocalX(object.x); })
    .start();
  }

  start() {
    this.saleStatusRenderer.setText(`Sale 1 / ${this.items.length}`);
  }

  update() {
    // Welcome
    if (!this.welcomed) {
      if (Input.wasAction1JustPressed(0)) {
        Sup.Audio.playSound("Sounds/Menus/Click");
        Sup.getActor("Welcome").setVisible(false);
        Sup.getActor("Tag").setVisible(true);
        Sup.getActor("Sale Status").setVisible(true);
        this.welcomed = true;
      }
      return;
    }
    
    // Shop end
    if (this.currentItemIndex === this.items.length) {
      if (this.itemActor.getBehavior(ItemSlideBehavior).isOver) Fade.start(Fade.Direction.Out, null, () => { Sup.loadScene("Area Map/Scene"); });
      return;
    }
    
    // Sale end
    if (this.saleEndCountdown > 0) {
      this.saleEndCountdown--;
      
      if (this.saleEndCountdown === 0) {
        this.saleStatusRenderer.setText(`Sale ${this.currentItemIndex + 1} / ${this.items.length}`);
      }
      return;
    }
    
    // Sale start
    if (this.saleStartCountdown > 0) { this.startSale(); return; }
    
    // Sale
    this.itemDisplayCoutdown--;
    
    if (this.itemDisplayCoutdown <= 0) {
      this.saleStatusRenderer.setText(Sup.Math.Random.sample(ShopManager.tooLateTexts));
      this.endSale();
      return;
    }
    
    let seconds = Math.floor(this.itemDisplayCoutdown / Sup.Game.getFPS()).toString();
    if (seconds.length < 2) seconds = `0${seconds}`;
    let hundredths = Math.floor(this.itemDisplayCoutdown % Sup.Game.getFPS() / Sup.Game.getFPS() * 100).toString();
    if (hundredths.length < 2) hundredths = `0${hundredths}`;
    this.saleCountdownRenderer.setText(`${seconds}:${hundredths}`);
    
    for (let i = 0; i < Game.playersCount; i++) {
      if (Input.wasAction1JustPressed(i)) {
        if (Game.players[i].gold >= this.currentPrice) {
          
          Game.players[i].gold -= this.currentPrice;
          Sup.getActor(`P${i + 1}`).getChild("Gold Amount").textRenderer.setText(Game.players[i].gold);
          Utils.createFloatingText(`-${this.currentPrice}`, this.itemActor.getPosition().toVector2(), { color: new Sup.Color(0xffff44), icon: "Common/Gold" });
          
          PlayerBehavior.getLoot(i, this.items[this.currentItemIndex]);
          Sup.Audio.playSound("Sounds/Shop/Buy Item");
          this.saleStatusRenderer.setText(Sup.Math.Random.sample(ShopManager.boughtTexts));

        } else {
          this.saleStatusRenderer.setText(Sup.Math.Random.sample(ShopManager.tooExpensiveTexts));
        }
        this.endSale();
        return;
      }
    }
  }

  private startSale() {
    this.saleStartCountdown--;
      
    let introStep = ShopManager.startSteps[ShopManager.startSteps.length - 1 - Math.floor(this.saleStartCountdown / Sup.Game.getFPS())];
    this.saleCountdownRenderer.setText(introStep);

    if (this.saleStartCountdown === 0) {
      let currentItem = this.items[this.currentItemIndex];
      let min: number;
      let max: number;
      switch (currentItem.type) {
        case BattleData.ItemTypes.Weapon:
          min = 300;
          max = 1200;
          break;

        default:
          min = 50;
          max = 500;
          break;
      }
      this.currentPrice = Sup.Math.Random.integer(min, max);

      this.itemActor.spriteRenderer.setSprite(`Shop/Items/${currentItem.name}`);
      this.itemActor.setVisible(true).getBehavior(ItemSlideBehavior).slide(ItemSlideBehavior.Direction.In);
      
      this.itemNameActor.setVisible(true).textRenderer.setText(currentItem.name);
      this.itemDescriptionActor.setVisible(true).textRenderer.setText(currentItem.description);
      this.itemPriceActor.setVisible(true).textRenderer.setText(this.currentPrice);
      
      Sup.getActor("Sale").setVisible(true);
      this.saleStatusRenderer.setText("Offer ends in");
    }
  }

  private endSale() {
    this.itemActor.getBehavior(ItemSlideBehavior).slide(ItemSlideBehavior.Direction.Out);
    this.itemNameActor.setVisible(false);
    this.itemDescriptionActor.setVisible(false);
    this.itemPriceActor.setVisible(false);

    this.currentItemIndex++;
    this.itemDisplayCoutdown = ShopManager.itemDisplayDuration;
    this.saleStartCountdown = ShopManager.startCountdownDuration;
    this.saleEndCountdown = ShopManager.startCountdownDuration;
    Sup.getActor("Sale").setVisible(false);
    this.saleCountdownRenderer.setText("");
  }
}
Sup.registerBehavior(ShopManager);

namespace ShopManager {
  export const startCountdownDuration = 2 * 60;
  export const startSteps = [ "Ready.", "Set." ];
  
  export const itemDisplayDuration = 5 * 60;
  
  export const tooLateTexts = [ "Too late!", "It's OVER!", "Time's up!", "Your loss!" ];
  export const boughtTexts = [ "What a deal!", "It's a steal!", "Thank YOU!" ];
  export const tooExpensiveTexts = [ "You don't\nhave enough.", "Come back\nwhen you have\nthe money!" ];
}
