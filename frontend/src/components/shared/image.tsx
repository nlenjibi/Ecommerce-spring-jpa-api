import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  sizes?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  unoptimized?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  className,
  sizes,
  style,
  onLoad,
  onError,
  unoptimized = false,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={cn('transition-opacity duration-300', className)}
      sizes={sizes}
      style={style}
      onLoad={onLoad}
      onError={onError}
      unoptimized={unoptimized}
    />
  );
}

export default OptimizedImage;
