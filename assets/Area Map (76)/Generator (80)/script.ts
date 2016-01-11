namespace AreaMap {
  export let currentArea: string;
  
  export enum PlaceType {
    Start,
    Encounter,
    Boss,
    FinalBoss,
    Treasure,
    Shop,
    Exit
  }
  
  export interface Place {
    id: number;
    position: Sup.Math.Vector2;
    childPlaces: Place[];
    type: PlaceType;
    enemies: string[];
    revealed: boolean;
  }

  enum BranchType {
    TwoEquivalentEncounters,
    TwoOptionalEncounters,
    TwoVersusOneEncounters,

    OptionalEncounterWithReward,
    OptionalBoss
  }

  export let startPlace: Place;
  export let finalPlace: Place;
  export let playerPlace: Place;
  
  export interface Scenery {
    x: number;
    y: number;
    type: string;
  }

  export let scenery: Scenery[];
  
  export function generate(area: string) {
    AreaMap.currentArea = area;

    // Used to create the tutorial as the first encounter
    let mustPlaceTutorial = area === Object.keys(Game.areas)[0];
    
    // We'll remove groups from this list as they are picked
    let availableEncounterGroups = Game.areas[currentArea].encounterGroups.slice(0);
    let availableTreasureGroups = Game.areas[currentArea].treasureGroups.slice(0);
    let availableBossGroups = Game.areas[currentArea].bossGroups.slice(0);
    let finalBossGroup = Game.areas[currentArea].finalBossGroup;
    
    // Used to guarantee we don't chain branches
    let singleBranchesInARow = 0;
    
    // Used to guarantee we don't chain bosses or rewards
    let lastBossPlacesAgo = 0;
    let lastRewardPlacesAgo = 0;

    // Used to guarantee there are no more than 4 bosses
    let randomBosses = 0;
    const maxRandomBosses = 3; // + 1 for the final boss = 4

    // Used to guarantee there will be a shop
    let hasGeneratedShop = false;
    const mustHaveShopBefore = 3;

    // Progress
    let progress = 0;
    const total = 6;
    let nextPlaceId = 1;
    
    function generateBranch(parentPlaces: Place[]) {
      let singlePlace = true;
      // We can only branch out if we're on the main path
      if (parentPlaces.length === 1) {
        if(Sup.Math.Random.integer(0, 2) === 0 || singleBranchesInARow >= 4) singlePlace = false;
      }
      
      if (singlePlace) {
        // Generate a single place
        singleBranchesInARow++;

        let placeType: PlaceType;
        if (!hasGeneratedShop && progress >= mustHaveShopBefore) {
          placeType = PlaceType.Shop;
        } else {
          let availablePlaceTypes = [ PlaceType.Encounter ];
          if (lastBossPlacesAgo > 1 && randomBosses < maxRandomBosses) availablePlaceTypes.push(PlaceType.Boss);
          if (lastRewardPlacesAgo > 1) availablePlaceTypes.push(PlaceType.Treasure, PlaceType.Shop);
          placeType = Sup.Math.Random.sample(availablePlaceTypes);
        }
        
        if (placeType === PlaceType.Boss) {
          lastBossPlacesAgo = 0;
          randomBosses++;
        } else lastBossPlacesAgo++;
        
        if (placeType === PlaceType.Treasure || placeType === PlaceType.Shop) lastRewardPlacesAgo = 0;
        else lastRewardPlacesAgo++;
        
        if (placeType == PlaceType.Shop) hasGeneratedShop = true;
        
        let dir = Sup.Math.Random.integer(0, 1) === 0 ? -1 : 1;
        return [ makePlace(placeType, parentPlaces, { y: dir * Sup.Math.Random.integer(0, 1) / 2 }) ];
      }
      
      // Generate a branch
      singleBranchesInARow = 0;

      let availableBranches = [ BranchType.TwoEquivalentEncounters, BranchType.TwoOptionalEncounters, BranchType.TwoVersusOneEncounters ];
      
      if (lastRewardPlacesAgo > 0) availableBranches.push(BranchType.OptionalEncounterWithReward);
      if (lastBossPlacesAgo > 1 && randomBosses < maxRandomBosses) availableBranches.push(BranchType.OptionalBoss);
      
      let branchType = Sup.Math.Random.sample(availableBranches);
      switch (branchType) {
        case BranchType.TwoEquivalentEncounters: {
          lastRewardPlacesAgo++;
          lastBossPlacesAgo++;

          return [
            makePlace(PlaceType.Encounter, parentPlaces, { y: -1 }),
            makePlace(PlaceType.Encounter, parentPlaces, { y: 1 })
          ];
        }
        
        case BranchType.OptionalEncounterWithReward: {
          let dir = Sup.Math.Random.integer(0, 1) === 0 ? -1 : 1;
          let encounter = makePlace(PlaceType.Encounter, parentPlaces, { y: dir * Sup.Math.Random.integer(2, 3) / 3 });
          
          let rewardType = Sup.Math.Random.sample([ PlaceType.Treasure, PlaceType.Shop ]);
          let reward = makePlace(rewardType, [ encounter ], { y: dir * Sup.Math.Random.integer(2, 3) / 3 });

          if (rewardType == PlaceType.Shop) hasGeneratedShop = true;
          lastBossPlacesAgo += 2;
          lastRewardPlacesAgo = 0;

          return parentPlaces.concat([ reward ]);
        }
          
        case BranchType.TwoOptionalEncounters: {
          let dir = Sup.Math.Random.integer(0, 1) === 0 ? -1 : 1;
          let encounter1 = makePlace(PlaceType.Encounter, parentPlaces, { y: dir * Sup.Math.Random.integer(2, 3) / 3 });
          let encounter2 = makePlace(PlaceType.Encounter, [ encounter1 ], { y: dir * Sup.Math.Random.integer(2, 3) / 3 });

          lastRewardPlacesAgo += 2;
          lastBossPlacesAgo += 2;

          return parentPlaces.concat([ encounter2 ]);
        }
          
        case BranchType.TwoVersusOneEncounters: {
          let dir = Sup.Math.Random.integer(0, 1) === 0 ? -1 : 1;
          let encounterA1 = makePlace(PlaceType.Encounter, parentPlaces, { xOffset: 1, y: dir * Sup.Math.Random.integer(2, 3) / 3 });
          let encounterA2 = makePlace(PlaceType.Encounter, [ encounterA1 ], { xOffset: 1, y: dir * Sup.Math.Random.integer(2, 3) / 3 });
          
          let encounterB = makePlace(PlaceType.Encounter, parentPlaces, { y: -dir * Sup.Math.Random.integer(2, 3) / 3 });

          lastRewardPlacesAgo += 2;
          lastBossPlacesAgo += 2;

          return [ encounterA2, encounterB ];
        }
          
        case BranchType.OptionalBoss: {
          let dir = Sup.Math.Random.integer(0, 1) === 0 ? -1 : 1;
          let boss = makePlace(PlaceType.Boss, parentPlaces, { y: dir * Sup.Math.Random.integer(2, 3) / 3 });
          
          lastBossPlacesAgo = 0;
          randomBosses++;
          
          return parentPlaces.concat([ boss ]);
        }
      }
    }
    
    function makePlace(type: PlaceType, parentPlaces: Place[], options?: { xOffset?: number; y?: number; }) {
      if (options == null) options = {};
      
      if (options.xOffset == null) {
        options.xOffset = 1;
        if (Sup.Math.Random.integer(0, 2) === 0) options.xOffset = Sup.Math.Random.integer(4, 6) / 4;
      }
      let x = 0;
      for (let parentPlace of parentPlaces) x = Math.min(parentPlace.position.x, x);
      x -= options.xOffset;
      
      if (options.y == null) options.y = 0;
      
      let place: Place = {
        id: nextPlaceId++,
        position: new Sup.Math.Vector2(x, options.y),
        childPlaces: [], type,
        enemies: null, revealed: false
      };
      
      if (type === PlaceType.Encounter) {
        if (mustPlaceTutorial) {
          mustPlaceTutorial = false;
          place.enemies = [ "Tutorial" ];
        } else {
          let encounterIndex = Sup.Math.Random.integer(0, availableEncounterGroups.length - 1);
          place.enemies = availableEncounterGroups[encounterIndex];
          availableEncounterGroups.splice(encounterIndex, 1);
        }
      } else if (type === PlaceType.Treasure) {
          let treasureIndex = Sup.Math.Random.integer(0, availableTreasureGroups.length - 1);
          place.enemies = availableTreasureGroups[treasureIndex];
          availableTreasureGroups.splice(treasureIndex, 1);
      } else if (type === PlaceType.Boss) {
        let bossIndex = Sup.Math.Random.integer(0, availableBossGroups.length - 1);
        place.enemies = availableBossGroups[bossIndex];
        availableBossGroups.splice(bossIndex, 1);
      } else if (type === PlaceType.FinalBoss) place.enemies = finalBossGroup;
      
      for (let parentPlace of parentPlaces) parentPlace.childPlaces.push(place);
      return place;
    }

    startPlace = playerPlace = {
      id: 0,
      position: new Sup.Math.Vector2(0, 0),
      childPlaces: [], type: PlaceType.Start,
      enemies: null, revealed: true
    };

    let firstEncounter = makePlace(PlaceType.Encounter, [ startPlace ]);
    
    
    let currentPlaces = [ firstEncounter ];
    for (progress = 0; progress < total; progress++) {
      currentPlaces = generateBranch(currentPlaces);
    }
    
    // Final boss and exit
    let finalBoss = makePlace(PlaceType.FinalBoss, currentPlaces);
    finalPlace = makePlace(PlaceType.Exit, [ finalBoss ]);
    
    generateScenery();
  }
  
  function generateScenery() {
    scenery = [];
    
    const spacing = 0.5;
    const sceneryTypes = [ "Tree", "Tree Triple" ];
    const possibleYs = [ -1, -0.5, 0, 0.5, 1 ];
    
    let x = 0;
    while(x > AreaMap.finalPlace.position.x) {
      x -= spacing;
      
      for (let y of possibleYs) {
        if (Sup.Math.Random.integer(0, 2) !== 0) continue;
        if (!canPlaceSceneryAt({ x, y })) continue;
          
        let type = Sup.Math.Random.sample(sceneryTypes);
        scenery.push({ x, y, type });
      }
    }
  }
  
  function canPlaceSceneryAt(pos: Sup.Math.XY) {
    const minDistance = 0.6;
    
    function recurse(place: Place) {
      if (place.position.distanceTo(pos) < minDistance) return false;
      
      for (let childPlace of place.childPlaces) {
        let progress = (pos.x - place.position.x) / (childPlace.position.x - place.position.x);
        if (progress > 0 && progress < 1) {
          let pathPos = place.position.clone().lerp(childPlace.position, progress);
          if (pathPos.distanceTo(pos) < minDistance) return false;
        }
        
        if (!recurse(childPlace)) return false;
      }
      
      return true;
    }
    
    return recurse(startPlace);
  }
}

