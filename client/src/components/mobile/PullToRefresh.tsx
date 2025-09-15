import React from 'react';
import { animated } from 'react-spring';
import { usePullToRefresh, useDragGesture } from '../../hooks/useGestures';
import { RefreshCw, ChevronDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  maxPull = 120,
  refreshingText = 'Refreshing...',
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  className = ''
}) => {
  const {
    bind,
    y,
    isRefreshing,
    pullDistance,
    pullProgress
  } = usePullToRefresh(onRefresh);

  const getStatusText = () => {
    if (isRefreshing) return refreshingText;
    if (pullProgress >= 1) return releaseText;
    return pullText;
  };

  const getIconRotation = () => {
    if (isRefreshing) return 'animate-spin';
    if (pullProgress >= 1) return 'rotate-180';
    return `rotate-${Math.floor(pullProgress * 180)}`;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          height: `${Math.max(0, pullDistance)}px`,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`,
          opacity: pullDistance > 0 ? 1 : 0,
          transition: pullDistance === 0 ? 'opacity 0.3s ease-out' : 'none'
        }}
      >
        <div className="flex flex-col items-center justify-center text-gray-600 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <div className={`transition-transform duration-200 ${getIconRotation()}`}>
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
          <span className="text-xs mt-1 font-medium">
            {getStatusText()}
          </span>
          {!isRefreshing && (
            <div className="w-8 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-100 ease-out"
                style={{ width: `${pullProgress * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <animated.div
        {...bind()}
        style={{
          transform: y.to(y => `translateY(${y}px)`),
          touchAction: 'pan-y'
        }}
        className="touch-none"
      >
        {children}
      </animated.div>
    </div>
  );
};

// Infinite scroll component
interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<void> | void;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  className?: string;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 200,
  loadingComponent,
  endComponent,
  className = ''
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading || isLoading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsLoading(true);
          try {
            await Promise.resolve(onLoadMore());
          } finally {
            setIsLoading(false);
          }
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, isLoading, onLoadMore, threshold]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-4">
      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
      <span className="text-sm text-gray-600">Loading more...</span>
    </div>
  );

  const defaultEndComponent = (
    <div className="flex items-center justify-center py-4">
      <span className="text-sm text-gray-500">No more items to load</span>
    </div>
  );

  return (
    <div className={className}>
      {children}
      
      {hasMore && (
        <div ref={sentinelRef}>
          {(loading || isLoading) && (
            loadingComponent || defaultLoadingComponent
          )}
        </div>
      )}
      
      {!hasMore && (endComponent || defaultEndComponent)}
    </div>
  );
};

// Swipe navigation component
interface SwipeNavigationProps {
  children: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showIndicators?: boolean;
  className?: string;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  currentIndex,
  onIndexChange,
  showIndicators = true,
  className = ''
}) => {
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { bind, x } = useDragGesture({
    onDragStart: () => {
      setIsDragging(true);
    },
    onDrag: ({ x: offsetX }: { x: number }) => {
      setDragOffset(offsetX);
    },
    onDragEnd: () => {
      setIsDragging(false);
      const threshold = 50;
      
      if (Math.abs(dragOffset) > threshold) {
        if (dragOffset > 0 && currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        } else if (dragOffset < 0 && currentIndex < children.length - 1) {
          onIndexChange(currentIndex + 1);
        }
      }
      
      setDragOffset(0);
    }
  });

  const translateX = isDragging 
    ? dragOffset - (currentIndex * 100)
    : -(currentIndex * 100);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={containerRef} className="relative h-full">
        <animated.div
          {...bind()}
          style={{
            transform: `translateX(${x.to((x: number) => translateX + (x / (containerRef.current?.offsetWidth || 1)) * 100)}%)`,
            width: `${children.length * 100}%`,
            display: 'flex',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          className="h-full touch-none"
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full"
              style={{ width: `${100 / children.length}%` }}
            >
              {child}
            </div>
          ))}
        </animated.div>
      </div>

      {/* Indicators */}
      {showIndicators && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => onIndexChange(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};