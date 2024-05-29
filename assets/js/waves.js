import * as THREE from 'three';

const SEPARATION = 100, AMOUNTX = 15, AMOUNTY = 10;

let camera, scene, renderer;

let particles, count = 0;

let mouseX = 0, mouseY = -500;

let canvas = document.getElementById('landingCanvas')
let canvasHolder = document.getElementById('canvasHolder')
const navbar = document.querySelector('.masthead');

function get_width_and_height() {
    return { width: canvasHolder.offsetWidth, height: canvasHolder.offsetHeight - navbar.offsetHeight };
}

// let windowHalfX = canvasHolder.offsetWidth / 2;
// let windowHalfY = canvasHolder.offsetHeight / 2;

let windowHalfX = get_width_and_height().width / 2;
let windowHalfY = get_width_and_height().height / 2;


// ==============================
// Limit the frame rate

let fps = 40; // Limit to 30 FPS
let previousTime = performance.now();
let interval = 1000 / fps;

// ==============================





init();
animate();

function init() {

    let width = get_width_and_height().width;
    let height = get_width_and_height().height;

    camera = new THREE.PerspectiveCamera( 45, width / height, 1, 5000 );
    camera.position.z = 800;

    scene = new THREE.Scene();

    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array( numParticles * 3 );
    const scales = new Float32Array( numParticles );

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

        for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

            positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
            positions[ i + 1 ] = 0; // y
            positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

            scales[ j ] = 1;

            i += 3;
            j ++;

        }

    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

    const material = new THREE.ShaderMaterial( {

        uniforms: {
            color: { value: new THREE.Color( 0xffffff ) },
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent

    } );

    //

    particles = new THREE.Points( geometry, material );
    scene.add( particles );

    //

    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: false } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );

    canvasHolder.style.touchAction = 'none';
    
    window.addEventListener( 'pointermove', onPointerMove );
    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
    
    windowHalfX = get_width_and_height().width / 2;
    windowHalfY = get_width_and_height().height / 2;

    camera.aspect = get_width_and_height().width / get_width_and_height().height;
    camera.updateProjectionMatrix();

    renderer.setSize( get_width_and_height().width, get_width_and_height().height );
}

//

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    mouseX = windowHalfX - event.clientX;
    // mouseY = windowHalfY - event.clientY;
    // mouseY = event.clientY - windowHalfY;

}


function animate() {

    requestAnimationFrame( animate );

    let now = performance.now();
    let delta = now - previousTime;

    if (delta > interval) {
        previousTime = now - (delta % interval);
        
        render();
    }
}

function render() {

    camera.position.x += ( mouseX/2 - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    camera.lookAt( scene.position );

    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

        for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

            positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) +
                            ( Math.sin( ( iy + count ) * 0.5 ) * 50 );

            scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 20 +
                            ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 20;

            i += 3;
            j ++;

        }

    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    renderer.render( scene, camera );

    count += 0.02;

}