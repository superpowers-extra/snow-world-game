class AreaMapManager extends Sup.Behavior {
  private placesRootActor: Sup.Actor;
  private playerActor: Sup.Actor;
  private playerRndrs: Sup.SpriteRenderer[];
  private placeActorsById: { [id: string]: Sup.Actor; } = {};

  private targetPosition: Sup.Math.Vector2;
  private moveSpeed = 0.1;
  private moveVector: Sup.Math.Vector2;
  private moveDelay = 30;
  private startActor: Sup.Actor;

  private cameraActor: Sup.Actor;
  private cameraX: number;

  private activeActionActors: Sup.Actor[] = [];
  
  awake() {
    Game.setTheme("Map");
    this.actor.getChild("Background").spriteRenderer.setSprite(`Areas/${AreaMap.currentArea}/Map/Background`);
    this.actor.getChild("Top").spriteRenderer.setSprite(`Areas/${AreaMap.currentArea}/Map/Top`);
    
    Fade.start(Fade.Direction.In);

    for (let childPlace of AreaMap.playerPlace.childPlaces) childPlace.revealed = true;
    
    this.placesRootActor = Sup.getActor("Places");
    this.makePlaceActor(AreaMap.startPlace);
    
    this.playerActor = Sup.getActor("Player");
    this.playerActor.setLocalPosition(this.placeActorsById[AreaMap.playerPlace.id].getLocalPosition().toVector2());
    this.playerRndrs = [];
    for (let spriteActor of this.playerActor.getChild("Sprites").getChildren()) this.playerRndrs.push(spriteActor.spriteRenderer);
    PlayerBehavior.setupSprites(0, this.playerRndrs);
    PlayerBehavior.walkSprites(this.playerRndrs, (playerRndr) => { playerRndr.setAnimation("Idle"); });
    
    this.startActor = this.playerActor.getChild("Start");
    this.startActor.setVisible(false);
    
    this.cameraActor = Sup.getActor("Camera");
    
    if (AreaMap.currentArea === "Mountain") {
      let snowActor = Fx.addSnow(AreaMap.playerPlace.position.x < AreaMap.finalPlace.position.x / 2);
      snowActor.setParent(this.cameraActor);
    }
    
    this.cameraX = this.playerActor.getLocalX();
    this.cameraActor.setLocalX(this.cameraX);
    
    if (AreaMap.playerPlace.childPlaces.length === 1) {
      this.setTargetPlace(AreaMap.playerPlace.childPlaces[0]);
    } else {
      // Player must choose between two paths
      let currentPlaceActor = this.placeActorsById[AreaMap.playerPlace.id];
      let pos = currentPlaceActor.getLocalPosition().toVector2();

      AreaMap.playerPlace.childPlaces.sort((childPlace) => -childPlace.position.y);
      
      let actionNumber = 1;
      for (let childPlace of AreaMap.playerPlace.childPlaces) {
        let childPlaceActor = this.makePlaceActor(childPlace);
        let actionActor = new Sup.Actor("Action");
        actionActor.setLocalPosition(childPlaceActor.getLocalPosition().toVector2().lerp(pos, 0.5));
        actionActor.setLocalZ(9);
        new Sup.SpriteRenderer(actionActor, `Common/Buttons/${actionNumber} P1`).setAnimation("Animation");
        this.activeActionActors.push(actionActor);

        actionNumber++;
      }
    }
    
    this.makeScenery();
  }

  private makePlaceActor(place: AreaMap.Place) {
    let placeActor = new Sup.Actor("Place", this.placesRootActor);
    this.placeActorsById[place.id] = placeActor;
    
    let spriteName = !place.revealed ? "Unknown" : place.type === AreaMap.PlaceType.FinalBoss ? AreaMap.PlaceType[AreaMap.PlaceType.Boss] : AreaMap.PlaceType[place.type];
    if ((place.type === AreaMap.PlaceType.Encounter || place.type === AreaMap.PlaceType.Boss) && place.enemies == null) {
      spriteName += " (Cleared)";
    }
    new Sup.SpriteRenderer(placeActor, `Area Map/Places/${spriteName}`);
    let pos = place.position.clone().multiplyScalar(AreaMapManager.scale);
    placeActor.setLocalScale(0.5);
    placeActor.setLocalPosition(pos);
    
    if (place.revealed && place.enemies != null) {
      let enemyRootActor = new Sup.Actor("Enemies", placeActor);
      enemyRootActor.setLocalPosition(-3, 1, 6);

      let enemies = place.enemies;
      // Only show boss on Area Map
      if (place.type === AreaMap.PlaceType.Boss || place.type === AreaMap.PlaceType.FinalBoss) enemies = [ place.enemies[0] ];

      let enemyActors: Sup.Actor[] = [];
      for (let enemyName of enemies) {
        let enemyActor = new Sup.Actor("Enemy", enemyRootActor);
        let spritePath = `Areas/${AreaMap.currentArea}/Enemies/${enemyName}`;
        if (enemyName === "Chest") spritePath = "In-Game/Chest";
        new Sup.SpriteRenderer(enemyActor, spritePath);
        enemyActors.push(enemyActor);
      }
      
      if (enemies.length === 2) {
        enemyActors[0].setLocalPosition(1, 1, -0.01);
        enemyActors[1].setLocalPosition(-1, -1, 0.01);
      } else if (enemies.length === 3) {
        enemyActors[0].setLocalPosition(1, 1, -0.01);
        enemyActors[1].setLocalPosition(-1, 0, 0.00);
        enemyActors[2].setLocalPosition(0, -1, 0.01);
      }
    }
    
    for (let childPlace of place.childPlaces) {
      let childPlaceActor = this.makePlaceActor(childPlace);
      let childPos = childPlaceActor.getLocalPosition();
      
      let pathActor = new Sup.Actor("Path", placeActor);
      new Sup.SpriteRenderer(pathActor, "Area Map/Path");
      pathActor.setLocalZ(-0.5);
      pathActor.setLocalEulerZ(pos.angleTo(childPos));
      pathActor.setLocalScaleX(pos.clone().subtract(childPos).length() / 5);
    }
    
    return placeActor;
  }

  private makeScenery() {
    for (let scenery of AreaMap.scenery) {
      let sceneryActor = new Sup.Actor("Scenery");
      sceneryActor.setLocalPosition(scenery.x * AreaMapManager.scale, scenery.y * AreaMapManager.scale, 3 - scenery.y * AreaMapManager.scale * 0.01).setLocalScale(0.5);
      new Sup.SpriteRenderer(sceneryActor, `Areas/${AreaMap.currentArea}/Map/${scenery.type}`);
    }
  }

  private setTargetPlace(place: AreaMap.Place) {
    AreaMap.playerPlace = place;
    
    this.targetPosition = this.placeActorsById[place.id].getLocalPosition().toVector2();
    this.moveVector = this.targetPosition.clone().subtract(this.playerActor.getLocalPosition()).normalize().multiplyScalar(this.moveSpeed);

    for (let actionActor of this.activeActionActors) actionActor.destroy();
    this.activeActionActors.length = 0;
  }
  
  update() {
    if (this.moveDelay > 0) {
      this.moveDelay--;
      return;
    }
    
    if (this.targetPosition != null) {
      let distance = this.targetPosition.distanceTo(this.playerActor.getLocalPosition());
      
      if (distance > this.moveSpeed) {
        PlayerBehavior.walkSprites(this.playerRndrs, (playerRndr) => { playerRndr.setAnimation("Walk"); });
        this.playerActor.moveLocal(this.moveVector);
      } else {
        this.playerActor.setLocalPosition(this.targetPosition);
        PlayerBehavior.walkSprites(this.playerRndrs, (playerRndr) => { playerRndr.setAnimation("Idle"); });
        this.startActor.setVisible(true);
        if (Input.wasAction1JustPressed(0))
          Fade.start(Fade.Direction.Out, null, () => { this.loadPlace(); });
      }

      this.playerActor.setLocalZ(3 - this.playerActor.getLocalY() * 0.01);
      
      this.cameraX = Sup.Math.lerp(this.cameraX, this.playerActor.getLocalX(), 0.1);
      this.cameraActor.setLocalX(this.cameraX);
      return;
    }
    
    if (Input.wasAction1JustPressed(0)) {
      Sup.Audio.playSound("Sounds/Menus/Click");
      this.setTargetPlace(AreaMap.playerPlace.childPlaces[0]);
    } else if (Input.wasAction2JustPressed(0)) {
      Sup.Audio.playSound("Sounds/Menus/Click");
      this.setTargetPlace(AreaMap.playerPlace.childPlaces[1]);
    }
  }

  private loadPlace() {
    switch (AreaMap.playerPlace.type) {
      case AreaMap.PlaceType.Encounter:
      case AreaMap.PlaceType.Boss:
      case AreaMap.PlaceType.FinalBoss:
      case AreaMap.PlaceType.Treasure:
        Game.loadLevel();
        AreaMap.playerPlace.enemies = null;
        break;
      
      case AreaMap.PlaceType.Shop:
        Sup.loadScene("Shop/Scene");
        break;
      
      case AreaMap.PlaceType.Exit:
        let areaNames = Object.keys(Game.areas);
        let nextAreaIndex = areaNames.indexOf(AreaMap.currentArea) + 1;
        if (nextAreaIndex === areaNames.length) Sup.loadScene("End/Scene");
        else {
          AreaMap.generate(areaNames[nextAreaIndex]);
          Sup.loadScene("Cutscenes/Scene")
        }
        break;
    }
  }
}
Sup.registerBehavior(AreaMapManager);

namespace AreaMapManager {
  export const scale = 5;
}