'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ======================================================
// ROBOT
// ======================================================

function Robot() {
  const robotRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const headRef = useRef();

  const pointerTarget = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0, scroll: 0 });

  useEffect(() => {
    const handlePointerMove = (event) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;

      pointerTarget.current.x = THREE.MathUtils.clamp(
        (event.clientX / width) * 2 - 1,
        -1,
        1
      );

      pointerTarget.current.y = THREE.MathUtils.clamp(
        -((event.clientY / height) * 2 - 1),
        -1,
        1
      );
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const viewportWidth = window.innerWidth || 1024;
    const viewportHeight = window.innerHeight || 800;
    const isMobile = viewportWidth < 768;

    target.current.x +=
      (pointerTarget.current.x * 0.8 - target.current.x) * 0.035;

    target.current.y +=
      (pointerTarget.current.y * 0.45 - target.current.y) * 0.035;

    const scrollY = window.scrollY || 0;
    const scrollDistance = Math.max(
      viewportHeight * 0.82,
      isMobile ? 520 : 500
    );

    const scrollProgress = THREE.MathUtils.clamp(
      scrollY / scrollDistance,
      0,
      1
    );

    target.current.scroll +=
      (scrollProgress - target.current.scroll) *
      (isMobile ? 0.045 : 0.055);

    const scroll = target.current.scroll;

    if (!robotRef.current) return;

    const floating = Math.sin(time * 0.7) * 0.10;

    const mouseX = target.current.x * 0.35;
    const mouseY = target.current.y * 0.10;

    const scrollDown = scroll * (isMobile ? -7.2 : -6.6);

    const basePositionX = isMobile ? 0 : 3.85;
    const basePositionY = isMobile ? -0.85 : -0.15;

    robotRef.current.position.x = basePositionX + mouseX;
    robotRef.current.position.y =
      basePositionY + floating + mouseY + scrollDown;

    const normalScale = isMobile ? 0.88 : 1.08;
    const currentScale = normalScale * (1 - scroll * 0.12);

    robotRef.current.scale.setScalar(
      Math.max(currentScale, isMobile ? 0.78 : 0.94)
    );

    robotRef.current.rotation.z = Math.sin(time * 0.45) * 0.012;
    robotRef.current.rotation.y = 0;

    // Head follows mouse smoothly.
    const headTargetY = THREE.MathUtils.clamp(
      target.current.x * 0.18,
      -0.18,
      0.18
    );

    const headTargetX = THREE.MathUtils.clamp(
      -target.current.y * 0.075,
      -0.075,
      0.075
    );

    if (headRef.current) {
      headRef.current.rotation.y +=
        (headTargetY - headRef.current.rotation.y) * 0.055;

      headRef.current.rotation.x +=
        (headTargetX - headRef.current.rotation.x) * 0.055;
    }

    // Eyes follow mouse independently, with a very small movement.
    const eyeX = THREE.MathUtils.clamp(
      target.current.x * 0.035,
      -0.035,
      0.035
    );

    const eyeY = THREE.MathUtils.clamp(
      target.current.y * 0.022,
      -0.022,
      0.022
    );

    if (leftEyeRef.current) {
      const targetX = -0.48 + eyeX;

      leftEyeRef.current.position.x +=
        (targetX - leftEyeRef.current.position.x) * 0.10;

      leftEyeRef.current.position.y +=
        (eyeY - leftEyeRef.current.position.y) * 0.10;
    }

    if (rightEyeRef.current) {
      const targetX = 0.48 + eyeX;

      rightEyeRef.current.position.x +=
        (targetX - rightEyeRef.current.position.x) * 0.10;

      rightEyeRef.current.position.y +=
        (eyeY - rightEyeRef.current.position.y) * 0.10;
    }
  });

  return (
    <group ref={robotRef} position={[0, 0, 0]} scale={1.12}>
      <RoundedBox
        args={[2.1, 2.3, 1.25]}
        radius={0.28}
        smoothness={5}
        position={[0, -1.15, 0]}
      >
        <meshStandardMaterial
          color="#78a9d8"
          metalness={0.72}
          roughness={0.24}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.82, 1.95, 0.06]}
        radius={0.22}
        smoothness={5}
        position={[0, -1.15, 0.64]}
      >
        <meshStandardMaterial
          color="#6f9bc7"
          metalness={0.55}
          roughness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.15, 0.7, 0.08]}
        radius={0.12}
        smoothness={4}
        position={[0, -1.05, 0.70]}
      >
        <meshStandardMaterial
          color="#172331"
          metalness={0.55}
          roughness={0.22}
        />
      </RoundedBox>

      <mesh position={[0, -1.05, 0.77]}>
        <boxGeometry args={[0.55, 0.08, 0.025]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>

      <mesh position={[-0.35, -1.22, 0.77]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      <mesh position={[0.35, -1.22, 0.77]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      <group ref={headRef} position={[0, 0.65, 0]}>
        <RoundedBox
          args={[2.35, 1.65, 1.4]}
          radius={0.32}
          smoothness={6}
        >
          <meshStandardMaterial
            color="#78a9d8"
            metalness={0.78}
            roughness={0.20}
          />
        </RoundedBox>

        <RoundedBox
          args={[1.95, 1.22, 0.05]}
          radius={0.25}
          smoothness={5}
          position={[0, 0.05, 0.70]}
        >
          <meshStandardMaterial
            color="#6f9bc7"
            metalness={0.45}
            roughness={0.25}
          />
        </RoundedBox>

        <RoundedBox
          args={[1.85, 0.75, 0.08]}
          radius={0.18}
          smoothness={5}
          position={[0, 0, 0.77]}
        >
          <meshStandardMaterial
            color="#050a10"
            metalness={0.35}
            roughness={0.12}
            transparent={false}
            opacity={1}
            depthWrite
          />
        </RoundedBox>

        <group ref={leftEyeRef} position={[-0.48, 0, 0.88]}>
          <mesh>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshBasicMaterial color="#7dd3fc" />
          </mesh>

          <mesh scale={1.65}>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.10}
              depthWrite={false}
            />
          </mesh>
        </group>

        <group ref={rightEyeRef} position={[0.48, 0, 0.88]}>
          <mesh>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshBasicMaterial color="#7dd3fc" />
          </mesh>

          <mesh scale={1.65}>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.10}
              depthWrite={false}
            />
          </mesh>
        </group>

        <mesh position={[0, -0.28, 0.83]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          <meshBasicMaterial color="#34d399" />
        </mesh>
      </group>

      <group position={[0, 1.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.5, 12]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.85}
            roughness={0.18}
          />
        </mesh>

        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshBasicMaterial color="#fb923c" />
        </mesh>

        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.21, 20, 20]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group position={[-1.35, -1.05, 0]}>
        <RoundedBox
          args={[0.38, 1.25, 0.42]}
          radius={0.15}
          smoothness={4}
          rotation={[0, 0, -0.12]}
        >
          <meshStandardMaterial
            color="#6f9bc7"
            metalness={0.72}
            roughness={0.25}
          />
        </RoundedBox>

        <mesh position={[0, -0.7, 0]}>
          <sphereGeometry args={[0.25, 18, 18]} />
          <meshStandardMaterial
            color="#172331"
            metalness={0.75}
            roughness={0.22}
          />
        </mesh>
      </group>

      <group position={[1.35, -1.05, 0]}>
        <RoundedBox
          args={[0.38, 1.25, 0.42]}
          radius={0.15}
          smoothness={4}
          rotation={[0, 0, 0.12]}
        >
          <meshStandardMaterial
            color="#6f9bc7"
            metalness={0.72}
            roughness={0.25}
          />
        </RoundedBox>

        <mesh position={[0, -0.7, 0]}>
          <sphereGeometry args={[0.25, 18, 18]} />
          <meshStandardMaterial
            color="#172331"
            metalness={0.75}
            roughness={0.22}
          />
        </mesh>
      </group>

      <RoundedBox
        args={[0.55, 0.85, 0.65]}
        radius={0.16}
        smoothness={4}
        position={[-0.48, -2.7, 0]}
      >
        <meshStandardMaterial
          color="#6f9bc7"
          metalness={0.75}
          roughness={0.24}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.55, 0.85, 0.65]}
        radius={0.16}
        smoothness={4}
        position={[0.48, -2.7, 0]}
      >
        <meshStandardMaterial
          color="#6f9bc7"
          metalness={0.75}
          roughness={0.24}
        />
      </RoundedBox>
    </group>
  );
}

