markerRoot1 = new THREE.Group();
scene.add(markerRoot1); // This group gets its position/rotation from the marker

let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
    type : 'pattern',
    patternUrl : "data/hiro.patt",
});

// THIS IS KEY: smoothedControls takes markerRoot1 as its source of tracking data
smoothedControls = new THREEx.ArSmoothedControls(markerRoot1, {
    lerpPosition: 0.8,
    lerpQuaternion: 0.8,
    lerpScale: 1,
});
// And this is also key: Add the smoothedControls' internal 3D group to the scene
scene.add(smoothedControls.object3d);
