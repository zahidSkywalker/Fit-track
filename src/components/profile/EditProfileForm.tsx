import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import { NeuInput } from '@/components/ui/NeuInput';
import { NeuButton } from '@/components/ui/NeuButton';
import { useUserStore } from '@/store/useUserStore';
import { useToast } from '@/components/ui/Toast';
import { Gender, GENDER_LABELS, FitnessLevel, FITNESS_LEVEL_LABELS, FitnessGoal, FITNESS_GOAL_LABELS } from '@/types/common';
import { staggerContainer, staggerItem } from '@/animations/stagger';

interface EditProfileFormProps {
  onClose: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose }) => {
  const { user, updateUser } = useUserStore();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState<Gender>(user?.gender || Gender.OTHER);
  const [height, setHeight] = useState(String(user?.height || ''));
  const [weight, setWeight] = useState(String(user?.weight || ''));
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(user?.fitnessLevel || FitnessLevel.BEGINNER);
  const [goal, setGoal] = useState<FitnessGoal>(user?.goal || FitnessGoal.GENERAL);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = () => {
    const errs: string[] = [];
    if (!name.trim() || name.trim().length < 2) errs.push('Name must be at least 2 characters');
    const ageNum = parseInt(age);
    if (!ageNum || ageNum < 10 || ageNum > 120) errs.push('Age must be between 10 and 120');
    const heightNum = parseFloat(height);
    if (!heightNum || heightNum < 100 || heightNum > 250) errs.push('Height must be between 100 and 250 cm');
    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum < 30 || weightNum > 300) errs.push('Weight must be between 30 and 300 kg');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    updateUser({
      name: name.trim(),
      age: ageNum,
      gender,
      height: heightNum,
      weight: weightNum,
      fitnessLevel,
      goal,
    });
    toast.success('Profile updated successfully');
    onClose();
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Name */}
      <NeuInput
        label="Name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        variant="pressed"
        leftIcon={<User size={14} />}
      />

      {/* Age */}
      <NeuInput
        label="Age"
        type="number"
        placeholder="28"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        variant="pressed"
      />

      {/* Gender */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neu-text-secondary ml-1">Gender</label>
        <div className="flex gap-2">
          {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([value, label]) => (
            <motion.button
              key={value}
              className={`flex-1 py-2.5 rounded-neu-sm text-xs font-semibold transition-all neu-pressable ${
                gender === value ? 'text-white' : 'text-neu-text-secondary'
              }`}
              style={
                gender === value
                  ? {
                      background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                      boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
                    }
                  : undefined
              }
              whileTap={{ scale: 0.97 }}
              onClick={() => setGender(value)}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Height & Weight */}
      <div className="grid grid-cols-2 gap-3">
        <NeuInput
          label="Height (cm)"
          type="number"
          placeholder="165"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          variant="pressed"
          inputSize="sm"
        />
        <NeuInput
          label="Weight (kg)"
          type="number"
          placeholder="60"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          variant="pressed"
          inputSize="sm"
        />
      </div>

      {/* Fitness Level */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neu-text-secondary ml-1">Fitness Level</label>
        <div className="flex gap-2">
          {(Object.entries(FITNESS_LEVEL_LABELS) as [FitnessLevel, string][]).map(([value, label]) => (
            <motion.button
              key={value}
              className={`flex-1 py-2.5 rounded-neu-sm text-xs font-semibold capitalize transition-all neu-pressable ${
                fitnessLevel === value ? 'text-white' : 'text-neu-text-secondary'
              }`}
              style={
                fitnessLevel === value
                  ? {
                      background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                      boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
                    }
                  : undefined
              }
              whileTap={{ scale: 0.97 }}
              onClick={() => setFitnessLevel(value)}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neu-text-secondary ml-1">Fitness Goal</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][]).map(([value, label]) => (
            <motion.button
              key={value}
              className={`py-2.5 rounded-neu-sm text-[11px] font-semibold transition-all neu-pressable ${
                goal === value ? 'text-white' : 'text-neu-text-secondary'
              }`}
              style={
                goal === value
                  ? {
                      background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                      boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
                    }
                  : undefined
              }
              whileTap={{ scale: 0.97 }}
              onClick={() => setGoal(value)}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="neu-pressed-sm p-3 rounded-neu-sm">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-neu-red font-medium">{err}</p>
          ))}
        </div>
      )}

      {/* Save */}
      <NeuButton
        variant="accent"
        accent="blue"
        size="lg"
        fullWidth
        onClick={handleSave}
        icon={<Save size={16} />}
      >
        Save Changes
      </NeuButton>
    </motion.div>
  );
};
