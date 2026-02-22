/**
 * Root loading.tsx
 *
 * Next.js App Router shows this component automatically while a page segment
 * is being loaded (streamed from the server or lazily fetched client-side).
 *
 * This provides an instant, non-blank fallback so users always see something
 * when navigating — even before JavaScript has finished loading the new route.
 */
export default function Loading() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                gap: '20px',
            }}
        >
            {/* Animated logo/brand mark */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
                {/* Outer spinning ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '3px solid transparent',
                        borderTopColor: '#6366f1',
                        borderRightColor: '#a855f7',
                        animation: 'spin 0.9s linear infinite',
                    }}
                />
                {/* Inner pulsing dot */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '14px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        opacity: 0.85,
                    }}
                />
            </div>

            {/* Skeleton shimmer bars — mimic a content layout */}
            <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton-bar" style={{ height: 16, borderRadius: 8, width: '100%' }} />
                <div className="skeleton-bar" style={{ height: 12, borderRadius: 8, width: '75%' }} />
                <div className="skeleton-bar" style={{ height: 12, borderRadius: 8, width: '60%' }} />
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%       { opacity: 0.5;  transform: scale(0.88); }
        }
        .skeleton-bar {
          background: linear-gradient(
            90deg,
            #f3f4f6 25%,
            #e5e7eb 50%,
            #f3f4f6 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
        </div>
    );
}
