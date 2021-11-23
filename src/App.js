import './App.css';

import ReactDOM from 'react-dom';
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

function App() {
  return (
    <div className="canvas-container">
      <Canvas fromeloop='demand'>
        <Model url='./model/house.gltf'/>
      </Canvas>
    </div>
  );
}

export default App;
