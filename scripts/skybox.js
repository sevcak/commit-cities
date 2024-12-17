class Skybox {
  static shader;

  constructor(radius) {
    this.cities = [];
    this.radius = radius;
    this.horizonHeight = 1000;
    const textureHeight = this.horizonHeight / 6;
    this.textureHeight = textureHeight;
    const textureWidth = 1920 * 2;
    this.textureWidth = textureWidth;
    this.buildingRadius = 4;

    const g = createGraphics(textureWidth, textureHeight);

    g.colorMode(HSB);
    g.noStroke();
    g.fill(0, 0, 100);

    const cityRadius = 200;
    const cityPositions = PoissonDiscSampling.generatePoints(
      cityRadius / 2,
      createVector(textureWidth, textureHeight),
      undefined,
      400
    );

    const hueStep = 360 / cityPositions.length;
    let hue = 0;

    const sampleSize = createVector(cityRadius, cityRadius);
    for (let cityPos of cityPositions) {
      const translateVec = createVector(
        cityPos.x - cityRadius / 2,
        cityPos.y - cityRadius / 2
      );

      const buildingPositions = PoissonDiscSampling.generatePoints(
        this.buildingRadius * 1.2,
        sampleSize,
        Math.round(random(4, 100)),
        100
      );

      for (let buildingPos of buildingPositions) {
        buildingPos.x = buildingPos.x + translateVec.x;
        buildingPos.y = buildingPos.y + translateVec.y;
      }

      const city = { hue: hue, buildingPositions: buildingPositions };
      this.cities.push(city);

      hue += hueStep;
    }

    this.graphics = g;

  }

  redrawTexture() {
    this.graphics.clear();

    for (let city of this.cities) {
      this.graphics.fill(
        city.hue,
        60,
        100 * constrain(((sin(time * pulseSpeed * 0.5 + city.hue) + 1) / 2), 0.7, 1)
      );

      for (let buildingPos of city.buildingPositions) {
        this.graphics.square(
          buildingPos.x, buildingPos.y,
          map(buildingPos.y, 0, this.textureHeight, 1, this.buildingRadius)
        );
      }
    }
  }

  draw() {
    this.redrawTexture();

    background(20);

    push();

    translate(
      0,
      map(abs(cam.eyeY), 0, maxCameraHeight / 2, -this.horizonHeight / 16, this.horizonHeight / 2),
      0
    );

    shader(Skybox.shader);
    Skybox.shader.setUniform('uTexture', this.graphics);
    cylinder(
      mapSize * 2,
      map(abs(cam.eyeY), 0, maxCameraHeight / 2, 100, this.horizonHeight, true),
      24, 1,
      false, false);

    pop();
  }
}
