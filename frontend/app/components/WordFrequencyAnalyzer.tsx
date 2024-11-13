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

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, bgColor, textColor, iconColor }) => (
  <div className={`${bgColor} p-4 rounded-lg`} role="status">
    <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
      {icon}
      <h3 className="font-semibold">{title}</h3>
    </div>
    <p className={`text-2xl font-bold ${textColor}`}>
      {value}
    </p>
  </div>
);

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

  const sortedWordFrequencies = results 
    ? Object.entries(results.word_frequency)
        .sort((a, b) => b[1] - a[1])
    : [];

  const chartData = sortedWordFrequencies.map(([word, count]) => ({
    word,
    count
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Word Frequency Analyzer
            </h1>
            <p className="mt-2 text-gray-700">
              Analyze word frequencies from any webpage
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="url-input" className="sr-only">Website URL</label>
                <input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder:text-gray-600 text-gray-900"
                  required
                  aria-describedby="url-description"
                />
                <span id="url-description" className="sr-only">Enter the URL of the webpage you want to analyze</span>
              </div>
              
              <div>
                <label htmlFor="num-results" className="sr-only">Number of results</label>
                <input
                  id="num-results"
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
                  aria-label="Number of results to display"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg
                         hover:bg-orange-600 focus:outline-none focus:ring-2 
                         focus:ring-orange-500 focus:ring-offset-2 
                         disabled:opacity-50 whitespace-nowrap
                         transition-colors duration-200"
                aria-label={loading ? "Analyzing webpage..." : "Analyze webpage"}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                    Analyzing...
                  </span>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>

            <div>
              <label htmlFor="stop-words" className="sr-only">Custom stop words</label>
              <input
                id="stop-words"
                type="text"
                value={customStopWords}
                onChange={(e) => setCustomStopWords(e.target.value)}
                placeholder="Custom stop words (comma-separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder:text-gray-600 text-gray-900"
                aria-describedby="stop-words-description"
              />
              <p id="stop-words-description" className="mt-1 text-sm text-gray-700">
                Add custom words to ignore, separated by commas
              </p>
            </div>
          </form>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6" role="alert">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {results && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<BarChart2 className="h-5 w-5" aria-hidden="true" />}
                  title="Total Words"
                  value={results.statistics.total_words.toLocaleString()}
                  bgColor="bg-blue-50"
                  textColor="text-blue-900"
                  iconColor="text-blue-600"
                />
                <StatCard
                  icon={<Book className="h-5 w-5" aria-hidden="true" />}
                  title="Unique Words"
                  value={results.statistics.unique_words.toLocaleString()}
                  bgColor="bg-green-50"
                  textColor="text-green-900"
                  iconColor="text-green-600"
                />
                <StatCard
                  icon={<Languages className="h-5 w-5" aria-hidden="true" />}
                  title="Language"
                  value={results.language.toUpperCase()}
                  bgColor="bg-purple-50"
                  textColor="text-purple-900"
                  iconColor="text-purple-600"
                />
                <StatCard
                  icon={<Book className="h-5 w-5" aria-hidden="true" />}
                  title="Avg Word Length"
                  value={results.statistics.avg_word_length}
                  bgColor="bg-orange-50"
                  textColor="text-orange-900"
                  iconColor="text-orange-600"
                />
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Word Frequency
                    </h2>
                    <div className="flex items-center gap-2" role="group" aria-label="View options">
                      <button
                        onClick={() => setShowGraph(false)}
                        className={`p-2 rounded-lg ${!showGraph ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Show table view"
                        aria-label="Show table view"
                        // aria-pressed={showGraph ? "false" : "true"}
                      >
                        <List className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setShowGraph(true)}
                        className={`p-2 rounded-lg ${showGraph ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Show graph view"
                        aria-label="Show graph view"
                        // aria-pressed={String(showGraph)}
                      >
                        <BarChart2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm
                             bg-orange-500 text-white rounded-lg hover:bg-orange-600
                             focus:outline-none focus:ring-2 focus:ring-orange-500
                             transition-colors duration-200"
                    title="Export results as CSV"
                    aria-label="Export results as CSV"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Export CSV
                  </button>
                </div>

                {!showGraph ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200" role="table">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                            Word
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                            Frequency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedWordFrequencies.map(([word, count], index) => (
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
                  <div className="h-64 mt-4" role="img" aria-label="Word frequency bar chart">
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
                        <Bar dataKey="count" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default WordFrequencyAnalyzer;