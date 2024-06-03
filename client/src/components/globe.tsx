// src/app/components/Globe.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import atmosphereVertexShader from "../shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "../shaders/atmosphereFragment.glsl";
import gsap from "gsap";
import ChatBox from "./ChatBox";
import getLocation from "./getCurrentLocation";
import locationSVG from "../assets/img/location.svg";
import earthMap from "../assets/img/a.jpg";

const Globe = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: THREE.Mesh }>({}); // To store markers by their ids
  const [chatBox, setChatBox] = useState<{
    position: { x: number; y: number };
    message: string;
  } | null>(null);
  const moveGlobe = useRef(false);
  const isChatBoxOpen = useRef(false);

  useEffect(() => {
    // Create the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Create the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create a sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(5, 50, 50),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          globeTexture: {
            value: new THREE.TextureLoader().load(
              earthMap,
              (texture: THREE.Texture) => {
                console.log("Texture loaded successfully:", texture);
              }
            ),
          },
        },
      })
    );

    // Create a atmosphere
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(5, 50, 50),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      })
    );
    atmosphere.scale.set(1.1, 1.1, 1.1);
    scene.add(atmosphere);

    // handle mouse move
    interface Mouse {
      x: number | undefined;
      y: number | undefined;
    }
    const mouse: Mouse = {
      x: undefined,
      y: undefined,
    };

    window.addEventListener("mousedown", () => {
      if (isChatBoxOpen.current) return;
      moveGlobe.current = true;
    });
    window.addEventListener("mousemove", (event) => {
      if (!moveGlobe.current) return;
      mouse.x = (event.clientX / innerWidth) * 2 - 1;
      mouse.y = (event.clientY / innerWidth) * 2 + 1;
    });
    window.addEventListener("mouseup", () => {
      moveGlobe.current = false;
      mouse.x = undefined;
      mouse.y = undefined;
    });

    const group = new THREE.Group();
    group.add(sphere);
    scene.add(group);

    // adding stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
    });

    const starVertices: number[] = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = -Math.random() * 2000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    camera.position.z = 11;

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      if (mouse.x && mouse.x >= innerWidth / 2) sphere.rotation.y += 0.01;
      if (mouse.x && mouse.x < innerWidth / 2) sphere.rotation.y -= 0.01;
      if (mouse.y && mouse.y >= innerHeight / 2) sphere.rotation.x += 0.01;
      if (mouse.y && mouse.y < innerHeight / 2) sphere.rotation.x -= 0.01;

      if (mouse.x && mouse.y)
        gsap.to(group.rotation, {
          x: -mouse.y * 2,
          y: mouse.x * 2,
          duration: 1,
        });
      Object.values(markersRef.current).forEach((marker) => {
        marker.lookAt(camera.position);
      });
      renderer.render(scene, camera);
    };
    animate();

    // Convert latitude and longitude to 3D coordinates
    function latLongToVector3(lat: number, lon: number, radius: number) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      return new THREE.Vector3(x, y + 0.2, z);
    }

    // Create marker geometry and material
    // const markerGeometry = new THREE.SphereGeometry(0.1, 10, 10);
    // const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // Add marker to the globe
    function addMarker(lat: number, lon: number, id: string) {
      // Load the SVG texture
      const loader = new THREE.TextureLoader();
      loader.load(locationSVG, (texture: THREE.Texture) => {
        const markerMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
        const markerGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);

        const position = latLongToVector3(lat, lon, 5); // Use the same radius as the globe
        marker.position.copy(position);
        marker.name = id; // Assign a unique name to each marker

        marker.rotation.x = Math.PI / 2;
        sphere.add(marker);
        markersRef.current[id] = marker; // Store marker by id
      });
    }
    // Remove marker from the globe
    function removeMarker(id: string) {
      const marker = markersRef.current[id];
      if (marker) {
        sphere.remove(markersRef.current["tokyo"]);
        delete markersRef.current[id];
      }
    }

    // Example of adding and removing markers
    // addMarker(40.7128, -74.006, "nyc"); // New York City

    const fetchLocation = async () => {
      const t = await getLocation();
      console.log(t);
      addMarker(t[0], t[1], "shivansh");
    };
    fetchLocation();

    function get2DPositionFrom3D(object: THREE.Object3D, camera: THREE.Camera) {
      const vector = new THREE.Vector3();
      const canvas = renderer.domElement;

      object.updateMatrixWorld();
      vector.setFromMatrixPosition(object.matrixWorld);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (vector.y * -0.5 + 0.5) * canvas.clientHeight;

      return { x, y };
    }
    const raycaster = new THREE.Raycaster();
    const mouse2 = new THREE.Vector2();
    const onMouseClick = (event: MouseEvent) => {
      event.preventDefault();
      mouse2.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse2.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse2, camera);
      const intersects = raycaster.intersectObjects(
        Object.values(markersRef.current)
      );
      if (intersects.length > 0) {
        const clickedMarker = intersects[0].object as THREE.Mesh;
        openChatBox(clickedMarker);
      }
    };

    window.addEventListener("click", onMouseClick);

    function openChatBox(marker: THREE.Mesh) {
      const position = get2DPositionFrom3D(marker, camera);
      setChatBox({ position, message: `Chat with ${marker.name}` });
      isChatBoxOpen.current = true;
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onMouseClick);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div ref={mountRef} className=" h-screen xl:w-1/2" id="canvasContainer" />

      {chatBox && (
        <ChatBox
          position={chatBox.position}
          chatWith={chatBox.message}
          setChatBox={setChatBox}
          isChatBoxOpen={isChatBoxOpen}
        />
      )}
    </>
  );
};

export default Globe;
