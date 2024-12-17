class City {
  static padding = 20;
  static shader;

  constructor(pos, name, cityColor, stars, commits, radius) {
    this.pos = pos
    this.name = name;
    this.stars = stars || 0;
    this.commitCount = commits.length
    this.size = radius;
    this.color = cityColor;
    this.buildings = [];
    this.generateBuildings(commits);
    this.isHovered = false;
  }

  generateBuildings(commits) {
    let sampleRadius = 2;
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i].node;

      const building = new Building(commit, createVector(0, 0));

      const buildingRadius = Math.max(building.box.size.x, building.box.size.y);
      if (buildingRadius > sampleRadius) {
        sampleRadius = buildingRadius;
      }

      this.buildings.push(building);
    }
    sampleRadius *= 1.2;

    const buildingPositions = PoissonDiscSampling.generatePoints(
      sampleRadius,
      createVector(this.size - City.padding, this.size - City.padding),
      commits.length,
      30
    );

    const translateAmount = -this.size / 2;
    const translateVec = createVector(translateAmount, translateAmount);

    for (let i = 0; i < buildingPositions.length; i++) {
      this.buildings[i].pos = p5.Vector.add(buildingPositions[i], translateVec);
    }


    const buildingsLen = this.buildings.length;
    for (let i = buildingPositions.length; i < buildingsLen; i++) {
      this.buildings.pop();
    }
  }

  shaderSetup() {
    shader(City.shader);

    let cityHue = hue(this.color);
    const glowColor = color(
      hue(this.color),
      saturation(this.color),
      this == activeCity ? brightness(this.color) : 50
    );
    const rimColor = activeCity ? [0.8, 0.8, 0.8, 1.0] : [0.4, 0.4, 0.4, 1.0];

    const s = City.shader;
    s.setUniform('uTime', time);
    s.setUniform('uMainColor', glowColor._array);
    s.setUniform('uAlpha', 0.8);
    s.setUniform('uFlickerSpeed', pulseSpeed * map(cityHue, 0, 360, 0.9, 1.1));
    s.setUniform('uRimColor', rimColor);
    s.setUniform('uRimPower', 4.0);
    s.setUniform('uGlowSpeed', 1.0);
    s.setUniform('uGlowDistance', 2.0 / (this.camDistance / 200));
    s.setUniform('uGlitchSpeed', 2.0);
    s.setUniform('uGlitchIntensity', 0.4);
  }

  draw() {
    push();
    translate(this.pos.x, 0, this.pos.y);

    this.shaderSetup();

    // Draw buildings
    for (let building of this.buildings) {
      building.draw();
    }

    // Draw city name
    push();
    translate(0, -2, this.size / 2 + 20);
    rotateX(PI / 2);
    fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.name, 0, 0);
    text(`${this.stars} Stars`, 0, 20);
    pop();

    pop();

    resetShader();
  }
}
