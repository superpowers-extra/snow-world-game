class GameOverManager extends Sup.Behavior {
  awake() {
    Game.setTheme("Menu");
    Fade.start(Fade.Direction.In);
    Sup.Audio.playSound("Sounds/Menus/Game Over");
  }
  
  update() {
    if (Input.wasAction1JustPressed(0)) {
      Fade.start(Fade.Direction.Out, null, () => {
        Sup.loadScene("Menus/Main Menu/Scene");
      });
    }
  }
}
Sup.registerBehavior(GameOverManager);
