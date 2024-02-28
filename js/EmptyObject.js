export class EmptyObject extends THREE.Group {
  /**
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} startPos where to position object after spawn
   * @param {THREE.Vector3} startScale how to scale object after spawn
   */
  constructor(
    parent,
    startPos = new THREE.Vector3(0, 0, 0),
    startScale = new THREE.Vector3(1, 1, 1)
  ) {
    super();
    this.reposition(startPos);
    this.rescale(startScale);
    this.deg2rad = Math.PI / 180; // This property is located on every object #wastedMemory
    parent.add(this);
  }

  update(deltaTime) {}
  /**
   * @param {THREE.Vector3} point object will be repositioned to new point
   */
  reposition(point) {
    this.position.copy(point);
  }
  /**
   * @param {THREE.Vector3} dimensions object will be rescaled to new dimensions
   */
  rescale(dimensions) {
    this.scale.copy(dimensions);
  }
}
