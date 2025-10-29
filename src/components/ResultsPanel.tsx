import React from 'react';
import { Brain, TrendingDown, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { DetectionResult } from '../utils/depressionDetection';

interface ResultsPanelProps {
  result: DetectionResult | null;
  remedies: string[];
  isAnalyzing: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  remedies,
  isAnalyzing
}) => {
  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-green-600';
    if (score < 40) return 'text-blue-600';
    if (score < 60) return 'text-yellow-600';
    if (score < 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 20) return 'bg-green-50 border-green-200';
    if (score < 40) return 'bg-blue-50 border-blue-200';
    if (score < 60) return 'bg-yellow-50 border-yellow-200';
    if (score < 80) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score < 20) return 'Very Low Risk';
    if (score < 40) return 'Low Risk';
    if (score < 60) return 'Moderate Risk';
    if (score < 80) return 'High Risk';
    return 'Critical - Seek Help';
  };

  return (
    <div className="space-y-6">
      {isAnalyzing && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-slate-700 text-lg">Analyzing patterns...</p>
          </div>
        </div>
      )}

      {result && (
        <>
          <div className={`rounded-2xl p-8 shadow-lg border-2 ${getScoreBg(result.score)}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className={`w-8 h-8 ${getScoreColor(result.score)}`} />
                <h2 className="text-2xl font-bold text-slate-800">Detection Results</h2>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}%
                </div>
                <div className={`text-sm font-semibold mt-1 ${getScoreColor(result.score)}`}>
                  {getScoreLabel(result.score)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Movement Speed</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${result.indicators.movementSpeed}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600">{result.indicators.movementSpeed.toFixed(0)}%</span>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Energy Level</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${result.indicators.energyLevel}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600">{result.indicators.energyLevel.toFixed(0)}%</span>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Gesture Variety</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${result.indicators.gestureVariety}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600">{result.indicators.gestureVariety.toFixed(0)}%</span>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Confidence</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600">{result.confidence.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {remedies.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
                Recommended Actions
              </h3>
              <ul className="space-y-3">
                {remedies.map((remedy, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-slate-700 bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{remedy}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Disclaimer:</strong> This tool provides preliminary insights based on
                  hand movement patterns. It is not a diagnostic tool and should not replace
                  professional mental health evaluation. Always consult with a qualified healthcare
                  provider for accurate diagnosis and treatment.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
