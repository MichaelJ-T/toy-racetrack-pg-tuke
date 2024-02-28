import { TrackPiece } from "../TrackPiece.js";

export class RightTP extends TrackPiece {
  /**
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} [startPos] where to position object after spawn
   */
  constructor(parent, startPos) {
    let geometry = new THREE.BoxGeometry(1, 0.03, 1);
    let material = new THREE.MeshStandardMaterial({ color: 0x14171c });
    super(geometry, material, parent, startPos);
    this.name = "Right track piece";
    this.loadModel("models/TrackPieces/Right/Right.glb");
    this.loadTextures({
      startFrom: "texture/TrackPieces/Right/",
      autoNames: true,
    });

    let offset = 0.13;
    this.offset = { left: -offset, right: offset };
    this.routePoints = this.routePointsSetting(window.devModeRT);
    this.connections = this.findConnected();
  }

  routePointsSetting(renderPoints) {
    let leftPoints = [
      [this.offset.left, 0, 0.49],
      [this.offset.left + 0.065, 0, this.offset.left + 0.065],
      [0.5, 0, this.offset.left],
    ];
    let rightPoints = [
      [this.offset.right, 0, 0.49],
      [this.offset.right + 0.03, 0, this.offset.right + 0.03],
      [0.5, 0, this.offset.right],
    ];
    return {
      left: this.displayHelperPoints(this, leftPoints, renderPoints, 0xff0000),
      right: this.displayHelperPoints(this, rightPoints, renderPoints),
    };
  }
}
