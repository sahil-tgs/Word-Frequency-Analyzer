'use client';

import React, { useState } from 'react';
import { Loader2, Download, BarChart2, Book, Languages, List } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalysisData {
  word_frequency: Record<string, number>;
  statistics: {
    total_words: number;
    unique_words: number;
    avg_word_length: number;
  };
  language: string;
  csv_export: string;
}

const WordFrequencyAnalyzer = () => {
  const [url, setUrl] = useState<string>('');
  const [numResults, setNumResults] = useState<number>(10);
  const [customStopWords, setCustomStopWords] = useState<string>('');
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showGraph, setShowGraph] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          numResults,
          stopWords: customStopWords.split(',').map(word => word.trim()).filter(Boolean)
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to analyze URL. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!results) return;
    
    const blob = new Blob([results.csv_export], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-frequency.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = results?.word_frequency 
    ? Object.entries(results.word_frequency).map(([word, count]) => ({
        word,
        count
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Word Frequency Analyzer
            </h1>
            <p className="mt-2 text-gray-700">
              Analyze word frequencies from any webpage
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder:text-gray-600 text-gray-900"
                required
              />
              <input
                type="number"
                value={numResults}
                onChange={(e) => setNumResults(Number(e.target.value))}
                min="1"
                max="100"
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder:text-gray-600 text-gray-900
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="No. of results"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg
                         hover:bg-orange-600 focus:outline-none focus:ring-2 
                         focus:ring-orange-500 focus:ring-offset-2 
                         disabled:opacity-50 whitespace-nowrap
                         transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Analyzing...
                  </span>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>

            <div>
              <input
                type="text"
                value={customStopWords}
                onChange={(e) => setCustomStopWords(e.target.value)}
                placeholder="Custom stop words (comma-separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder:text-gray-600 text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-700">
                Add custom words to ignore, separated by commas
              </p>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <BarChart2 className="h-5 w-5" />
                    <h3 className="font-semibold">Total Words</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {results.statistics.total_words.toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Book className="h-5 w-5" />
                    <h3 className="font-semibold">Unique Words</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {results.statistics.unique_words.toLocaleString()}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Languages className="h-5 w-5" />
                    <h3 className="font-semibold">Language</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {results.language.toUpperCase()}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Book className="h-5 w-5" />
                    <h3 className="font-semibold">Avg Word Length</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {results.statistics.avg_word_length}
                  </p>
                </div>
              </div>

              {/* Word Frequency Results */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Word Frequency
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowGraph(false)}
                        className={`p-2 rounded-lg ${!showGraph ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowGraph(true)}
                        className={`p-2 rounded-lg ${showGraph ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <BarChart2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm
                             bg-orange-500 text-white rounded-lg hover:bg-orange-600
                             focus:outline-none focus:ring-2 focus:ring-orange-500
                             transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                {/* Toggle between List and Graph view */}
                {!showGraph ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                            Word
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                            Frequency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(results.word_frequency).map(([word, count], index) => (
                          <tr key={word} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {word}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="word"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f97316" /> {/* Changed to match orange theme */}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordFrequencyAnalyzer;