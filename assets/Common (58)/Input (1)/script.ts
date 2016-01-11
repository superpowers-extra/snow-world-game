namespace Input {
  export function wasBackJustPressed() {
    return Sup.Input.wasKeyJustPressed("ESCAPE") || Sup.Input.wasGamepadButtonJustPressed(0, 8);
  }

  export function isAction1Down(player: number) {
    if (player === 0) return Sup.Input.isKeyDown("J") || Sup.Input.isGamepadButtonDown(0, 0);
    else return Sup.Input.isKeyDown("X") || Sup.Input.isGamepadButtonDown(1, 0);
  }
  export function isAction2Down(player: number) {
    if (player === 0) return Sup.Input.isKeyDown("K") || Sup.Input.isGamepadButtonDown(0, 1);
    else return Sup.Input.isKeyDown("C") || Sup.Input.isGamepadButtonDown(1, 1);
  }

  export function wasAction1JustPressed(player: number) {
    if (player === 0) return Sup.Input.wasKeyJustPressed("J") || Sup.Input.wasGamepadButtonJustPressed(0, 0);
    else return Sup.Input.wasKeyJustPressed("X") || Sup.Input.wasGamepadButtonJustPressed(1, 0);
  }
  export function wasAction2JustPressed(player: number) {
    if (player === 0) return Sup.Input.wasKeyJustPressed("K") || Sup.Input.wasGamepadButtonJustPressed(0, 1);
    else return Sup.Input.wasKeyJustPressed("C") || Sup.Input.wasGamepadButtonJustPressed(1, 1);
  }

  export function wasAction1JustReleased(player: number) {
    if (player === 0) return Sup.Input.wasKeyJustReleased("J") || Sup.Input.wasGamepadButtonJustReleased(0, 0);
    else return Sup.Input.wasKeyJustReleased("X") || Sup.Input.wasGamepadButtonJustReleased(1, 0);
  }
  export function wasAction2JustReleased(player: number) {
    if (player === 0) return Sup.Input.wasKeyJustReleased("K") || Sup.Input.wasGamepadButtonJustReleased(0, 1);
    else return Sup.Input.wasKeyJustReleased("C") || Sup.Input.wasGamepadButtonJustReleased(1, 1);
  }
}
