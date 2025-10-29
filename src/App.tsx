import { useState, useEffect } from 'react';
import { Activity, Save } from 'lucide-react';
import { useWebcam } from './hooks/useWebcam';
import { useHandTracking } from './hooks/useHandTracking';
import { WebcamView } from './components/WebcamView';
import { ResultsPanel } from './components/ResultsPanel';
import { analyzeHandPatterns, getRemedySuggestions, DetectionResult } from './utils/depressionDetection';
import { supabase } from './lib/supabase';

function App() {
  const { videoRef, isActive, error, startWebcam, stopWebcam } = useWebcam();
  const { isReady, patterns, startTracking, stopTracking, resetPatterns } = useHandTracking(videoRef);

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [remedies, setRemedies] = useState<string[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (isActive && isReady) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isActive, isReady]);

  const handleStartDetection = async () => {
    await startWebcam();
    setIsDetecting(true);
    setSessionStartTime(Date.now());
    resetPatterns();
    setDetectionResult(null);
    setRemedies([]);
    setSavedMessage('');
  };

  const handleStopDetection = () => {
    setIsAnalyzing(true);
    stopWebcam();
    stopTracking();
    setIsDetecting(false);

    setTimeout(() => {
      const result = analyzeHandPatterns(patterns);
      const suggestions = getRemedySuggestions(result.score);

      setDetectionResult(result);
      setRemedies(suggestions);
      setIsAnalyzing(false);

      saveSessionToDatabase(result, suggestions);
    }, 1000);
  };

  const saveSessionToDatabase = async (result: DetectionResult, suggestions: string[]) => {
    try {
      const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;

      const { error } = await supabase.from('detection_sessions').insert({
        depression_score: result.score,
        detected_patterns: patterns.slice(-20),
        remedy_suggestions: suggestions,
        session_duration: duration
      });

      if (error) {
        console.error('Error saving session:', error);
      } else {
        setSavedMessage('Session saved successfully');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  const getStatusText = () => {
    if (isAnalyzing) return 'Analyzing...';
    if (isDetecting) return `Detecting - ${patterns.length} patterns captured`;
    if (detectionResult) return 'Analysis Complete';
    return 'Ready to Start';
  };

  const getStatusColor = () => {
    if (isAnalyzing) return 'text-yellow-600';
    if (isDetecting) return 'text-green-600';
    if (detectionResult) return 'text-blue-600';
    return 'text-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Activity className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">
              Depression Detection System
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            AI-powered analysis using hand gesture patterns
          </p>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {savedMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{savedMessage}</p>
          </div>
        )}

        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className={`font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            {!isDetecting && !isAnalyzing && (
              <button
                onClick={handleStartDetection}
                disabled={!isReady}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Detection
              </button>
            )}
            {isDetecting && (
              <button
                onClick={handleStopDetection}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                Stop & Analyze
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="lg:sticky lg:top-8 h-fit">
            <WebcamView
              videoRef={videoRef}
              isActive={isActive}
              onStart={startWebcam}
              onStop={stopWebcam}
            />

            {isDetecting && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-slate-800 mb-2">Instructions:</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Perform natural hand gestures and movements</li>
                  <li>• Try various signs and expressions</li>
                  <li>• Continue for at least 15-20 seconds</li>
                  <li>• System analyzes movement speed, variety, and energy</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <ResultsPanel
              result={detectionResult}
              remedies={remedies}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>
            This system uses computer vision and machine learning to analyze hand movement patterns.
            Results are for informational purposes only and do not constitute medical advice.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
