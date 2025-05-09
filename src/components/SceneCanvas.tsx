import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Model = ({
  path,
  position,
}: {
  path: string;
  position: THREE.Vector3;
}) => {
  const { scene } = useGLTF(path);
  const [clickableObjects, setClickableObjects] = useState<THREE.Mesh[]>([]);
  const selectedColorRef = useRef<string>("#ff0000");

  useEffect(() => {
    scene.position.copy(position);
    scene.scale.set(0.1, 0.1, 0.1);
    const objects: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) {
          mesh.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        }
        objects.push(mesh);
      }
    });
    setClickableObjects(objects);
  }, [scene, position]);

  const { camera, gl } = useThree();
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        const color = new THREE.Color(selectedColorRef.current);
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.color.set(color));
        } else {
          (obj.material as THREE.Material & { color?: THREE.Color }).color?.set(
            color
          );
        }
      }
    };

    gl.domElement.addEventListener("click", onClick);
    return () => gl.domElement.removeEventListener("click", onClick);
  }, [camera, gl, clickableObjects]);

  return <primitive object={scene} />;
};

export const SceneCanvas = () => {
  const [color, setColor] = useState("#ff0000");
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <label htmlFor="colorPicker">Escolha uma cor:</label>
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            (window as any).selectedColor = e.target.value;
          }}
        />
      </div>
      <Canvas camera={{ position: [0, 10, 25], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 7.5]} intensity={1} />
        <directionalLight position={[-5, -10, -7.5]} intensity={0.5} />
        <Model
          path="/models/maxilla.glb"
          position={new THREE.Vector3(0, 5, 0)}
        />
        <Model
          path="/models/mandibula.glb"
          position={new THREE.Vector3(0, -5, 0)}
        />
        <OrbitControls />
      </Canvas>
    </>
  );
};
