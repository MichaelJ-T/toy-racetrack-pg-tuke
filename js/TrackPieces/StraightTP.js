import { TrackPiece } from "../TrackPiece.js";

export class StraightTP extends TrackPiece {
  /**
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} startPos where to position object after spawn
   */
  constructor(parent, startPos) {
    let geometry = new THREE.BoxGeometry(1, 0.03, 1);
    let material = new THREE.MeshStandardMaterial({ color: 0x14171c });
    super(geometry, material, parent, startPos);
    this.name = "Straight track piece";
    this.loadModel("models/TrackPieces/Straight/Straight.glb");
    this.loadTextures({
      startFrom: "texture/TrackPieces/Straight/",
      autoNames: true,
    });

    let offset = 0.13;
    this.offset = { left: offset, right: -offset };
    this.routePoints = this.routePointsSetting(window.devModeRT);
    this.connections = this.findConnected();
  }

  routePointsSetting(renderPoints) {
    let leftPoints = [
      [this.offset.left, 0, -0.49],
      [this.offset.left, 0, 0],
      [this.offset.left, 0, 0.5],
    ];
    let rightPoints = [
      [this.offset.right, 0, -0.49],
      [this.offset.right, 0, 0],
      [this.offset.right, 0, 0.5],
    ];
    return {
      left: this.displayHelperPoints(this, leftPoints, renderPoints, 0xff0000),
      right: this.displayHelperPoints(this, rightPoints, renderPoints),
    };
  }
}
