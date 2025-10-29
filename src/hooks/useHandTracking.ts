import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface HandPattern {
  timestamp: number;
  landmarks: any[];
  gestures: string[];
}

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [patterns, setPatterns] = useState<HandPattern[]>([]);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializeHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handLandmarkerRef.current = handLandmarker;
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize hand tracking:', error);
      }
    };

    initializeHandTracking();

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startTracking = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    const detectHands = () => {
      if (!videoRef.current || !handLandmarkerRef.current) return;

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const results = handLandmarkerRef.current.detectForVideo(
          video,
          performance.now()
        );

        if (results.landmarks.length > 0) {
          const pattern: HandPattern = {
            timestamp: Date.now(),
            landmarks: results.landmarks,
            gestures: results.handedness.map(h => h[0].categoryName)
          };

          setPatterns(prev => [...prev.slice(-99), pattern]);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();
  };

  const stopTracking = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resetPatterns = () => {
    setPatterns([]);
  };

  return { isReady, patterns, startTracking, stopTracking, resetPatterns };
};
