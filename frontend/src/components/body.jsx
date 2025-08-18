import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Outlet } from "react-router-dom"; // <-- import Outlet

function RotatingEarth() {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={new THREE.TextureLoader().load(
          "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg"
        )}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

export default function Body() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left side: Earth + Stars */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "50vw", // half viewport width
          height: "100vh",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <Canvas
          style={{ width: "100%", height: "100%", background: "#000" }}
          camera={{ position: [0, 0, 5] }}
          gl={{ alpha: false }} // disables transparency, so background color is solid
        >
          <Stars radius={300} depth={60} count={2000} factor={7} fade />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <RotatingEarth />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* Right side: Dynamic form via Outlet */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "50vw",
          height: "100vh",
          backgroundColor: "#000",
          padding: "2rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          boxSizing: "border-box",
          color: "white",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            width: "100%", // full width of the right side
            maxWidth: 400, // max width for form container
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem", // spacing between inputs
          }}
        >
          <Outlet /> {/* Render Signup or Login here based on route */}
        </div>
      </div>
    </div>
  );
}
