import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Suspense } from 'react'

function Model() {
    const gltf = useLoader(GLTFLoader, '/house.gltf');

    return (
        <Suspense fallback={null}>
            <primitive object={gltf.scene} />
        </Suspense>
    )
}

export default Model
