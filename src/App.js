import './App.css';
import Model from './components/Model'

import * as THREE from 'three';
import { OrbitControls} from '@react-three/drei';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

export default function App() {

  return (
    <div className="App">
      <Canvas camera={{ fov: 75, position: [0, 50, 100] }}>
        <ambientLight intensity={.5} />
        <directionalLight intensity={.5} position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
        <axesHelper args={[100, 100]} />
      </Canvas>
    </div>
  )
}