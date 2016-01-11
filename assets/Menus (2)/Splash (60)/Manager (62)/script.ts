class SplashManager extends Sup.Behavior {
  logoRenderer: Sup.SpriteRenderer;

  awake() {
    // Sup.Input.goFullscreen();
    Game.setTheme("Menu");
    Sup.Audio.playSound("Sounds/Menus/Sparkles");
    
    this.logoRenderer = Sup.getActor("Logo").spriteRenderer;

    Fade.start(Fade.Direction.In, { duration: 500 }, () => {
      this.logoRenderer.setAnimation("Animation").playAnimation(false);

      Sup.setTimeout(1000, () => {
        new Sup.Tween(this.logoRenderer.actor, { zoom: 1 })
        .to({ zoom: 2 }, 500)
        .easing(TWEEN.Easing.Cubic.In)
        .onUpdate((object) => { this.logoRenderer.actor.setLocalScale(object.zoom); })
        .start();
        
        Fade.start(Fade.Direction.Out, { duration: 500 }, () => {
          Sup.loadScene("Menus/Main Menu/Scene");
        });
      });
    });
  }
}
Sup.registerBehavior(SplashManager);
