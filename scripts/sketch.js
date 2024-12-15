let cities = [];
let roads = [];
let loading = false;
let rotationY = 0;
let cameraHeight = 800;
let spacing = { building: 6, city: 20 };
let buildingSpacing = 2;
let scale = 6;
const mapSize = 5000;
const halfMapSize = mapSize / 2;
const mapPadding = mapSize * 0.1;

let time = 0;

let cam;

let main_font = {};
let gridTexture;

let activeCity;

async function fetchGitHubData() {
    const username = document.getElementById('username').value;
    if (!username) return;

    loading = true;
    cities = [];

    try {
        let newRepos = await fetch_github_data({
            username: username, repoLimit: 15, commitLimit: 20
        });
        repos = newRepos;
        repos = repos.filter(
            repo => repo.commits && repo.commits.target && repo.commits.target.history.edges.length > 0
        );
        localStorage.setItem("repos", JSON.stringify(repos));

        localStorage.setItem("username", username);
        document.getElementById("world-label-username").textContent = username;
        document.getElementById("world-label").style = "";
        generateCities(repos);

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
    }

    loading = false;
}

function generateCities(repos) {
    let maxCommitCount = 1;
    for (let r of repos) {
        const commitCount = r.commits.target.history.edges.length;
        if (commitCount > maxCommitCount) {
            maxCommitCount = commitCount;
        }
    }
    const sampleRadius = maxCommitCount * 40;

    const cityPositions = PoissonDiscSampling.generatePoints(
        sampleRadius,
        createVector(mapSize - mapPadding * 2, mapSize - mapPadding * 2),
        repos.length,
        4
    );
    const translateVec = createVector(-mapSize / 2, -mapSize / 2);
    const hueStep = 360 / cityPositions.length;
    for (let i = 0, hue = 0; i < cityPositions.length; i++, hue += hueStep) {
        const repo = repos[i];
        const pos = p5.Vector.add(cityPositions[i], translateVec);

        cities.push(new City(
            pos,
            repo.name,
            color(hue, 70, 70),
            repo.stargazerCount,
            repo.commits.target.history.edges,
            sampleRadius
        ));
    }
}

function drawGrid() {
    push();

    rotateX(PI / 2);

    //emissiveMaterial(180, 86, 4);
    textureMode(NORMAL);
    textureWrap(REPEAT, REPEAT);
    texture(gridTexture);

    const tilesX = 220;
    const tilesY = 220;
    const halfPlaneSize = (mapSize * 1.2) / 2;
    const bottomPlaneSize = mapSize;

    // Bottom/ground grid
    beginShape();
    vertex(-bottomPlaneSize, -bottomPlaneSize, 0, 0);
    vertex(bottomPlaneSize, -bottomPlaneSize, tilesX, 0);
    vertex(bottomPlaneSize, bottomPlaneSize, tilesX, tilesY);
    vertex(-bottomPlaneSize, bottomPlaneSize, 0, tilesY);
    endShape(CLOSE);

    // Top grid
    translate(0, 0, max(400, -cam.eyeY + 100));
    beginShape();
    vertex(-halfPlaneSize, -halfPlaneSize, 0, 0);
    vertex(halfPlaneSize, -halfPlaneSize, tilesX, 0);
    vertex(halfPlaneSize, halfPlaneSize, tilesX, tilesY);
    vertex(-halfPlaneSize, halfPlaneSize, 0, tilesY);
    endShape(CLOSE);

    pop();
}

function drawUI() {
    if (activeCity) {
        document.getElementById("city-info").style.setProperty('display', 'block');
    }
}

function handleCameraMovement() {
    const sensitivity = map(cam.eyeY, 0, -1000, 0.07, 1, true);
    orbitControl(sensitivity, sensitivity, sensitivity);

    cam.eyeX = constrain(cam.eyeX, -halfMapSize, halfMapSize);
    cam.eyeY = constrain(cam.eyeY, -2000, -20);
    cam.eyeZ = constrain(cam.eyeZ, -halfMapSize, halfMapSize);
}

