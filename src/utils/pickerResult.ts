import type { ImagePickerResponse } from 'react-native-image-picker';

export type PickedImage = { uri: string } | { error: string | null };

/**
 * Validates an image-picker response before it's turned into a data URI.
 * Without this, a photo whose base64 failed to load (e.g. an iCloud-only
 * asset that didn't finish downloading) silently produces
 * `data:image/jpeg;base64,undefined`, which saves but never renders.
 */
export function getPickedImageUri(response: ImagePickerResponse): PickedImage {
  if (response.didCancel) {
    return { error: null };
  }

  if (response.errorCode) {
    return {
      error:
        response.errorMessage ||
        'Could not access that photo. Please try again.',
    };
  }

  const asset = response.assets && response.assets[0];
  if (!asset || !asset.base64) {
    return {
      error:
        "Could not load that photo. If it's stored in iCloud, make sure you have an internet connection and try again.",
    };
  }

  return { uri: `data:image/jpeg;base64,${asset.base64}` };
}
