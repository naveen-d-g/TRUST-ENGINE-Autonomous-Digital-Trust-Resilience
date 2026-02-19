import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { logger } from '../../services/logger';
import { runtimeConfig } from '../../config/runtimeConfig';

/**
 * Route-level error boundary fallback
 * Catches routing errors and displays appropriate UI
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  // Log the error
  if (error instanceof Error) {
    logger.error('Route error', error);
  }

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-red-500/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <span className="text-3xl font-bold text-red-500">{errorStatus}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {errorStatus === 404 ? 'Page Not Found' : 'Error Occurred'}
          </h1>
          <p className="text-gray-400">
            {errorStatus === 404
              ? 'The page you are looking for does not exist.'
              : errorMessage}
          </p>
        </div>

        {!runtimeConfig.isProduction && error instanceof Error && (
          <div className="mb-6 p-4 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs font-mono text-red-400 break-all whitespace-pre-wrap">
              {error.stack}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGoBack}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
