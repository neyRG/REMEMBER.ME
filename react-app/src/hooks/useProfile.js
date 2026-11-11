import { useState, useEffect, useCallback } from 'react';

const PROFILE_KEY = 'rememberme_profile';

const DEFAULT_PROFILE = {
  name: '',
  bio: '',
  birthday: '',
  city: '',
  email: '',
  avatar: null,
};

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export default function useProfile() {
  const [profile, setProfile] = useState(loadProfile);

  // Sync to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateAvatar = useCallback((base64) => {
    setProfile((prev) => ({ ...prev, avatar: base64 }));
  }, []);

  const removeAvatar = useCallback(() => {
    setProfile((prev) => ({ ...prev, avatar: null }));
  }, []);

  const updateEmail = useCallback((newEmail) => {
    setProfile((prev) => ({ ...prev, email: newEmail }));
  }, []);

  const getInitial = useCallback(() => {
    if (profile.name && profile.name.trim().length > 0) {
      return profile.name.trim()[0].toUpperCase();
    }
    return '?';
  }, [profile.name]);

  return {
    profile,
    updateProfile,
    updateAvatar,
    removeAvatar,
    updateEmail,
    getInitial,
  };
}
