import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Pose } from '@tensorflow-models/pose-detection';
import * as THREE from 'three';

interface VirtualFittingSceneProps {
  pose: Pose | null;
}

const connections = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle']
];

const VirtualFittingScene: React.FC<VirtualFittingSceneProps> = ({ pose }) => {
  const skeletonRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    // Set up orthographic camera
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    const newCamera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    newCamera.position.set(0, 0, 5);
    
    // Update camera properties instead of copying
    camera.near = newCamera.near;
    camera.far = newCamera.far;
    camera.zoom = newCamera.zoom;
    camera.position.copy(newCamera.position);
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    if (skeletonRef.current) {
      // Clear existing skeleton
      while (skeletonRef.current.children.length) {
        skeletonRef.current.remove(skeletonRef.current.children[0]);
      }
    }
  }, [pose]);

  useFrame(() => {
    if (skeletonRef.current && pose) {
      updateSkeleton(pose, skeletonRef.current);
    }
  });

  const updateSkeleton = (pose: Pose, group: THREE.Group) => {
    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find(kp => kp.name === start);
      const endPoint = pose.keypoints.find(kp => kp.name === end);

      if (startPoint && endPoint) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(startPoint.x / 640 * 10 - 5, -startPoint.y / 480 * 7.5 + 3.75, 0),
          new THREE.Vector3(endPoint.x / 640 * 10 - 5, -endPoint.y / 480 * 7.5 + 3.75, 0)
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(geometry, material);
        group.add(line);
      }
    });

    // Add cubes for each keypoint
    pose.keypoints.forEach(keypoint => {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        keypoint.x / 640 * 10 - 5,
        -keypoint.y / 480 * 7.5 + 3.75,
        0
      );
      group.add(cube);
    });
  };

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <group ref={skeletonRef} />
    </>
  );
};

export default VirtualFittingScene;