// ======================================================
// IoT NETWORK SCATTER
// ======================================================

function IoTScatter() {
  const groupRef = useRef();

  const NETWORK = {
    cyan: '#22D3EE',
    blue: '#38BDF8',
    green: '#34D399',
    violet: '#818CF8',
    amber: '#FBBF24',
  };

  const devices = [
    { type: 'cloud', p: [-5.20, 2.55, -2.9], r: -0.10 },
    { type: 'router', p: [-4.45, 1.05, -2.8], r: 0.14 },
    { type: 'server', p: [-5.00, -0.55, -2.9], r: 0.04 },
    { type: 'wifi', p: [-4.55, -2.20, -2.8], r: 0.12 },

    { type: 'chip', p: [-2.25, 3.20, -3.1], r: 0.16 },
    { type: 'network', p: [-0.25, 3.55, -3.2], r: 0.00 },
    { type: 'wifi', p: [2.05, 3.15, -3.0], r: -0.10 },

    { type: 'router', p: [5.45, 2.25, -2.8], r: -0.12 },
    { type: 'server', p: [5.55, 0.25, -2.9], r: 0.08 },
    { type: 'sensor', p: [5.20, -1.65, -2.8], r: 0.12 },

    { type: 'cloud', p: [3.30, -3.10, -3.0], r: 0.05 },
    { type: 'chip', p: [1.20, -3.35, -3.1], r: -0.18 },
    { type: 'network', p: [-0.95, -3.35, -3.15], r: 0.00 },
    { type: 'sensor', p: [-2.75, -3.05, -3.0], r: -0.10 },
  ];

  const links = [
    [0, 1], [1, 2], [2, 3],
    [0, 4], [4, 5], [5, 6],
    [6, 7], [7, 8], [8, 9],
    [9, 10], [10, 11], [11, 12],
    [12, 13], [13, 3],
    [1, 5], [5, 7],
  ];

  const linePositions = new Float32Array(
    links.flatMap(([a, b]) => [
      ...devices[a].p,
      ...devices[b].p,
    ])
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const mobile = (window.innerWidth || 1024) < 768;

    groupRef.current.position.y =
      Math.sin(t * 0.18) * (mobile ? 0.012 : 0.025);

    groupRef.current.rotation.z =
      Math.sin(t * 0.07) * 0.0025;

    groupRef.current.scale.setScalar(mobile ? 0.64 : 1);
  });

  const NodeDot = ({ color = NETWORK.cyan, pulse = false }) => (
    <mesh>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={pulse ? 0.9 : 0.95}
        depthWrite={false}
      />
    </mesh>
  );

  const NetworkIcon = ({ type }) => {
    switch (type) {
      case 'router':
        return (
          <group>
            <mesh>
              <boxGeometry args={[0.28, 0.12, 0.09]} />
              <meshBasicMaterial
                color={NETWORK.blue}
                transparent
                opacity={0.78}
              />
            </mesh>

            <mesh position={[-0.09, 0.12, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
              <meshBasicMaterial color={NETWORK.cyan} />
            </mesh>

            <mesh position={[0.09, 0.12, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
              <meshBasicMaterial color={NETWORK.cyan} />
            </mesh>

            <NodeDot color={NETWORK.green} pulse />
          </group>
        );

      case 'server':
        return (
          <group>
            <mesh>
              <boxGeometry args={[0.18, 0.30, 0.11]} />
              <meshBasicMaterial
                color={NETWORK.violet}
                transparent
                opacity={0.72}
              />
            </mesh>

            <mesh position={[0, 0.07, 0.06]}>
              <boxGeometry args={[0.10, 0.012, 0.008]} />
              <meshBasicMaterial color={NETWORK.cyan} />
            </mesh>

            <mesh position={[0, -0.07, 0.06]}>
              <boxGeometry args={[0.10, 0.012, 0.008]} />
              <meshBasicMaterial color={NETWORK.green} />
            </mesh>
          </group>
        );

      case 'cloud':
        return (
          <group>
            <mesh position={[-0.07, 0, 0]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshBasicMaterial
                color={NETWORK.cyan}
                transparent
                opacity={0.70}
              />
            </mesh>

            <mesh position={[0.06, 0.025, 0]}>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshBasicMaterial
                color={NETWORK.cyan}
                transparent
                opacity={0.70}
              />
            </mesh>

            <mesh position={[0, -0.045, 0]}>
              <boxGeometry args={[0.18, 0.07, 0.07]} />
              <meshBasicMaterial
                color={NETWORK.cyan}
                transparent
                opacity={0.70}
              />
            </mesh>
          </group>
        );

      case 'wifi':
        return (
          <group rotation={[0, 0, Math.PI]}>
            {[0.07, 0.12, 0.17].map((radius, i) => (
              <mesh key={i} rotation={[0, 0, Math.PI / 4]}>
                <torusGeometry
                  args={[radius, 0.008, 6, 20, Math.PI / 2]}
                />
                <meshBasicMaterial
                  color={NETWORK.green}
                  transparent
                  opacity={0.70 - i * 0.12}
                  depthWrite={false}
                />
              </mesh>
            ))}

            <NodeDot color={NETWORK.green} pulse />
          </group>
        );

      case 'sensor':
        return (
          <group>
            <mesh>
              <boxGeometry args={[0.13, 0.13, 0.09]} />
              <meshBasicMaterial
                color={NETWORK.amber}
                transparent
                opacity={0.78}
              />
            </mesh>

            <mesh position={[0, 0.10, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
              <meshBasicMaterial color={NETWORK.amber} />
            </mesh>

            <NodeDot color={NETWORK.amber} pulse />
          </group>
        );

      case 'chip':
        return (
          <group>
            <mesh>
              <boxGeometry args={[0.18, 0.18, 0.06]} />
              <meshBasicMaterial
                color={NETWORK.violet}
                transparent
                opacity={0.78}
              />
            </mesh>

            {[-0.07, 0, 0.07].map((offset) => (
              <mesh key={`x-${offset}`} position={[offset, 0.12, 0]}>
                <boxGeometry args={[0.018, 0.08, 0.018]} />
                <meshBasicMaterial color={NETWORK.cyan} />
              </mesh>
            ))}

            {[-0.07, 0, 0.07].map((offset) => (
              <mesh key={`y-${offset}`} position={[0.12, offset, 0]}>
                <boxGeometry args={[0.08, 0.018, 0.018]} />
                <meshBasicMaterial color={NETWORK.cyan} />
              </mesh>
            ))}
          </group>
        );

      case 'network':
        return (
          <group>
            <NodeDot color={NETWORK.cyan} pulse />

            {[
              [0.14, 0.10],
              [-0.14, 0.10],
              [0.16, -0.10],
              [-0.16, -0.10],
            ].map(([x, y], i) => (
              <group key={i}>
                <mesh position={[x, y, 0]}>
                  <sphereGeometry args={[0.035, 10, 10]} />
                  <meshBasicMaterial
                    color={
                      i % 2 === 0
                        ? NETWORK.blue
                        : NETWORK.green
                    }
                    transparent
                    opacity={0.85}
                    depthWrite={false}
                  />
                </mesh>

                <mesh
                  position={[x / 2, y / 2, 0]}
                  rotation={[0, 0, Math.atan2(y, x)]}
                >
                  <boxGeometry
                    args={[
                      Math.sqrt(x * x + y * y),
                      0.008,
                      0.008,
                    ]}
                  />
                  <meshBasicMaterial
                    color={NETWORK.blue}
                    transparent
                    opacity={0.45}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );

      default:
        return <NodeDot />;
    }
  };

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={links.length * 2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>

        <lineBasicMaterial
          color={NETWORK.blue}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>

      {devices.map((device, index) => (
        <group
          key={`${device.type}-${index}`}
          position={device.p}
          rotation={[0, 0, device.r]}
        >
          <NetworkIcon type={device.type} />
        </group>
      ))}
    </group>
  );
}

// ======================================================
// FALLBACK
// ======================================================

export function Hero3DFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
    </div>
  );
}

// ======================================================
// HERO 3D
// ======================================================

export default function Hero3D() {
  return (
    <>
      <Canvas
        camera={{
          position: [0, 0, 12],
          fov: 48,
        }}  
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.75]}
        className="!absolute inset-0 pointer-events-none z-10"
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 6, 8]} intensity={2.5} />

        <pointLight
          position={[-4, 2, 5]}
          color="#38bdf8"
          intensity={1.7}
          distance={12}
        />

        <pointLight
          position={[4, -2, 4]}
          color="#34d399"
          intensity={1.0}
          distance={10}
        />

        <group position={[0, 0, -2.2]}>
          <IoTScatter />
        </group>

        <Robot />
      </Canvas>
    </>
  );
}