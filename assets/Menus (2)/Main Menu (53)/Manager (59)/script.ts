class MainMenuManager extends Sup.Behavior {
  awake() {
    Game.setTheme("Menu");
    Fade.start(Fade.Direction.In);

    let logoActor = Sup.getActor("Logo");
    let targetY = logoActor.getLocalY();
    
    new Sup.Tween(logoActor, { offset: targetY - 0.3 })
    .to({ offset: targetY }, 2000).easing(TWEEN.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .repeat(Infinity)
    .onUpdate((object) => {
      logoActor.setLocalY(object.offset);
    }).start();
  }

  update() {
    if (Input.wasAction1JustPressed(0)) {
      if (!Fade.isFading()) Sup.Audio.playSound("Sounds/Menus/Game Start");
      
      Fade.start(Fade.Direction.Out, null, () => {
        Sup.loadScene("Menus/Player Setup/Scene");
      })
      return;
    }
  }
}
Sup.registerBehavior(MainMenuManager);
