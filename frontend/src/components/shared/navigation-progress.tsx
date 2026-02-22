'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress
 *
 * A lightweight, CSS-driven top progress bar that activates on every
 * Next.js App Router navigation. No external libraries required.
 *
 * How it works:
 *  - Watches `pathname` + `searchParams` for changes (App Router navigation events).
 *  - On change: immediately shows the bar and animates it to ~85% (the "loading" phase).
 *  - After a short settle delay: completes to 100% then fades out.
 *
 * The bar is rendered at the very top of the page (fixed, z-50) so it appears
 * above everything including modals and sticky headers.
 */
export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);
    const [completing, setCompleting] = useState(false);

    // Track previous location to detect actual navigation
    const prevPathRef = useRef<string>('');
    // Timer refs so we can cancel in-flight animations
    const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Reset all timers */
    const clearTimers = () => {
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };

    /** Start the loading animation */
    const startProgress = () => {
        clearTimers();
        setCompleting(false);
        setVisible(true);
        setWidth(0);

        // Kick off the grow animation on next tick so the 0→15% transition plays
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setWidth(75); // grows to 75% during load
            });
        });
    };

    /** Finish the loading animation */
    const completeProgress = () => {
        clearTimers();
        setCompleting(true);
        setWidth(100);

        hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            setWidth(0);
            setCompleting(false);
        }, 400); // matches the CSS transition duration
    };

    useEffect(() => {
        const currentPath = pathname + searchParams.toString();

        if (prevPathRef.current === '') {
            // First render — just record the path, don't show the bar
            prevPathRef.current = currentPath;
            return;
        }

        if (prevPathRef.current === currentPath) return;

        // Navigation detected
        prevPathRef.current = currentPath;
        startProgress();

        // Complete after a brief moment (the new page segment renders quickly)
        completeTimerRef.current = setTimeout(() => {
            completeProgress();
        }, 300);

        return () => { clearTimers(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    if (!visible) return null;

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                height: '3px',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${width}%`,
                    background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
                    borderRadius: '0 2px 2px 0',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.7), 0 0 20px rgba(168, 85, 247, 0.4)',
                    transition: completing
                        ? 'width 0.3s ease-in-out, opacity 0.4s ease-out'
                        : 'width 8s cubic-bezier(0.1, 0.05, 0, 1)',
                    opacity: completing && width === 100 ? 0 : 1,
                }}
            />
        </div>
    );
}
