let scene;
let camera;
let renderer;

let cubeMat;
let entranceMat;
let exitMat;
let controls;
let instructions;
let blocker;

const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _vector = new THREE.Vector3();
const _PI_2 = Math.PI / 2;
const _changeEvent = { type: 'change' };

const velocityScale = 250.0;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const maze = new MazeBuilder(15, 15);

const boxWidth = 10;
const boxHeight = 1.0;

const boxes = []

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = function () {
    instructions = document.getElementById('instructions');
    blocker = document.getElementById('blocker')

    init();
    animate();

    instructions.addEventListener('click', function () {
        controls.lock();
    });

    console.log(maze.maze)
}

function init() {
    initResources();

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);

    renderDefaultComponent();

    let startX = 0;
    let startZ = 0;

    for (var i = 0; i < maze.maze.length; i++) {
        const row = maze.maze[i];
        for (var j = 0; j < row.length; j++) {
            let height = boxHeight;
            let mat = cubeMat;
            let x = i * boxWidth;
            let z = j * boxWidth;

            if (row[j].length == 0) continue;
            if (row[j].includes('entrance')) {
                height *= 10;
                mat = entranceMat;
                x += boxWidth;
            }
            if (row[j].includes('exit')) {
                height *= 10;
                mat = exitMat;
                startX = x;
                startZ = z;
                x -= boxWidth;
            }

            const boxGeometry = new THREE.BoxGeometry(boxWidth, height, boxWidth);
            const boxMesh = new THREE.Mesh(boxGeometry, mat);
            boxMesh.position.set(x, height / 2, z);
            boxMesh.castShadow = true;

            boxWidth_2 = (boxWidth / 2 + 1.0)
            boxes.push([x - boxWidth_2, x + boxWidth_2, z - boxWidth_2, z + boxWidth_2])
            scene.add(boxMesh);
        }
    }
    camera.position.set(startX, 2, startZ);

    controls = new PointerLockControls(camera, document.body);
    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    });
    scene.add(controls.getObject());

    const onKeyDown = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
        }

    };

    const onKeyUp = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function initResources() {
    cubeMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.005,
        metalness: 0.5
    });
    entranceMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0xff0000,
        bumpScale: 0.002,
        metalness: 0.2
    });
    exitMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0x0000ff,
        bumpScale: 0.002,
        metalness: 0.2
    });
}

function renderDefaultComponent() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    scene.add(hemiLightHelper);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(- 1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 50;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
    scene.add(dirLightHelper);


    const groundGeo = new THREE.PlaneGeometry(10000, 10000);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    groundMat.color.setHSL(0.095, 1, 0.75);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = - 33;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const vertexShader = document.getElementById('vertexShader').textContent;
    const fragmentShader = document.getElementById('fragmentShader').textContent;
    const uniforms = {
        'topColor': { value: new THREE.Color(0x0077ff) },
        'bottomColor': { value: new THREE.Color(0xffffff) },
        'offset': { value: 33 },
        'exponent': { value: 0.6 }
    };
    uniforms['topColor'].value.copy(hemiLight.color);

    scene.fog.color.copy(uniforms['bottomColor'].value);

    const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

class PointerLockControls extends THREE.EventDispatcher {
    constructor(camera, domElement) {
        super();

        if (domElement === undefined) {
            console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.');
            domElement = document.body;
        }

        this.domElement = domElement;
        this.isLocked = false; // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians

        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians
        this.pointerSpeed = 1.0;

        const scope = this;

        function onMouseMove(event) {
            if (scope.isLocked === false) return;
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            _euler.setFromQuaternion(camera.quaternion);

            _euler.y -= movementX * 0.002 * scope.pointerSpeed;
            _euler.x -= movementY * 0.002 * scope.pointerSpeed;
            _euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, _euler.x));
            camera.quaternion.setFromEuler(_euler);
            scope.dispatchEvent(_changeEvent);
        }

        function onPointerlockChange() {
            if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
                scope.dispatchEvent(_lockEvent);
                scope.isLocked = true;
            } else {
                scope.dispatchEvent(_unlockEvent);
                scope.isLocked = false;
            }
        }

        function onPointerlockError() {
            console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
        }

        this.connect = function () {
            scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
            scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
            scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);
        };

        this.disconnect = function () {
            scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
            scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
            scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);
        };

        this.dispose = function () {
            this.disconnect();
        };

        this.getObject = function () {
            // retaining this method for backward compatibility
            return camera;
        };

        this.getDirection = function () {
            const direction = new THREE.Vector3(0, 0, - 1);
            return function (v) {
                return v.copy(direction).applyQuaternion(camera.quaternion);
            };
        }();

        function move(v, d) {
            var newPos = camera.position.clone().addScaledVector(v, d);
            for (const box of boxes) {
                if (box[0] <= newPos.x && box[1] >= newPos.x && box[2] <= newPos.z && box[3] >= newPos.z) {
                    return;
                }
            }

            camera.position.addScaledVector(v, d);
        }

        this.moveForward = function (distance) {
            // move forward parallel to the xz-plane
            // assumes camera.up is y-up
            _vector.setFromMatrixColumn(camera.matrix, 0);
            _vector.crossVectors(camera.up, _vector);
            move(_vector, distance);
        };

        this.moveRight = function (distance) {
            _vector.setFromMatrixColumn(camera.matrix, 0);
            move(_vector, distance);
        };

        this.lock = function () {
            this.domElement.requestPointerLock();
        };

        this.unlock = function () {
            scope.domElement.ownerDocument.exitPointerLock();
        };

        this.connect();
    }
}

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();

    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * velocityScale * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * velocityScale * delta;

        moveX = - velocity.x * delta
        moveZ = -velocity.z * delta

        controls.moveRight(moveX);
        controls.moveForward(moveZ);
    }

    prevTime = time;
    renderer.render(scene, camera);
}
