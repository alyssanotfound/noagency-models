var container;

var camera, controls, raycaster, renderer;
var canvas;

var scene = new THREE.Scene();
window.scene = scene;

var lighting, ambient, keyLight, fillLight, backLight;

var LoadingTimeStamp = 0;
// var numModels = 13;
var testArray = [];
var storedTexture = [];

window.onload = function() {
    console.log("start onload");
    // console.log("window pixel width: " + window.outerWidth);
    // isMobile = false;
    init();
};

function init() {
    container = document.getElementById('threeD-content');
    
    // container = document.createElement('div');
    // document.body.appendChild(container);
    var ModelCount = document.getElementById("modelCount");
    var LoadCount = document.getElementById("loadCount");

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
    /* Camera */
    // camera = new THREE.OrthographicCamera( window.innerWidth / - 3400, window.innerWidth / 3400,window.innerHeight / 3400, window.innerHeight / - 3400, 1, 500 );
    // // camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    // camera.position.set(0.5,0.1,5);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 2;

    /* Scene */
    lighting = false;

    ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    topLeftLight = new THREE.DirectionalLight("rgb(184,176,149)", 0.9);
    topLeftLight.position.set(-40, 10, 50);
    topLeftLight.target.position.set(0.5,0,1.5);
    topLeftLight.target.updateMatrixWorld();
    topLeftLight.castShadow=true;
    scene.add(topLeftLight);

    frontSecondLight = new THREE.DirectionalLight("rgb(144,86,170)", 0.3);
    frontSecondLight.position.set(0.5, 0, 100);
    frontSecondLight.target.position.set(0.5,0,1.5);
    frontSecondLight.target.updateMatrixWorld();
    frontSecondLight.castShadow=true;
    scene.add(frontSecondLight);

    sunLight = new THREE.SpotLight( 0xffffff, 0, 0, Math.PI/2 );
    sunLight.position.set( 1000, 2000, 1000 );
    sunLight.castShadow = false;
    scene.add(sunLight);

    // spotlightBack = new THREE.SpotLight( "rgb(144,86,170)", 0.5, 156, 0.01, 0.7, 1.6 );
    // spotlightBack.position.set(0.5,0,40);
    // spotlightBack.target.position.set(0.5,0.05,1.5);
    // spotlightBack.target.updateMatrixWorld();
    // spotlightBack.castShadow = false;
    // scene.add( spotlightBack );

    /* Generate 13 busts */
    // var paths = ["01","02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]
    // var paths = ["Eloisa","Giannina", "Kat", "Kristen", "May", "Remy", "Sabrina", "Torraine", "Vera", "Yulu"]
    var paths = ["Eloisa","Giannina", "Kat"]

        .map(function(value) {
            return "assets/" + value + "/";
        });
    j = 0;
    function loadNextPath() {
        var pathToLoad = paths.pop();
        // console.time(pathToLoad);
        // var start = window.performance.now();
        // console.log("start: " + start);
        ModelCount.innerHTML = pathToLoad;
        if (!pathToLoad) {
            console.log("OK THERE SHOULD BE NO ANIMATES BEFORE THIS LINE!");
            animate();
            document.getElementById("loadingOverlay").style.display="none";
            if (currentURL != "") {
                //load specific piece
                var URLbust = 13 - currentURL.substring(4, 6);
                // console.log(currentURL.substring(1, 6));
                console.log("the current URL / model num is: " + URLbust);
                //now rotate busts to proper position
                //then change variable so bustOn will be opened
                // var evenInterval = (360/numModels);
                // targetTheta = theta + (evenInterval*incrementBustMatch[Number(URLbust)]);
                // rotateAligned = true;
                // rotate bust 
                // revolveClicked = true;
                //open layer 2
                // openLayerTwoDelay = true;
                // if (isMobile == true) {
                //     openInfoPanel(currentURL.substring(1, 6));
                // }
            }
        } else {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setBaseUrl(pathToLoad);
            mtlLoader.setPath(pathToLoad);                       
            mtlLoader.load('model_mesh.obj.mtl', function (materials) {

                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(pathToLoad);
                // console.log("loading model");
                objLoader.load('model_mesh.obj', function (obj) {

                    obj.name = pathToLoad.substring(12, 17);
                    var mesh = obj.children[ 0 ]; 
                    mesh.geometry = new THREE.Geometry().fromBufferGeometry( mesh.geometry ); 
                    mesh.geometry.mergeVertices(); 
                    mesh.geometry.computeVertexNormals();
                    testArray.push(obj);
                    storedTexture[j] = obj.children[0].material.map;
                    // console.log(storedTexture[j]);
                    scene.add(obj); 

                    j++; 
                    loadNextPath(); 
                });
            });
            // console.timeEnd(pathToLoad);
            var end = window.performance.now(); 
            // console.log("end: " + end);
            var time = end - LoadingTimeStamp;
            // console.log(time);
            LoadingTimeStamp = end;
            LoadCount.innerHTML = Math.round(time * 100 / 1000) / 100 + " s";
        }
    
    }
    loadNextPath();

    //URL
    currentURL = window.location.hash;

    /* Vectors */
    raycaster = new THREE.Raycaster();

    /* Renderer */
    canvas = document.getElementById("canvasID"); 
    canvas.style.marginLeft = "auto";
    canvas.style.marginRight = "auto";
    canvas.style.display = "block";
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth/2, window.innerHeight/2);
    renderer.setClearColor(new THREE.Color(0xffffff)); //2a6489
    container.appendChild(renderer.domElement);

    /* Events - Desktop Only */
    //for dragging/rotating bust
    // document.getElementById("imgDisplay").onmousedown = function() {mouseDown()};
    // document.getElementById("imgDisplay").onmousemove = function() {mouseMove(event)};
    // document.getElementById("imgDisplay").onclick = function() {mouseDragOff()};
    // document.getElementById("canvasID").onclick = function() {onCanvasClick(event)};
    // document.getElementById("leftblock").onclick = function() {goBackToLayerOne();};
    // document.getElementById("rightblock").onclick = function() {goBackToLayerOne();};
    // document.onkeydown = checkKey;
  
    // var infoPanel = document.getElementById('infoPanel');
    // infoPanel.addEventListener ('click',  function (e) {
    //     console.log("clicked info panel");
    //     e.stopPropagation();
    //     // msg (elem);
    // }, false);

    //info panel
    // document.getElementById("infoButton").onclick = function() {toggleInfoPanel();};
    // var itemBox = document.getElementById('itemBox-bottom');
    // itemBox.addEventListener ('click',  function (e) {
    //     e.stopPropagation();
    //     // msg (elem);
    // }, false);

    // window.onpopstate=function() {
    //     // if (currentURL != "") {
    //         goBackToLayerOne();
    //     // }
    // }
    //stats
    javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.getElementById("stats").appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()   
}

function animate() {
    //console.log('called animate!');
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}