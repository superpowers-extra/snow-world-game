class PlayerSetupManager extends Sup.Behavior {
  playerSelectActors: Sup.Actor[] = [];
  selectedActor: Sup.Actor;
  tween: Sup.Tween;
  
  awake() {
    Game.setTheme("Menu");
    this.playerSelectActors.push(Sup.getActor("1 player"));
    this.playerSelectActors.push(Sup.getActor("2 players"));
    
    Fade.start(Fade.Direction.In);
  }

  update() {
    if (this.selectedActor != null) return;
    
    if (Input.wasAction1JustPressed(0) || Input.wasAction2JustPressed(0)) {
      Sup.Audio.playSound("Sounds/Menus/Select Mode");
      Game.playersCount = Input.wasAction1JustPressed(0) ? 1 : 2;
      
      this.selectedActor = this.playerSelectActors[Game.playersCount - 1];
      this.selectedActor.getChild("Button").destroy();

      let deletedActor = this.playerSelectActors[Game.playersCount % 2];
      deletedActor.destroy();
      
      this.slideSelectedActor();
    }
  }
  
  slideSelectedActor() {
    this.tween = new Sup.Tween(this.selectedActor, { x: this.selectedActor.getLocalX() })
    .to({ x: 0 }, 300)
    .onUpdate((object) => { this.selectedActor.setLocalX(object.x); })
    .onComplete(() => { this.flashSelectedActor(); })
    .start();
  }

  flashSelectedActor() {
    this.tween = new Sup.Tween(this.selectedActor, { scale: 1 })
    .to({ scale: 1.2 }, 300).easing(TWEEN.Easing.Bounce.Out)
    .delay(100)
    .onUpdate((object: { scale: number; }) => {
      this.selectedActor.setLocalScale(object.scale);
      this.selectedActor.spriteRenderer.setColor(object.scale, object.scale, object.scale)
    })
    .onComplete(() => { this.goToIntro(); })
    .start();
  }

  goToIntro() {
    Fade.start(Fade.Direction.Out, { delay: 300 }, () => {
      Game.init();
      Sup.loadScene("Cutscenes/Scene");
    });
  }
}
Sup.registerBehavior(PlayerSetupManager);
