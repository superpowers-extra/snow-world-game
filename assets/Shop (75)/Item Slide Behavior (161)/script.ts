class ItemSlideBehavior extends Sup.Behavior {
  private direction = ItemSlideBehavior.Direction.None;
  private timer = 0;
  isOver = true;

  slide(direction: ItemSlideBehavior.Direction) {
    if (direction !== ItemSlideBehavior.Direction.None) {
      Sup.Audio.playSound("Sounds/Battle/Woosh");
    }
    
    this.direction = direction;
    this.timer = 0;
    this.isOver = false;
  }

  update() {
    if (this.direction === ItemSlideBehavior.Direction.None) return;

    this.timer = Math.min(this.timer + 1, ItemSlideBehavior.duration);
    
    let progress = this.timer / ItemSlideBehavior.duration;
    if (progress === 1) this.isOver = true;

    let x: number;
    let scaleX: number;
    let scaleY: number;
    if (this.direction === ItemSlideBehavior.Direction.In) {
      progress = TWEEN.Easing.Back.Out(progress);
      x = Sup.Math.lerp(-ItemSlideBehavior.distance, 0, progress);
      scaleX = Sup.Math.lerp(2, 1, progress);
      scaleY = Sup.Math.lerp(0.5, 1, progress);
    } else {
      progress = TWEEN.Easing.Cubic.In(progress);
      x = Sup.Math.lerp(0, ItemSlideBehavior.distance, progress);
      scaleX = Sup.Math.lerp(1, 2, progress);
      scaleY = Sup.Math.lerp(1, 0.5, progress);
    }
    
    this.actor.setLocalScaleX(scaleX);
    this.actor.setLocalScaleY(scaleY);
    this.actor.setLocalX(x);
  }
}
Sup.registerBehavior(ItemSlideBehavior);

namespace ItemSlideBehavior {
  export const distance = 40;
  export const duration = 0.5 * 60;
  
  export enum Direction { None, In, Out };
}
