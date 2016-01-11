class ProjectileBehavior extends Sup.Behavior {
  position: Sup.Math.Vector2;
  target: Sup.Math.Vector2;
  movement: Sup.Math.Vector2;
  speed: number;
  callback: Function;

  awake() {
    this.actor.setLocalPosition(this.position).setLocalZ(2);
    this.movement = this.target.clone().subtract(this.position).normalize().multiplyScalar(this.speed);
    
    if (this.actor.spriteRenderer.getSprite().getAnimationList().length === 0) {
      new Sup.Tween(this.actor, { scale: 1 }).to({ scale : 0.7 }, 100).yoyo(true).repeat(Infinity)
        .onUpdate((object) => { this.actor.setLocalScaleY(object.scale); })
        .start();
      
    } else this.actor.spriteRenderer.setAnimation("Animation");
  }

  update() {
    if (this.position.distanceTo(this.target) > this.speed) {
      this.position.add(this.movement);
      this.actor.setLocalPosition(this.position);
      
    } else {
      this.callback();
      this.actor.destroy();
    }
  }
}
Sup.registerBehavior(ProjectileBehavior);

class InstantBehavior extends Sup.Behavior {
  private position: Sup.Math.Vector2;
  private callback: Function;
  private hasShot = false;

  awake() {
    this.actor.setLocalPosition(this.position).setLocalZ(2);
  }

  update() {
    if (!this.actor.spriteRenderer.isAnimationPlaying()) this.actor.destroy();
    else if (!this.hasShot && this.actor.spriteRenderer.getAnimationFrameTime() / this.actor.spriteRenderer.getAnimationFrameCount() > 0.5) {
      this.hasShot = true;
      this.callback();
    }
  }
}
Sup.registerBehavior(InstantBehavior);
