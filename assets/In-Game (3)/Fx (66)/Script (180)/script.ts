namespace Fx {
  export function createProjectile(sprite: string, position: Sup.Math.Vector2, target: Sup.Math.Vector2, speed: number, callback: Function) {
    Sup.Audio.playSound("Sounds/Battle/Cast Spell");
    
    let projectileActor = new Sup.Actor("Projectile");
    new Sup.SpriteRenderer(projectileActor, `In-Game/Fx/Particules/${sprite}`);
    projectileActor.addBehavior(ProjectileBehavior, { position, target, speed, callback });
    return projectileActor.spriteRenderer;
  }
  
  export function createInstant(sprite: string, position: Sup.Math.Vector2, callback: Function) {
    Sup.Audio.playSound("Sounds/Battle/Cast Instant");
    
    let instantActor = new Sup.Actor("Instant");
    new Sup.SpriteRenderer(instantActor, `In-Game/Fx/Particules/${sprite}`).setAnimation("Animation", false);
    instantActor.addBehavior(InstantBehavior, { position, callback });
    return instantActor.spriteRenderer;
  }
  
  export function addSnow(strong: boolean) {
    let snowActor = Sup.appendScene("In-Game/Fx/Snow/Prefab")[0].setLocalZ(9);
    if (strong) {
      snowActor.spriteRenderer
        .setSprite("In-Game/Fx/Snow/2")
        .getUniforms()["speed"].value = 0.5;
    }
    return snowActor;
  }
}