import './App.css';
import Model from './components/Model'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

export default function App() {
  return (
    <>
      <Canvas>
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </>
  )
}