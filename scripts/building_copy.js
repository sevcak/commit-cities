class Building {
  constructor(commit, pos) {
    this.commit = commit;
    this.pos = pos;
  }
}

class GeneralBuilding01 extends Building {
  static windowWidth = 2;
  static windowHeight = 3;
  static windowGap = 1.2;

  constructor(commit, pos) {
    super(commit, pos);

    this.height = 100;
    this.width = random(20, 40);
    this.depth = random(20, 40);

    // Precalculate window grid
    this.windowGrid = this.calculateWindowGrid();

    // Create a single texture with window pattern
    this.windowTexture = this.createWindowTexture();
  }

  calculateWindowGrid() {
    const wWindowColCount = Math.floor(
      this.width / (GeneralBuilding01.windowWidth + GeneralBuilding01.windowGap)
    );
    const dWindowColCount = Math.floor(
      this.depth / (GeneralBuilding01.windowWidth + GeneralBuilding01.windowGap)
    );
    const windowRowCount = Math.floor(
      this.height / (GeneralBuilding01.windowWidth + GeneralBuilding01.windowGap)
    );

    return { wWindowColCount, dWindowColCount, windowRowCount };
  }

  createWindowTexture() {
    // Create a graphics buffer with a window pattern
    const pg = createGraphics(this.width, this.height);
    pg.background(0);
    pg.fill(255);

    // Draw window pattern once
    for (let row = 0; row < this.windowGrid.windowRowCount; row++) {
      for (let col = 0; col < this.windowGrid.wWindowColCount; col++) {
        pg.rect(
          col * (GeneralBuilding01.windowWidth + GeneralBuilding01.windowGap),
          row * (GeneralBuilding01.windowHeight + GeneralBuilding01.windowGap),
          GeneralBuilding01.windowWidth,
          GeneralBuilding01.windowHeight
        );
      }
    }

    return pg;
  }

  draw() {
    push();

    translate(this.pos.x, -this.height / 2, this.pos.y);

    //this.drawWindows();
    texture(this.windowTexture);

    fill(80);
    box(this.width, this.height, this.depth);

    pop();
  }

  drawWindows() {
    const { wWindowColCount, dWindowColCount, windowRowCount } = this.windowGrid;

    //console.log("Drawing windows:", wWindowColCount, dWindowColCount, windowRowCount);

    push();

    noStroke();

    translate(
      0,
      -this.height / 2 + GeneralBuilding01.windowGap + GeneralBuilding01.windowGap + GeneralBuilding01.windowHeight / 2,
    );

    const verticalOffset = GeneralBuilding01.windowHeight + GeneralBuilding01.windowGap;
    const horizontalOffset = GeneralBuilding01.windowWidth + GeneralBuilding01.windowGap;

    for (let row = 0; row < windowRowCount; row++) {
      // Draw windows along the width wall
      push();
      translate(
        -this.width / 2 + GeneralBuilding01.windowGap + GeneralBuilding01.windowWidth / 2,
        0,
        0
      );
      for (let col = 0; col < wWindowColCount; col++) {
        fill("red");
        box(GeneralBuilding01.windowWidth, GeneralBuilding01.windowHeight, this.depth + 1);
        translate(horizontalOffset, 0, 0);
      }
      pop();

      // Draw windows along the depth wall
      push();
      translate(
        0,
        0,
        -this.depth / 2 + GeneralBuilding01.windowGap + GeneralBuilding01.windowWidth / 2
      );
      for (let col = 0; col < dWindowColCount; col++) {
        fill("red");
        box(this.width + 1, GeneralBuilding01.windowHeight, GeneralBuilding01.windowWidth);
        translate(0, 0, horizontalOffset);
      }
      pop();

      translate(0, verticalOffset, 0);
    }

    pop();
  }
}

class BuildingFactory {
  static largeBuildings = [GeneralBuilding01];
  static smallBuildings = [GeneralBuilding01];

  static createBuilding(commit, pos) {
    const changeCount = commit.additions + commit.deletions;

    let BuildingClass;
    if (changeCount < 20) {
      BuildingClass = random(this.largeBuildings);
    } else {
      BuildingClass = random(this.smallBuildings);
    }

    return new BuildingClass(commit, pos);
  }
}

