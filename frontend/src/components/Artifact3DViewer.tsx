import { Suspense } from 'react'
import { Bounds, Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

type Artifact3DViewerProps = {
  modelUrl?: string
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url)
  return <primitive object={gltf.scene} />
}

export function Artifact3DViewer({ modelUrl = '/models/demo-antique.glb' }: Artifact3DViewerProps) {
  return (
    <div className="viewer-shell">
      <Canvas camera={{ position: [0, 1.2, 4], fov: 42 }} shadows>
        <color attach="background" args={['#ede7dc']} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 3]} intensity={2.4} castShadow />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.25}>
            <Center>
              <Model url={modelUrl} />
            </Center>
          </Bounds>
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  )
}
