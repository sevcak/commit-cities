class PoissonDiscSampling {
  static generatePoints(radius, sampleRegionSize, pointCount, rejectionLimit = 30) {
    const cellSize = radius / Math.sqrt(2);

    const grid = [];
    const colCount = Math.ceil(sampleRegionSize.x / cellSize);
    const rowCount = Math.ceil(sampleRegionSize.y / cellSize);
    for (let y = 0; y < rowCount; y++) {
      grid.push([]);
      for (let x = 0; x < colCount; x++) {
        grid[y].push(0);
      }
    }

    const points = [];
    const spawnPoints = [];

    // spawnPoints.push(createVector(
    //   random(radius, sampleRegionSize.x - radius),
    //   random(radius, sampleRegionSize.y - radius))
    // );
    spawnPoints.push(createVector(sampleRegionSize.x / 2, sampleRegionSize.y / 2));
    while (spawnPoints.length > 0 && points.length < pointCount) {
      const spawnIdx = floor(random(spawnPoints.length));
      const spawnCentre = spawnPoints[spawnIdx];
      let candidateAccepted = false;

      for (let i = 0; i < rejectionLimit; i++) {
        const angle = random() * TWO_PI;
        const dir = createVector(cos(angle), sin(angle));
        const candidate = p5.Vector.add(
          spawnCentre,
          p5.Vector.mult(dir, random(radius, 2 * radius))
        );

        if (this.isValid(candidate, sampleRegionSize, cellSize, radius, points, grid)) {
          points.push(candidate);
          spawnPoints.push(candidate);
          grid[floor(candidate.y / cellSize)][floor(candidate.x / cellSize)] = points.length;
          candidateAccepted = true;
          break;
        }
      }

      if (!candidateAccepted) {
        spawnPoints.splice(spawnIdx, 1);
      }
    }

    return points;
  }

  static isValid(candidate, sampleRegionSize, cellSize, radius, points, grid) {
    if (candidate.x < 0 || candidate.x >= sampleRegionSize.x) {
      return false;
    }
    if (candidate.y < 0 || candidate.y >= sampleRegionSize.y) {
      return false;
    }

    const cellX = floor(candidate.x / cellSize);
    const cellY = floor(candidate.y / cellSize);
    const searchStartX = Math.max(0, cellX - 2);
    const searchEndX = Math.min(cellX + 2, grid[0].length - 1);
    const searchStartY = Math.max(0, cellY - 2);
    const searchEndY = Math.min(cellY + 2, grid.length - 1);
    const radiusSq = radius * radius;

    for (let y = searchStartY; y <= searchEndY; y++) {
      for (let x = searchStartX; x <= searchEndX; x++) {
        const pointIdx = grid[y][x] - 1;

        if (pointIdx != -1) {
          if (p5.Vector.sub(candidate, points[pointIdx]).magSq() < radiusSq) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
