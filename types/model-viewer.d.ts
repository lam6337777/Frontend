import type React from 'react';

/** Khai báo kiểu cho thẻ <model-viewer> (Web Component của @google/model-viewer) để dùng trong JSX */
type ModelViewerAttributes = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    src?: string;
    poster?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'camera-controls'?: boolean;
    'auto-rotate'?: boolean;
    'auto-rotate-delay'?: number | string;
    'rotation-per-second'?: string;
    'interaction-prompt'?: string;
    'shadow-intensity'?: number | string;
    'shadow-softness'?: number | string;
    exposure?: number | string;
    'environment-image'?: string;
    'camera-orbit'?: string;
    'min-camera-orbit'?: string;
    'max-camera-orbit'?: string;
    'field-of-view'?: string;
    'variant-name'?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'manual';
    'touch-action'?: string;
};

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': ModelViewerAttributes;
        }
    }
}

export interface ModelViewerElement extends HTMLElement {
    availableVariants: string[];
    variantName: string | null;
    autoRotate: boolean;
    cameraOrbit: string;
    fieldOfView: string;
    canActivateAR: boolean;
    activateAR(): Promise<void>;
    resetTurntableRotation(theta?: number): void;
    jumpCameraToGoal(): void;
}
