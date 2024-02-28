import { EmptyObject } from "./EmptyObject.js";
import { GridTile } from "./GridTile.js";

export class Grid extends EmptyObject {
  /**
   * @param {Number} rowsNum how many rows
   * @param {Number} colsNum how many cols
   */
  constructor(rowsNum, colsNum, parent) {
    super(parent);
    this.name = "Grid";
    this.tiles = [];
    for (let row = 0; row < rowsNum; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < colsNum; col++) {
        this.tiles[row][col] = new GridTile(
          this,
          new THREE.Vector3(row, -1, col)
        );
      }
    }
    for (let row = 0; row < rowsNum; row++) {
      for (let col = 0; col < colsNum; col++) {
        this.tiles[row][col].adjacentTiles.top =
          this.tiles?.[row]?.[col - 1] || null;
        this.tiles[row][col].adjacentTiles.left =
          this.tiles?.[row - 1]?.[col] || null;
        this.tiles[row][col].adjacentTiles.right =
          this.tiles?.[row + 1]?.[col] || null;
        this.tiles[row][col].adjacentTiles.bottom =
          this.tiles?.[row]?.[col + 1] || null;
      }
    }
    this.tiles[1][4].onMouseClick("Start");
    this.tiles[1][3].onMouseClick("Straight");
    this.tiles[1][2].onMouseClick("Straight");
    this.tiles[1][1].onMouseClick("Right");
    this.tiles[2][1].onMouseClick("Straight");
    this.tiles[3][1].onMouseClick("Right");
    this.tiles[3][2].onMouseClick("Straight");
    this.tiles[3][3].onMouseClick("Straight");
    this.tiles[3][4].onMouseClick("Straight");
    this.tiles[3][5].onMouseClick("Right");
    this.tiles[2][5].onMouseClick("Straight");
    this.tiles[1][5].onMouseClick("Right");
  }
}
