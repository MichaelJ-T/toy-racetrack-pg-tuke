import { BaseObject } from "./BaseObject.js";
import { StraightTP } from "./TrackPieces/StraightTP.js";
import { RightTP } from "./TrackPieces/RightTP.js";
import { StartTP } from "./TrackPieces/StartTP.js";
import { LeftTP } from "./TrackPieces/LeftTP.js";

export class GridTile extends BaseObject {
  /**
   * @param parent {object} where to attach created object
   * @param {THREE.Vector3} startPos where to position object after spawn
   */
  constructor(parent, startPos) {
    let geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(THREE.MathUtils.degToRad(90));
    let texture = new THREE.TextureLoader().load("./texture/gridTile.png");
    let material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    super(geometry, material, parent, startPos);

    this.adjacentTiles = { left: null, right: null, top: null, bottom: null };
    this.name = "Tile";
  }

  onMouseEnter() {
    this.material.opacity = 20;
  }

  onMouseExit() {
    this.material.opacity = 0.8;
  }

  onToggleVisibility() {
    this.material.opacity = this.material.opacity > 0 ? 0 : 0.8;
  }
  onMouseClick(type = null) {
    if (this.children.length === 0) {
      let objectType = type || window.tile_object_type;
      switch (objectType) {
        case "Straight":
          new StraightTP(this);
          break;
        case "Right":
          new RightTP(this);
          break;
        case "Left":
          new LeftTP(this);
          break;
        case "Start":
          new StartTP(this);
          break;
        default:
          break;
      }
    } else {
      this.children[0].onMouseClick?.();
    }
  }

  killChild(doAfterDeletion) {
    this.remove(this?.children?.[0]);
    if (doAfterDeletion) doAfterDeletion?.();
  }
}
