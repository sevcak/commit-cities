let cities = [];

let loading = false;
let rotationY = 0;
const maxCameraHeight = 2000;
let spacing = { building: 6, city: 20 };
let buildingSpacing = 2;
let scale = 6;
const mapSize = 5000;
const halfMapSize = mapSize / 2;
const mapPadding = mapSize * 0.1;
const pulseSpeed = 3.0;

let time = 0;

let cam;

let main_font = {};
let gridTexture;
let gridShader;
let preloadJson;

let skybox;

let downloadedCities = {};

let activeCity;
let activeCommit;
let activeColor;

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

        if (!localStorage.getItem(username)) {
            downloadedCities.users.push(username);
            localStorage.setItem("downloadedCities", JSON.stringify(downloadedCities));
            updateUserSelect();
        }
        localStorage.setItem(username, JSON.stringify(repos));

        localStorage.setItem("lastCityUsername", username);
        document.getElementById("world-label-username").textContent = username;
        document.getElementById("world-label").style = "";
        generateCities(repos);

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
    }

    loading = false;
}

function updateUserSelect() {
    const selectElem = document.getElementById("user-select");
    selectElem.innerHTML = "";

    for (let username of downloadedCities.users) {
        const option = document.createElement("option");
        option.label = username;
        option.innerHTML = username;

        selectElem.appendChild(option);
    }
}

function preloadCities() {
    const downloadedCities = { users: [] };

    console.log(preloadJson);

    for (const [username, repositories] of Object.entries(preloadJson)) {
        console.log(username, repositories);
        localStorage.setItem(username, JSON.stringify(repositories));

        downloadedCities.users.push(username);
    }

    localStorage.setItem("lastCityUsername", downloadedCities.users[0]);

    localStorage.setItem("downloadedCities", JSON.stringify(downloadedCities));
}

function loadCities(username) {
    document.getElementById("world-label-username").textContent = username;
    document.getElementById("world-label").style = "";

    repos = JSON.parse(localStorage.getItem(username));
    generateCities(repos);

    localStorage.setItem("lastCityUsername", username);
}

function generateCities(repos) {
    cities = [];
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

function drawUI() {
    if (activeCity) {
        document.getElementById("city-info").style.setProperty('display', 'block');
    }
}

function openSettings() {
    const settingsElem = document.getElementById("settings");

    settingsElem.style.setProperty("display", "flex");
}

function applySettings() {
    const settingsElem = document.getElementById("settings");

    settingsElem.style.setProperty("display", "none");

    LOCAL_AUTH_TOKEN = document.getElementById("github-api-key").value;
}

function handleCameraMovement() {
    const sensitivity = map(cam.eyeY, 0, -1000, 0.07, 1, true);
    orbitControl(sensitivity, sensitivity, sensitivity);

    cam.eyeX = constrain(cam.eyeX, -halfMapSize, halfMapSize);
    cam.eyeY = constrain(cam.eyeY, -maxCameraHeight, -20);
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

        const commitElem = document.createElement("a");
        commitElem.href = commit.url
        commitElem.target = "_blank";
        commitElem.className = "city-info-commit";

        const idElem = document.createElement("div");
        idElem.className = "commit-id";
        idElem.innerHTML = '#' + commit.oid.substring(0, 7);

        const msgElem = document.createElement("div");
        msgElem.className = "commit-message";
        msgElem.innerHTML = '"' + commit.message + '"';


        const headerElem = document.createElement("div");
        headerElem.className = "commit-header";

        const headerLeft = document.createElement("div");
        headerLeft.className = "commit-header-left";
        headerLeft.appendChild(idElem);
        headerLeft.innerHTML += ' by '

        const usernameElem = document.createElement("div");
        const username = commit.author.user ? commit.author.user.login : commit.author.name;
        usernameElem.innerHTML = username;
        usernameElem.className = "username";
        headerLeft.appendChild(usernameElem);

        headerElem.appendChild(headerLeft);

        const changesElem = document.createElement("div");
        changesElem.className = "commit-changes"
        const additionsElem = document.createElement("div");
        additionsElem.className = "additions";
        additionsElem.innerHTML = "+" + commit.additions;
        changesElem.appendChild(additionsElem);
        const deletionsElem = document.createElement("div");
        deletionsElem.className = "deletions";
        deletionsElem.innerHTML = "-" + commit.deletions;
        changesElem.appendChild(deletionsElem);

        commitElem.appendChild(headerElem);
        commitElem.appendChild(msgElem);
        commitElem.appendChild(changesElem);

        commitElem.addEventListener("mouseenter", (event) => {
            activeCommit = commit;
        })

        commitList.appendChild(commitElem);
    }
}

