class Grid {
  static texture;

  draw() {
    push();

    rotateX(PI / 2);

    textureMode(NORMAL);
    textureWrap(REPEAT, REPEAT);

    texture(Grid.texture);

    const tilesX = 220;
    const tilesY = 220;
    const planeSize = mapSize * 1.6;

    // Bottom/ground grid
    beginShape();
    vertex(-planeSize, -planeSize, 0, 0);
    vertex(planeSize, -planeSize, tilesX, 0);
    vertex(planeSize, planeSize, tilesX, tilesY);
    vertex(-planeSize, planeSize, 0, tilesY);
    endShape(CLOSE);

    // Top grid
    translate(0, 0, max(500, -cam.eyeY + 100));
    beginShape();
    vertex(-planeSize, -planeSize, 0, 0);
    vertex(planeSize, -planeSize, tilesX, 0);
    vertex(planeSize, planeSize, tilesX, tilesY);
    vertex(-planeSize, planeSize, 0, tilesY);
    endShape(CLOSE);

    pop();
  }
}