function changeActiveCity(city) {
    activeCity = city;

    document.getElementById("city-info-name").innerHTML = city.name;
    document.getElementById("city-info-starcount").innerHTML = "star_count = " + city.stars;

    commitList = document.getElementById("city-info-commits");
    commitList.innerHTML = '';
    for (let building of city.buildings) {
        const commit = building.commit;

        const commitElem = document.createElement("div");
        commitElem.className = "city-info-commit";
        commitElem.innerHTML = '#' + commit.oid.substring(0, 7);

        commitList.appendChild(commitElem);
    }
}

const zeroPad = (num, places) => String(num).padStart(places, '0');

function preload() {
    main_font.bold = loadFont('./assets/fonts/Roboto/Roboto-Bold.ttf');

    City.shader = loadShader('../assets/shaders/holo.vert', '../assets/shaders/holo.frag');
    gridTexture = loadImage('../assets/textures/grid.png');

    const opts = 'normalize: true';
    for (let i = 1; i <= 6; i++) {
        Building.smallModels.push(loadModel('../assets/models/building_small_' + zeroPad(i, 2) + '.obj', opts));
    }
    // Building.smallModels.push(loadModel('../assets/models/building_small_02.obj', opts));
    // Building.smallModels.push(loadModel('../assets/models/building_small_03.obj', opts));
}

function setup() {
    createCanvas(windowWidth - 4, windowHeight - 4, WEBGL);

    colorMode(HSB);
    noStroke();
    textFont(main_font.bold);

    cam = createCamera();

    let aspect = width / height;
    let fov = 60; // Field of view in degrees
    let near = 1;
    let far = 10000;

    // Convert fov to radians and calculate top and bottom
    let top = near * Math.tan((fov / 2) * (Math.PI / 180));
    let bottom = -top;

    // Calculate left and right based on aspect ratio
    let right = top * aspect;
    let left = -right;

    frustum(left, right, bottom, top, near, far);

    setCamera(cam);
    camera(800, -500, 1000);

    repos = localStorage.getItem("repos");
    if (repos) {
        const username = localStorage.getItem("username");
        document.getElementById("world-label-username").textContent = username;
        document.getElementById("world-label").style = "";

        repos = JSON.parse(repos);
        generateCities(repos);
    }
}

function draw() {
    time += deltaTime / 1000;

    background(26);

    handleCameraMovement();

    if (loading) {
        // Draw loading text in 2D
        push();
        fill(255);
        textSize(20);
        textAlign(CENTER);
        text('Loading...', 0, 0);
        pop();
        return;
    }

    // Lightin;
    ambientLight(0, 0, 20);
    //const lightPos = createVector(cam.eyeX, -500, cam.eyeZ);
    const lightColor = activeCity ? activeCity.color : color(0, 0, 100);
    // Camera light
    pointLight(lightColor, createVector(cam.eyeX, -1000, cam.eyeZ));
    if (activeCity) {
        // Active city light
        pointLight(lightColor, createVector(activeCity.pos.x, -100, activeCity.pos.y));
    }

    drawGrid();

    let minDist = 100000;
    let closestCity = activeCity;
    const camVec = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
    for (let city of cities) {
        city.camDistance = p5.Vector.dist(
            createVector(city.pos.x, 0, city.pos.y),
            camVec
        );
        if (city.camDistance < minDist) {
            minDist = city.camDistance;
            closestCity = city;
        }
    }
    if (closestCity != activeCity) {
        changeActiveCity(closestCity);
    }

    for (let city of cities) {
        city.draw();
    }

    // Draw instructions if no cities
    if (cities.length === 0) {
        push();
        fill(255);
        textSize(20);
        textAlign(CENTER);
        rotateX(PI / 2);
        translate(0, -10, 0);
        text('Enter a GitHub username to generate their 3D city network', 0, 0);
        pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 40, windowHeight - 100);
}

function mouseWheel() {
    return false; // Prevent page scroll
}
