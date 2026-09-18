import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, LayoutAnimation, Platform } from 'react-native';

/**
 * How many points of the screen's bottom edge the keyboard currently covers.
 * Use it as bottom padding on a bottom-anchored modal so its buttons stay
 * visible above the keyboard.
 *
 * Deliberately not KeyboardAvoidingView, and not measuring the view: inside a
 * Modal, React Native reports positions relative to the sheet rather than the
 * screen, so both under-correct by the sheet's offset from the top. A page
 * sheet on iPhone reaches the bottom of the screen, so the overlap is just the
 * distance from the keyboard's top edge to the screen's bottom. iOS only;
 * Android already resizes the window for the keyboard.
 */
export function useKeyboardOverlap(): number {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    // Fires for show, hide and resize; when hidden the frame sits at the bottom
    // of the screen, so the overlap works out to 0.
    const sub = Keyboard.addListener('keyboardWillChangeFrame', (e: KeyboardEvent) => {
      if (e.duration > 0) {
        LayoutAnimation.configureNext({
          duration: e.duration,
          update: { type: 'keyboard', duration: e.duration },
        });
      }
      setOverlap(Math.max(0, Dimensions.get('window').height - e.endCoordinates.screenY));
    });
    return () => sub.remove();
  }, []);

  return overlap;
}
