'use client';

import { Suspense } from 'react';
import { NavigationProgress } from '@/components/shared/navigation-progress';

/**
 * NavigationProgressWrapper
 *
 * `useSearchParams()` inside NavigationProgress requires a Suspense boundary
 * in the App Router. This wrapper provides that boundary, ensuring the progress
 * bar never blocks the rest of the layout from rendering.
 */
export function NavigationProgressWrapper() {
    return (
        <Suspense fallback={null}>
            <NavigationProgress />
        </Suspense>
    );
}
