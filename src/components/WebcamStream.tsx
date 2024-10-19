import React, { useEffect, useRef } from 'react';
import { Pose } from '@tensorflow-models/pose-detection';

interface WebcamStreamProps {
  webcamRef: React.RefObject<HTMLVideoElement>;
  pose: Pose | null;
  onVideoReady: () => void;
}

const WebcamStream: React.FC<WebcamStreamProps> = ({ webcamRef, pose, onVideoReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (webcamRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (webcamRef.current) {
            webcamRef.current.srcObject = stream;
            webcamRef.current.onloadedmetadata = () => {
              webcamRef.current!.play();
              onVideoReady();
            };
          }
        })
        .catch((err) => {
          console.error("Error accessing the webcam", err);
        });
    }
  }, [webcamRef, onVideoReady]);

  useEffect(() => {
    const drawPose = () => {
      const canvas = canvasRef.current;
      const video = webcamRef.current;

      if (canvas && video && pose) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Draw cubes for each keypoint
          pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.3) {
              ctx.fillStyle = 'red';
              ctx.fillRect(keypoint.x - 5, keypoint.y - 5, 10, 10);
            }
          });
        }
      }
      requestAnimationFrame(drawPose);
    };

    drawPose();
  }, [webcamRef, pose]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={webcamRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: 'auto',
          transform: 'scaleX(-1)',
          display: 'none'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          transform: 'scaleX(-1)'
        }}
      />
    </div>
  );
};

export default WebcamStream;