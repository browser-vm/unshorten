'use client';

import { useState } from 'react';

interface UnshortenResult {
  success: boolean;
  input_url: string;
  final_url?: string;
  redirect_count?: number;
  redirect_chain?: string[];
  time_taken_seconds: number;
  error?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnshortenResult | null>(null);
  const [error, setError] = useState('');

  const handleUnshorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call our secure Edge API instead of the Modal URL directly
      const res = await fetch(`/api/unshorten?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to unshorten URL.');
      } else {
        setResult(data);
      }
    } catch {
      setError('An unexpected error occurred while reaching the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4 font-sans text-gray-900">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">URL Unshortener</h1>
          <p className="text-gray-500">Trace redirects and reveal the final destination of any short link.</p>
        </div>

        <form onSubmit={handleUnshorten} className="flex gap-3 mb-8">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://bit.ly/..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Tracing...
              </>
            ) : (
              'Unshorten'
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">Final Destination</h3>
              <a 
                href={result.final_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline break-all text-lg"
              >
                {result.final_url}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Redirect Hops</p>
                <p className="text-2xl font-semibold">{result.redirect_count}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Time Taken</p>
                <p className="text-2xl font-semibold">{result.time_taken_seconds}s</p>
              </div>
            </div>

            {result.redirect_chain && result.redirect_chain.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Redirect Path</h3>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {result.redirect_chain.map((step: string, index: number) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 break-all">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}