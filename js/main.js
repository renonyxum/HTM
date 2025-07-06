var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext, smoothedControls;

var markerRoot1; // markerRoot2 is not used in this example
var glbModel = null; // Variable to hold our loaded GLB model

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();

	let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
	scene.add( ambientLight );
				
	camera = new THREE.Camera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	// Modified arToolkitSource.init to include an error callback
	arToolkitSource.init(function onReady(){
		onResize();
		console.log("AR Toolkit Source (Camera) Ready.");
	}, function onError(error){
		console.error("AR Toolkit Source (Camera) Initialization Error:", error);
		// You can add a message to the user here, e.g.:
		// alert("Failed to access camera. Please ensure permissions are granted and you are using HTTPS.");
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat', // Ensure this path is correct
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
		console.log("AR Toolkit Context Initialized.");
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group();
	scene.add(markerRoot1);
	
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type : 'pattern',
		patternUrl : "data/hiro.patt", // Make sure this points to your Hiro pattern file
	})

	// interpolates from last position to create smoother transitions when moving.
	let smoothedRoot = new THREE.Group();
	scene.add(smoothedRoot);
	smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
		lerpPosition: 0.8,
		lerpQuaternion: 0.8,
		lerpScale: 1,
		// minVisibleDelay: 1,
		// minUnvisibleDelay: 1,
	});

	// --- START GLB MODEL LOADING ---
    const loader = new THREE.GLTFLoader();

    // Corrected path to your GLB file: assets/BOX.glb
    const glbPath = 'assets/BOX.glb'; 

    loader.load(
        glbPath,
        function (gltf) {
            glbModel = gltf.scene;

            // Adjust the scale and position of your GLB model here.
            // These values are crucial for your model to appear correctly.
            // You will likely need to experiment with these values for your specific BOX.glb.
            glbModel.scale.set(0.1, 0.1, 0.1); // Start with a small scale, adjust up if too small
            glbModel.position.y = 0.05; // Adjust Y position to sit on the marker (0.05 is a small lift)
            glbModel.rotation.x = Math.PI / 2; // Common adjustment if model is imported on its side

            smoothedRoot.add(glbModel); // Add the loaded GLB scene to the smoothed group
            console.log('GLB model loaded successfully:', glbModel);
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded GLB');
        },
        // called when loading has errors
        function (error) {
            console.error('An error happened while loading GLB:', error);
            // Check if this error appears in your browser console!
        }
    );
    // --- END GLB MODEL LOADING ---
}


function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
		
	// additional code for smoothed controls
	smoothedControls.update(markerRoot1); // Pass markerRoot1 to smoothedControls
}


function render()
{
	renderer.render( scene, camera );
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
