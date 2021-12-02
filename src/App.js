import './App.css';
import Model from './components/Model';
import StreetView from './components/StreetView';

import { useState } from 'react';
import * as THREE from 'three';
import { OrbitControls, Circle } from '@react-three/drei';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

export default function App() {

  const [streetView, setStreetView] = useState(false);

  return (
    <div className="App">
      {streetView ? 
      <Canvas camera={{ fov: 75, position: [0, 50, 100] }}>
        <ambientLight intensity={.5} />
        <directionalLight intensity={.5} position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <Model />
          <Circle rotation={[-Math.PI / 2, 0, 0]} position={[-20, 1.5, 39]} onClick={(e) => console.log('clicked')}>
            <meshPhongMaterial color="white" />
          </Circle>
        </Suspense>
        <OrbitControls />
        <axesHelper args={[100, 100]} />
        <Suspense fallback={null}>
          <StreetView />
        </Suspense>
      </Canvas>
      : 
      <Canvas camera={{ fov: 150, zoom: 1, near: 0.005, far: 1000 }}>
        <Suspense fallback={null}>
        <StreetView />
      </Suspense>
      </Canvas>
      }
    </div>
  )
}