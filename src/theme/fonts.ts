import { useAppStore } from '../store/useAppStore';
import { FontPreference } from '../types';

export interface FontOption {
  key: FontPreference;
  label: string;
  fontFamily: string | undefined;
  sampleText: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'system',
    label: 'Default',
    fontFamily: undefined,
    sampleText: 'My Tasks',
  },
  {
    key: 'GloriaHallelujah',
    label: 'Gloria',
    fontFamily: 'GloriaHallelujah_400Regular',
    sampleText: 'My Tasks',
  },
  {
    key: 'Caveat',
    label: 'Caveat',
    fontFamily: 'Caveat_400Regular',
    sampleText: 'My Tasks',
  },
  {
    key: 'Pacifico',
    label: 'Pacifico',
    fontFamily: 'Pacifico_400Regular',
    sampleText: 'My Tasks',
  },
  {
    key: 'DancingScript',
    label: 'Dancing',
    fontFamily: 'DancingScript_400Regular',
    sampleText: 'My Tasks',
  },
  {
    key: 'IndieFlower',
    label: 'Indie',
    fontFamily: 'IndieFlower_400Regular',
    sampleText: 'My Tasks',
  },
  {
    key: 'ShadowsIntoLight',
    label: 'Shadows',
    fontFamily: 'ShadowsIntoLight_400Regular',
    sampleText: 'My Tasks',
  },
];

/**
 * Returns the fontFamily string for the user's selected font preference.
 * Returns undefined for 'system', which lets React Native use the device default.
 */
export const useFontFamily = (): string | undefined => {
  const fontPreference = useAppStore((state) => state.fontPreference);
  const option = FONT_OPTIONS.find((o) => o.key === fontPreference);
  return option?.fontFamily;
};
