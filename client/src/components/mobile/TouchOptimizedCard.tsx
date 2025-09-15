import React, { useState } from 'react';
import { animated } from 'react-spring';
import { useTapGesture, useLongPress, useDragGesture } from '../../hooks/useGestures';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TouchOptimizedCardProps {
  title: string;
  children: React.ReactNode;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  className?: string;
  isDraggable?: boolean;
  showActions?: boolean;
}

export const TouchOptimizedCard: React.FC<TouchOptimizedCardProps> = ({
  title,
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onEdit,
  onDelete,
  onView,
  className = '',
  isDraggable = false,
  showActions = true
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Tap gesture for primary action
  const tapBind = useTapGesture(
    onTap,
    onDoubleTap || onEdit, // Double tap defaults to edit if available
    { doubleTapDelay: 300 }
  );

  // Long press for context menu
  const longPressBind = useLongPress(
    () => {
      setShowContextMenu(true);
      if (onLongPress) {
        onLongPress();
      }
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    },
    { delay: 500, threshold: 10 }
  );

  // Drag gesture for reordering (if enabled)
  const { bind: dragBind, x, y } = useDragGesture({
    onDragStart: () => setIsPressed(true),
    onDragEnd: () => setIsPressed(false),
  });

  // Combine gesture bindings
  const gestureBinds = {
    ...tapBind(),
    ...longPressBind(),
    ...(isDraggable ? dragBind() : {}),
  };

  const cardStyle = {
    transform: isDraggable ? `translate3d(${x.get()}px, ${y.get()}px, 0)` : undefined,
    scale: isPressed ? 0.98 : 1,
    transition: 'scale 0.1s ease-out',
    cursor: onTap ? 'pointer' : 'default',
  };

  return (
    <>
      <animated.div
        {...gestureBinds}
        style={cardStyle}
        className={`touch-none select-none ${className}`}
      >
        <Card className={`
          transition-all duration-200 ease-out
          hover:shadow-md active:shadow-sm
          ${isPressed ? 'shadow-lg' : ''}
          ${showContextMenu ? 'ring-2 ring-blue-500' : ''}
        `}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">
              {title}
            </CardTitle>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 touch-manipulation"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onView && (
                    <DropdownMenuItem onClick={onView} className="touch-manipulation">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit} className="touch-manipulation">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={onDelete} 
                      className="text-red-600 touch-manipulation"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </animated.div>

      {/* Context Menu Overlay */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center"
          onClick={() => setShowContextMenu(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 m-4 max-w-xs w-full">
            <h3 className="font-semibold mb-3 text-center">{title}</h3>
            <div className="space-y-2">
              {onView && (
                <Button
                  variant="outline"
                  className="w-full justify-start touch-manipulation"
                  onClick={() => {
                    onView();
                    setShowContextMenu(false);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  className="w-full justify-start touch-manipulation"
                  onClick={() => {
                    onEdit();
                    setShowContextMenu(false);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  className="w-full justify-start touch-manipulation"
                  onClick={() => {
                    onDelete();
                    setShowContextMenu(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3 touch-manipulation"
              onClick={() => setShowContextMenu(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

// Swipeable list item component
interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = ''
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const threshold = 80;
  const maxSwipe = 120;

  const { bind, x } = useDragGesture({
    onDrag: ({ x: offsetX }) => {
      const clampedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, offsetX));
      setSwipeOffset(clampedOffset);
      setIsRevealed(Math.abs(clampedOffset) > threshold);
    },
    onDragEnd: () => {
      if (Math.abs(swipeOffset) > threshold) {
        if (swipeOffset > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (swipeOffset < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      setSwipeOffset(0);
      setIsRevealed(false);
    }
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left Action */}
      {rightAction && (
        <div 
          className={`absolute left-0 top-0 h-full w-20 flex items-center justify-center transition-opacity duration-200 ${
            swipeOffset > threshold ? 'opacity-100' : 'opacity-60'
          }`}
          style={{ backgroundColor: rightAction.color }}
        >
          <div className="text-white text-center">
            {rightAction.icon}
            <div className="text-xs mt-1">{rightAction.label}</div>
          </div>
        </div>
      )}

      {/* Right Action */}
      {leftAction && (
        <div 
          className={`absolute right-0 top-0 h-full w-20 flex items-center justify-center transition-opacity duration-200 ${
            swipeOffset < -threshold ? 'opacity-100' : 'opacity-60'
          }`}
          style={{ backgroundColor: leftAction.color }}
        >
          <div className="text-white text-center">
            {leftAction.icon}
            <div className="text-xs mt-1">{leftAction.label}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <animated.div
        {...bind()}
        style={{
          transform: `translateX(${x.get()}px)`,
          backgroundColor: 'white',
          position: 'relative',
          zIndex: 1
        }}
        className="touch-none"
      >
        {children}
      </animated.div>
    </div>
  );
};