import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import VirtualFittingScene from './components/VirtualFittingScene';
import WebcamStream from './components/WebcamStream';
import './App.css';

function App() {
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [pose, setPose] = useState<poseDetection.Pose | null>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    async function initPoseDetection() {
      await tf.ready();
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
      };
      const detector = await poseDetection.createDetector(model, detectorConfig);
      setDetector(detector);
    }

    initPoseDetection();
  }, []);

  useEffect(() => {
    if (detector && webcamRef.current && isVideoReady) {
      const detectPose = async () => {
        const video = webcamRef.current;
        if (video && video.readyState === 4) {
          try {
            const poses = await detector.estimatePoses(video);
            if (poses.length > 0) {
              setPose(poses[0]);
            }
          } catch (error) {
            console.error("Error estimating poses:", error);
          }
        }
        requestAnimationFrame(detectPose);
      };
      detectPose();
    }
  }, [detector, isVideoReady]);

  return (
    <div className="App">
      <h1>Virtual Fitting Room</h1>
      <div className="content">
        <div className="webcam-container">
          <WebcamStream webcamRef={webcamRef} pose={pose} onVideoReady={() => setIsVideoReady(true)} />
        </div>
        <div className="canvas-container">
          <VRButton />
          <Canvas>
            <XR>
              <Controllers />
              <Hands />
              <VirtualFittingScene pose={pose} />
            </XR>
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default App;