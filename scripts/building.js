class Building {
  static smallModels = [];
  static largeModels = [];
  static largeThreshold = 100;

  constructor(commit, pos) {
    this.commit = commit;
    this.pos = pos;
    this.rotation = random([0, HALF_PI, PI, -HALF_PI]);

    const changeCount = commit.additions + commit.deletions;

    if (changeCount < Building.largeThreshold) {
      this.model = random(Building.smallModels);
      this.box = this.model.calculateBoundingBox();
    } else {
      this.model = random(Building.largeModels);
      this.box = this.model.bottom.calculateBoundingBox();
    }
  }

  draw() {
    push();

    let prevRimPower;
    if (this.commit == activeCommit) {
      prevRimPower = City.shader.uniforms.uRimPower._cachedData;
      City.shader.setUniform('uRimPower', 0.4);
    }

    translate(this.pos.x, 0, this.pos.y);
    rotateY(this.rotation);

    const changeCount = this.commit.additions + this.commit.deletions;
    if (changeCount < Building.largeThreshold) {
      model(this.model);
    } else {
      const levels = round(map(
        changeCount,
        Building.largeThreshold,
        Building.largeThreshold * 20,
        5,
        20,
        true
      ));

      model(this.model.bottom);
      translate(0, -this.model.bottomHeight, 0);

      for (let i = 0; i < levels; i++) {
        model(this.model.mid);
        translate(0, -this.model.midHeight, 0);
      }

      model(this.model.top);
    }

    if (this.commit == activeCommit) {
      City.shader.setUniform('uRimPower', prevRimPower);
    }

    pop();
  }
}

class SmallBuilding01 extends Building {
  static model;

  constructor(commit, pos) {
    super(commit, pos);

    this.model = SmallBuilding01.model
  }
}

