const STORAGE_KEY = 'virtualFittingPreferences';

export interface UserPreferences {
  avatarColor: string;
  lastUsedOutfit: string;
}

export const savePreferences = (preferences: UserPreferences): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

export const loadPreferences = (): UserPreferences | null => {
  const storedPreferences = localStorage.getItem(STORAGE_KEY);
  return storedPreferences ? JSON.parse(storedPreferences) : null;
};