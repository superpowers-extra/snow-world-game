class TutorialEnemyBehavior extends EnemyBehavior {
  wasHit = false;
  hasAttacked = false;
  attackCooldown = 0;
  
  start() {
    if (Game.playersCount === 1) {
      Sup.getActor("Attack Tutorial").getChild("Buttons P1").setLocalX(0);
      Sup.getActor("Attack Tutorial").getChild("Buttons P2").destroy();
      Sup.getActor("Defend Tutorial").getChild("Buttons P1").setLocalX(0);
      Sup.getActor("Defend Tutorial").getChild("Buttons P2").destroy();
    }
    
    Sup.setTimeout(300, () => {
      Sup.getActor("Action Background").setVisible(true);
      Sup.getActor("Attack Tutorial").setVisible(true);
    });
  }

  scheduleAttack() { /* Nothing */ }

  update() {
    if (this.wasHit && Game.players[0].behavior.isDefending && this.attackCooldown === 0) {
      if (!this.hasAttacked) {
        this.hasAttacked = true;
        Sup.setTimeout(500, () => {
          Sup.getActor("Defend Tutorial").setVisible(false);
          Sup.getActor("Action Background").setVisible(Sup.getActor("Continue").getVisible());
        });
      }
      
      this.doAttack();
      
      this.attackCooldown = TutorialEnemyBehavior.attackCooldownDuration;
    }
    
    if (this.attackCooldown > 0) this.attackCooldown--;
  }
  
  hit(weapon: BattleData.WeaponItem, attackLevel: number) {
    if (this.health === 0) return;

    let damage = !this.wasHit || this.hasAttacked ? 10 : 0;
    
    if (!this.wasHit) {
      this.wasHit = true;
      Sup.getActor("Attack Tutorial").setVisible(false);
      Sup.getActor("Defend Tutorial").setVisible(true);
    }

    this.applyDamage(damage);
  }
}
Sup.registerBehavior(TutorialEnemyBehavior);

namespace TutorialEnemyBehavior {
  export const attackCooldownDuration = 60;
}