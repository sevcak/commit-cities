class Building {
  static smallModels = [];
  static largeModels = [];

  constructor(commit, pos) {
    this.commit = commit;
    this.pos = pos;
    this.rotation = random([0, HALF_PI, PI, -HALF_PI]);

    const changeCount = commit.additions + commit.deletions;

    if (changeCount < 20) {

      this.model = random(Building.smallModels);
    } else {
      this.model = random(Building.smallModels);
    }

    this.box = this.model.calculateBoundingBox();
  }

  draw() {
    push();

    translate(this.pos.x, 0, this.pos.y);
    rotateY(this.rotation);
    model(this.model);

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

