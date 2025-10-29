import React from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const WebcamView: React.FC<WebcamViewProps> = ({
  videoRef,
  isActive,
  onStart,
  onStop
}) => {
  return (
    <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <CameraOff className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg">Camera inactive</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={isActive ? onStop : onStart}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Camera className="w-5 h-5" />
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>
    </div>
  );
};