const zeroPad = (num, places) => String(num).padStart(places, '0');

function preload() {
    main_font.bold = loadFont('./assets/fonts/Roboto/Roboto-Bold.ttf');

    Skybox.shader = loadShader('./assets/shaders/emit.vert', './assets/shaders/emit.frag');

    City.shader = loadShader('./assets/shaders/holo.vert', './assets/shaders/holo.frag');

    Grid.texture = loadImage('./assets/textures/grid.png');

    const opts = 'normalize: true';
    for (let i = 1; i <= 6; i++) {
        Building.smallModels.push(loadModel('./assets/models/building_small_' + zeroPad(i, 2) + '.obj', opts));
    }
    for (let i = 1; i <= 1; i++) {
        const modelData = {
            bottom: loadModel('./assets/models/building_large_' + zeroPad(i, 2) + '_bot.obj', opts),
            mid: loadModel('./assets/models/building_large_' + zeroPad(i, 2) + '_mid.obj', opts),
            top: loadModel('./assets/models/building_large_' + zeroPad(i, 2) + '_top.obj', opts)
        };
        Building.largeModels.push(modelData);
    }

    if (!localStorage.getItem("downloadedCities")) {
        preloadJson = loadJSON("./assets/data/preloadedCities.json", preloadCities)
    }
}

function setup() {
    createCanvas(windowWidth - 4, windowHeight - 4, WEBGL);
    colorMode(HSB);
    noStroke();
    textFont(main_font.bold);

    for (let modelData of Building.largeModels) {
        modelData.bottomHeight = modelData.bottom.calculateBoundingBox().size.y;
        modelData.midHeight = modelData.mid.calculateBoundingBox().size.y;
        modelData.topHeight = modelData.top.calculateBoundingBox().size.y;
    }

    cam = createCamera();

    activeColor = color(0, 0, 100);

    skybox = new Skybox(mapSize * 1.2);
    grid = new Grid();

    let aspect = width / height;
    let fov = 60; // Field of view in degrees
    let near = 1;
    let far = 16000;

    // Convert fov to radians and calculate top and bottom
    let top = near * Math.tan((fov / 2) * (Math.PI / 180));
    let bottom = -top;

    // Calculate left and right based on aspect ratio
    let right = top * aspect;
    let left = -right;

    frustum(left, right, bottom, top, near, far);

    setCamera(cam);
    camera(800, -500, 1000);

    downloadedCities = JSON.parse(localStorage.getItem("downloadedCities"));
    if (!downloadedCities) {
        downloadedCities = { users: [] };
    }
    updateUserSelect();

    const lastCityUsername = localStorage.getItem("lastCityUsername");
    if (lastCityUsername) {
        loadCities(lastCityUsername);
        document.getElementById("user-select").value = lastCityUsername;
    }

    document.getElementById("user-select").addEventListener("change", (event) => {
        loadCities(event.target.value);
    })
}

function draw() {
    time += deltaTime / 1000;

    handleCameraMovement();

    if (activeCity) {
        activeColor = lerpColor(activeColor, activeCity.color, 0.1);
    }

    skybox.draw();

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

    // Lighting

    lightFalloff(
        constrain(((sin(time * pulseSpeed) + 1) / 2), 0.6, 1),
        0.0005 * constrain(((cos(time / pulseSpeed) + 1) / 2), 0.2, 1),
        0
    );

    ambientLight(0, 0, 20);

    // Camera light
    pointLight(activeColor, createVector(cam.eyeX, -1000, cam.eyeZ));
    if (activeCity) {
        // Active city light
        pointLight(activeColor, createVector(activeCity.pos.x, -100, activeCity.pos.y));
    }

    grid.draw();

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
    resizeCanvas(windowWidth, windowHeight);
}

function mouseWheel() {
    return false; // Prevent page scroll
}
