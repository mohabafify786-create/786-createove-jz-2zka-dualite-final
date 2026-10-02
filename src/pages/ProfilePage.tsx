import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Edit2, Heart, MapPin, Briefcase, Save, X, Plus, Trash2, Check, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { isActive, subscription, getRemainingDays } = useSubscription();
  const { t } = useLanguage();
  const subscribed = isActive();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Track whether the edit form has been initialized for the current editing session.
  // This prevents the useEffect from overwriting draft values whenever `user` changes
  // (e.g. after an optimistic update triggered by updateProfile or refreshProfile).
  const editInitializedRef = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    gender: 'Male',
    interestedIn: 'Women',
    location: '',
    age: 25,
  });

  // Temporary string state for age input — allows empty string while typing
  const [ageInput, setAgeInput] = useState<string>('');

  const [photos, setPhotos] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // CORE FIX — useEffect now has two distinct responsibilities:
  //
  // 1. On first render (editInitializedRef.current === false) OR when the edit
  //    session is NOT active: sync all form state from the latest user object.
  //    This covers the initial page load and any time the user closes editing.
  //
  // 2. While the edit session IS active (isEditing === true AND
  //    editInitializedRef.current === true): do NOT touch formData, ageInput,
  //    photos, or interests. Only the user object changed (e.g. optimistic auth
  //    update). Overwriting draft values here was the root cause of Bug 2.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    // If we are currently in an active editing session that has already been
    // initialized, skip the reset entirely — the user is mid-edit.
    if (isEditing && editInitializedRef.current) {
      return;
    }

    // Initialize (or re-initialize after edit ends) all form fields from user.
    const loadedAge = user.age || 25;
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      gender: user.gender || 'Male',
      interestedIn: user.interestedIn || 'Women',
      location: user.location || '',
      age: loadedAge,
    });
    setAgeInput(String(loadedAge));
    setPhotos(
      user.photos?.length > 0
        ? [...user.photos]
        : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces']
    );
    setInterests(user.interests?.length > 0 ? [...user.interests] : []);

    // Mark as initialized so future user-object changes don't clobber the draft.
    if (isEditing) {
      editInitializedRef.current = true;
    }
  }, [user, isEditing]);

  // When the user clicks "Edit", mark the session as newly initialized so the
  // next useEffect run (with the current user) will populate the form once.
  const handleStartEdit = () => {
    editInitializedRef.current = false; // allow one-time init from current user
    setIsEditing(true);
  };

  // ── Photo file selection ──────────────────────────────────────────────────
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size should be less than 10MB');
      return;
    }

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read the file. Please try again.');
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  // ── Confirm photo upload — only touches `photos`, never formData/ageInput ─
  const confirmPhotoUpload = () => {
    if (previewImage) {
      // Use functional updater to avoid stale closure
      setPhotos((prev) => {
        if (prev.length >= 6) return prev;
        return [...prev, previewImage];
      });
      setPreviewImage(null);
    }
  };

  const cancelPhotoUpload = () => {
    setPreviewImage(null);
    setUploadError(null);
  };

  const handlePhotoUpload = () => {
    if (photos.length >= 6) {
      setUploadError('Maximum 6 photos allowed');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleCameraUpload = () => {
    if (photos.length >= 6) {
      setUploadError('Maximum 6 photos allowed');
      return;
    }
    cameraInputRef.current?.click();
  };

  // ── Photo removal — only touches `photos`, never formData/ageInput ────────
  // BUG 1 FIX: use functional updater to guarantee we are working on the
  // most-recent photos array (avoids stale-closure issues), and filter by
  // index rather than by URL string to avoid accidentally removing duplicates.
  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const parsedAge = parseInt(ageInput, 10);
    if (!ageInput.trim() || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 100) {
      setSaveError('Please enter a valid age between 18 and 100.');
      setIsSaving(false);
      return;
    }

    const updates = {
      ...formData,
      age: parsedAge,
      photos: [...photos],
      interests: [...interests],
      avatar: photos[0] || user?.avatar,
    };

    const result = await updateProfile(updates);

    setIsSaving(false);

    if (result.success) {
      // End the editing session — allow useEffect to re-sync from saved user.
      editInitializedRef.current = false;
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || 'Failed to save changes');
    }
  };

  // ── Cancel edit — restore from current user data ─────────────────────────
  const handleCancelEdit = () => {
    editInitializedRef.current = false; // allow useEffect to re-sync
    setIsEditing(false);
    if (user) {
      const restoredAge = user.age || 25;
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        gender: user.gender || 'Male',
        interestedIn: user.interestedIn || 'Women',
        location: user.location || '',
        age: restoredAge,
      });
      setAgeInput(String(restoredAge));
      setPhotos(
        user.photos?.length > 0
          ? [...user.photos]
          : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces']
      );
      setInterests(user.interests || []);
    }
    setSaveError(null);
    setUploadError(null);
  };

  // ── Interests ─────────────────────────────────────────────────────────────
  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests((prev) => prev.filter((i) => i !== interest));
  };

  const stats = { likes: 245, matches: 48, views: 1250 };
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const interestedInOptions = ['Women', 'Men', 'Everyone'];

  return (
    <div className="min-h-[80vh] bg-surface-muted pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">{t('profile.title')}</h1>
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
              <span>{t('buttons.edit')}</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-heartsync text-white font-medium rounded-full hover:bg-heartsync-dark transition-colors active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? t('common.loading') : t('buttons.save')}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Toasts ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">{t('common.profileUpdated')}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
            >
              <X className="w-5 h-5 text-heartsync" />
              <span className="text-heartsync font-medium">{saveError}</span>
              <button onClick={() => setSaveError(null)} className="ml-auto">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
            >
              <X className="w-5 h-5 text-heartsync" />
              <span className="text-heartsync font-medium">{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="ml-auto">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Profile card ───────────────────────────────────────────────── */}
        <div className="card overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-heartsync to-heartsync-dark">
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <img
                  src={photos[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'}
                  alt={formData.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
                {isEditing && (
                  <button
                    onClick={handlePhotoUpload}
                    className="absolute bottom-0 right-0 p-2 bg-heartsync rounded-full text-white shadow-md hover:bg-heartsync-dark transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.name')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.age')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="input-field"
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h2 className="text-xl font-bold text-black">
                  {formData.name}{formData.age ? `, ${formData.age}` : ''}
                </h2>
                {formData.location && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{formData.location}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-around py-4 border-y border-gray-100 my-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-heartsync">{stats.likes}</p>
                <p className="text-xs text-gray-500">{t('profile.likes')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-heartsync">{stats.matches}</p>
                <p className="text-xs text-gray-500">{t('profile.matches')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-heartsync">{stats.views}</p>
                <p className="text-xs text-gray-500">{t('profile.views')}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                    className="input-field"
                  >
                    {genderOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.interestedIn')}</label>
                  <select
                    value={formData.interestedIn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, interestedIn: e.target.value }))}
                    className="input-field"
                  >
                    {interestedInOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-heartsync" />
                  <span>{t('profile.interestedIn')}: {formData.interestedIn}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bio ────────────────────────────────────────────────────────── */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-black mb-4 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-heartsync" />
            {t('profile.bio')}
          </h3>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              className="input-field min-h-[100px] resize-none"
              placeholder={t('profile.bioPlaceholder')}
            />
          ) : (
            <p className="text-gray-600 text-sm leading-relaxed">
              {formData.bio || t('profile.noBio')}
            </p>
          )}
        </div>

        {/* ── Photos ─────────────────────────────────────────────────────── */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-black flex items-center gap-2">
              <Camera className="w-4 h-4 text-heartsync" />
              {t('profile.photos')} ({photos.length}/6)
            </h3>
            {isEditing && photos.length < 6 && (
              <div className="flex gap-2">
                <button
                  onClick={handleCameraUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-heartsync text-white text-xs font-medium rounded-full hover:bg-heartsync-dark transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('profile.camera')}</span>
                </button>
                <button
                  onClick={handlePhotoUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('profile.upload')}</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            {isEditing ? 'Click camera to take a photo or upload to browse your gallery' : 'Your profile photos'}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="relative aspect-square group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {isEditing && (
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-heartsync"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-heartsync text-white text-[10px] font-bold rounded-full">
                    {t('profile.main')}
                  </span>
                )}
              </div>
            ))}
            {isEditing && photos.length < 6 && (
              <button
                onClick={handlePhotoUpload}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-heartsync hover:text-heartsync transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-50 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs">{t('profile.addPhoto')}</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload photo from gallery"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Take photo with camera"
          />
        </div>

        {/* ── Photo preview modal ─────────────────────────────────────────── */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={cancelPhotoUpload}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-black mb-4 text-center">Preview Photo</h3>
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-gray-100">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-heartsync rounded-full animate-spin" />
                        <span className="text-sm text-gray-500">{t('common.loading')}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelPhotoUpload}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {t('buttons.cancel')}
                  </button>
                  <button
                    onClick={confirmPhotoUpload}
                    disabled={uploadingPhoto}
                    className="flex-1 py-3 bg-heartsync text-white font-semibold rounded-full hover:bg-heartsync-dark transition-colors disabled:opacity-50"
                  >
                    {t('profile.addPhoto')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Interests ──────────────────────────────────────────────────── */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-black mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-heartsync" />
            {t('profile.interests')}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map((interest, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  isEditing
                    ? 'bg-red-50 text-heartsync flex items-center gap-1.5'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {interest}
                {isEditing && (
                  <button onClick={() => handleRemoveInterest(interest)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder={t('profile.addInterest')}
                className="input-field flex-1"
              />
              <button
                onClick={handleAddInterest}
                className="px-4 py-2 bg-heartsync text-white font-medium rounded-full hover:bg-heartsync-dark transition-colors"
              >
                {t('profile.add')}
              </button>
            </div>
          )}
        </div>

        {/* ── Premium badge ───────────────────────────────────────────────── */}
        {subscribed && (
          <div className="card p-6 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600 fill-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800">{t('profile.premiumActive')}</p>
                <p className="text-sm text-green-600">
                  {subscription.plan?.charAt(0).toUpperCase()}{subscription.plan?.slice(1)}{' '}
                  · {getRemainingDays()} days remaining
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
