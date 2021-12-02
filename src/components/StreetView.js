import React, { useEffect, useState, useRef } from "react"
import * as THREE from "three"

import '../App.css';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer()

function StreetView() {
  const [test, setTest] = useState({color: 0x00ff00})

  const mountRef = useRef(null)

  useEffect(() => {
    const mrcurr = mountRef.current
    renderer.setSize(window.innerWidth, window.innerHeight)
    mrcurr.appendChild(renderer.domElement)

    return () => mrcurr.removeChild(renderer.domElement)
  }, [])

  useEffect(() => {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 )
    const material = new THREE.MeshBasicMaterial(test)
    const cube = new THREE.Mesh( geometry, material )

    scene.add( cube )
    camera.position.z = 5

    var animate = function () {
      requestAnimationFrame( animate )
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      renderer.render( scene, camera )
    }

    animate()

    return () => scene.remove(cube)

  }, [test])

  return (
    <div>
      <button
        onClick={() => setTest({color: 0x00fff0})}
        >
        Click me!
      </button>

      <div ref={mountRef}>
      </div>

    </div>
  );
}

export default StreetView;
