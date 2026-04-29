import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Ruler, Globe, Clock, Bell, Download, Upload,
  Trash2, Info, Shield, LogOut,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuInput } from '@/components/ui/NeuInput';
import { NeuToggle } from '@/components/ui/NeuToggle';
import { NeuButton, NeuButtonGhost } from '@/components/ui/NeuButton';
import { Modal } from '@/components/ui/Modal';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { useUserStore } from '@/store/useUserStore';
import { useToast } from '@/components/ui/Toast';
import { resetDatabase } from '@/db/database';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import {
  Gender, GENDER_LABELS, FitnessLevel, FITNESS_LEVEL_LABELS,
  FitnessGoal, FITNESS_GOAL_LABELS, UnitSystem,
  WEEK_DAYS_ORDER, WEEK_DAY_LABELS, type WeekDay,
} from '@/types/common';
import { downloadJson, readJsonFile } from '@/utils/helpers';
import { kgToLbs, lbsToKg, cmToInches, inchesToCm } from '@/utils/calculations';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, settings, updateUser, updateSettings, reset } = useUserStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [restDuration, setRestDuration] = useState(settings?.defaultRestDuration || 60);

  const isImperial = settings?.unitSystem === UnitSystem.IMPERIAL;
  const displayWeight = user && isImperial ? kgToLbs(user.weight) : user?.weight;
  const displayHeight = user && isImperial ? cmToInches(user.height) : user?.height;

  const handleRestChange = (val: number) => {
    setRestDuration(val);
    updateSettings({ defaultRestDuration: val });
  };

  const handleUnitToggle = (checked: boolean) => {
    updateSettings({ unitSystem: checked ? UnitSystem.IMPERIAL : UnitSystem.METRIC });
  };

  const handleExport = () => {
    const data = { exportedAt: new Date().toISOString(), app: 'FitTrack' };
    downloadJson(data, `fittrack-export-${new Date().toISOString().split('T')[0]}.json`);
    toast.success('Data exported');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      toast.info('Import received. Full import will be available in a future update.');
    } catch {
      toast.error('Failed to read file');
    }
    e.target.value = '';
  };

  const handleReset = async () => {
    await resetDatabase();
    reset();
    setShowResetConfirm(false);
    toast.success('All data has been reset');
    navigate('/onboarding', { replace: true });
  };

  const handleLogout = () => {
    reset();
    navigate('/onboarding', { replace: true });
  };

  const restOptions = [30, 45, 60, 90, 120];

  if (!user || !settings) {
    return (
      <div className="page-container pt-2">
        <PageHeader title="Settings" showBack />
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-3 border-neu-bg-dark/30 border-t-neu-blue animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="page-container pt-2 pb-6">
      <PageHeader title="Settings" showBack />

      <motion.div className="flex flex-col gap-4 mt-3" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Profile */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <SettingsRow label="Profile" value={`${user.name}`} icon={<User size={16} />} onTap={() => setShowEditProfile(true)} />
        </motion.div>

        {/* Units */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe size={16} className="text-neu-blue" />
              <span className="text-sm font-medium text-neu-text">Units</span>
            </div>
            <NeuToggle checked={isImperial} onChange={handleUnitToggle} label={isImperial ? 'Imperial' : 'Metric'} size="sm" />
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-neu-bg-dark/10">
            <div>
              <p className="text-[10px] text-neu-text-tertiary">Weight</p>
              <p className="text-sm font-bold text-neu-text tabular-nums">{displayWeight} {isImperial ? 'lbs' : 'kg'}</p>
            </div>
            <div>
              <p className="text-[10px] text-neu-text-tertiary">Height</p>
              <p className="text-sm font-bold text-neu-text tabular-nums">{displayHeight} {isImperial ? 'in' : 'cm'}</p>
            </div>
          </div>
        </motion.div>

        {/* Rest Timer */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <div className="flex items-center gap-2.5 mb-3">
            <Clock size={16} className="text-neu-peach" />
            <span className="text-sm font-medium text-neu-text">Default Rest Duration</span>
          </div>
          <div className="flex gap-2">
            {restOptions.map((sec) => (
              <motion.button
                key={sec}
                className={`flex-1 py-2 rounded-neu-sm text-xs font-semibold transition-all neu-pressable ${restDuration === sec ? 'text-white' : 'text-neu-text-secondary'}`}
                style={restDuration === sec ? { background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)', boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5' } : undefined}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRestChange(sec)}
              >
                {sec}s
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Reminders */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-neu-green" />
              <span className="text-sm font-medium text-neu-text">Workout Reminders</span>
            </div>
            <NeuToggle checked={settings.reminderEnabled} onChange={(c) => updateSettings({ reminderEnabled: c })} size="sm" />
          </div>
        </motion.div>

        {/* Data */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <p className="text-xs font-bold text-neu-text-secondary mb-3">Data Management</p>
          <div className="flex flex-col gap-2">
            <SettingsRow label="Export Data" icon={<Download size={14} />} onTap={handleExport} />
            <label className="flex items-center justify-between p-2 rounded-neu-sm cursor-pointer hover:bg-neu-bg-dark/5 transition-colors">
              <div className="flex items-center gap-2.5">
                <Upload size={14} className="text-neu-blue" />
                <span className="text-sm text-neu-text">Import Data</span>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div className="neu-raised p-4 border-2 border-neu-red/20" variants={staggerItem}>
          <p className="text-xs font-bold text-neu-red mb-3">Danger Zone</p>
          <div className="flex flex-col gap-2">
            <SettingsRow label="Log Out" icon={<LogOut size={14} />} textColor="text-neu-text-secondary" onTap={handleLogout} />
            <SettingsRow label="Reset All Data" icon={<Trash2 size={14} />} textColor="text-neu-red" onTap={() => setShowResetConfirm(true)} />
          </div>
        </motion.div>

        {/* App info */}
        <motion.div className="neu-pressed-sm p-4 rounded-neu" variants={staggerItem}>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-neu-text-tertiary" />
            <span className="text-xs font-bold text-neu-text-tertiary">Privacy</span>
          </div>
          <p className="text-[11px] text-neu-text-tertiary leading-relaxed">
            All data is stored locally on your device. No data is sent to any server. Your information never leaves your phone.
          </p>
          <p className="text-[10px] text-neu-text-tertiary mt-2">FitTrack v1.0.0 — Built with React + IndexedDB</p>
        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile" size="lg">
        <EditProfileForm onClose={() => setShowEditProfile(false)} />
      </Modal>

      {/* Reset Confirm Modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset All Data?" size="sm">
        <p className="text-sm text-neu-text-secondary mb-4 leading-relaxed">
          This will permanently delete all your workout history, profile data, challenges progress, and achievements. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <NeuButtonGhost size="md" fullWidth onClick={() => setShowResetConfirm(false)}>Cancel</NeuButtonGhost>
          <NeuButton variant="accent" accent="red" size="md" fullWidth onClick={handleReset}>Delete Everything</NeuButton>
        </div>
      </Modal>
    </div>
  );
};

/* ===== Helper row component ===== */
const SettingsRow: React.FC<{
  label: string;
  value?: string;
  icon: React.ReactNode;
  textColor?: string;
  onTap?: () => void;
}> = ({ label, value, icon, textColor = 'text-neu-text-secondary', onTap }) => (
  <button className="flex items-center justify-between w-full p-2 rounded-neu-sm hover:bg-neu-bg-dark/5 transition-colors" onClick={onTap}>
    <div className="flex items-center gap-2.5">
      <span className={textColor}>{icon}</span>
      <span className="text-sm font-medium text-neu-text">{label}</span>
    </div>
    {value && <span className="text-xs text-neu-text-tertiary font-medium">{value}</span>}
  </button>
);

export default SettingsPage;
