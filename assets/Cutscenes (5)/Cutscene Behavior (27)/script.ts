class CutsceneBehavior extends Sup.Behavior {
  textRenderer: Sup.TextRenderer;
  textOpacityTween: Sup.Tween;
  
  awake() {
    Game.setTheme("Menu");
    
    let isFinalFight = (AreaMap.currentArea === "Mountain" && AreaMap.playerPlace.childPlaces.length === 1 && AreaMap.playerPlace.childPlaces[0].type === AreaMap.PlaceType.FinalBoss);
    let cutsceneName = isFinalFight ? "Final Fight" : AreaMap.currentArea;
    Sup.getActor("Background").spriteRenderer.setSprite(`Cutscenes/${cutsceneName}/Background`);
    
    const texts = {
      "Valley": "Entering the Snow World...",
      "Temple": "The temple, entrance to the Lizard's Den...",
      "Mountain": "The final destination is at the top of the mountain...",
      "Final Fight": "It all ends here."
    };
    
    this.textRenderer = Sup.getActor("Text").textRenderer;
    this.textRenderer.setText(texts[cutsceneName]);
    this.textRenderer.setOpacity(0);
    this.textOpacityTween = new Sup.Tween(this.textRenderer.actor, { opacity: 0 })
      .to({ opacity: 1 }, 500).easing(TWEEN.Easing.Cubic.In)
      .onUpdate((object) => { this.textRenderer.setOpacity(object.opacity); });

    Fade.start(Fade.Direction.In, { duration: 500 }, () => {
      this.textOpacityTween.start();
    });
  }

  update() {
    if (Input.wasAction1JustPressed(0)) {
      Fade.start(Fade.Direction.Out, { duration: 500 }, () => { Sup.loadScene("Area Map/Scene"); });
    }
  }
}
Sup.registerBehavior(CutsceneBehavior);
