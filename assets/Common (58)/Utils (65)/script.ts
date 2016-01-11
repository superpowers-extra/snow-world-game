declare var window;

namespace Utils {
  export function setProgressBar(actor: Sup.Actor, value: number, max: number, size: number) {
    if (value === 0) actor.setVisible(false);
    else {
      let ratio = value / max;
      actor.setLocalScaleX(ratio);
      actor.setLocalX(-size / 2 * (1 - ratio));
      actor.setVisible(true);
    }
  }

  export function createFloatingText(text: string, position: Sup.Math.Vector2, options: { color?: Sup.Color; icon?: string }) {
    let actor = new Sup.Actor("Damage").setLocalPosition(position).setLocalZ(6).moveLocalX(Sup.Math.Random.float(-0.8, 0.8));
    new Sup.TextRenderer(actor, text, "Common/Digit Font", { color: options.color });
    
    let iconActor: Sup.Actor;
    if (options.icon != null) {
      iconActor = new Sup.Actor("Icon", actor);
      new Sup.SpriteRenderer(iconActor, options.icon);
      iconActor.setLocalX(actor.textRenderer.getFont().getTextWidth(text) / 2 + 0.5);
    }

    new Sup.Tween(actor, { opacity: 1 })
    .to({ opacity: 0 }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .onUpdate((object) => {
      actor.textRenderer.setOpacity(object.opacity);
      actor.moveLocalY(0.04);
      if (iconActor != null) iconActor.spriteRenderer.setOpacity(object.opacity);
    })
    .onComplete(() => { actor.destroy(); }).start();
  }
}
