import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutMap) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === ' ') {
          event.preventDefault(); // Prevent scrolling
          if (shortcuts[' ']) shortcuts[' ']();
      } else if (shortcuts[key]) {
        shortcuts[key]();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
