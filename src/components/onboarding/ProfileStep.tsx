import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Ruler, Weight } from 'lucide-react';
import { NeuButton } from '@/components/ui/NeuButton';
import { NeuInput } from '@/components/ui/NeuInput';
import type { OnboardingData } from '@/types/user';
import { Gender, GENDER_LABELS } from '@/types/common';
import { validateOnboardingData } from '@/types/user';

interface ProfileStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const handleNext = () => {
    const result = validateOnboardingData(data);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onNext();
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className="neu-raised-circle w-10 h-10 flex items-center justify-center neu-pressable"
          whileTap={{ scale: 0.92 }}
        >
          <ChevronLeft size={20} className="text-neu-text" />
        </motion.button>
        <div>
          <h2 className="text-lg font-extrabold text-neu-text">About You</h2>
          <p className="text-xs text-neu-text-secondary">Help us personalize your experience</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5 flex-1">
        {/* Name */}
        <NeuInput
          label="Your Name"
          placeholder="e.g. Sophia"
          value={data.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          leftIcon={<User size={16} />}
          variant="pressed"
        />

        {/* Age */}
        <NeuInput
          label="Age"
          type="number"
          placeholder="28"
          value={data.age ? String(data.age) : ''}
          onChange={(e) => onUpdate({ age: parseInt(e.target.value) || 0 })}
          variant="pressed"
          inputSize="md"
        />

        {/* Gender */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neu-text-secondary ml-1">Gender</label>
          <div className="flex gap-2">
            {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([value, label]) => (
              <motion.button
                key={value}
                className={`
                  flex-1 py-2.5 rounded-neu-sm text-xs font-semibold transition-all
                  ${data.gender === value
                    ? 'text-white'
                    : 'text-neu-text-secondary neu-pressable'
                  }
                `}
                style={
                  data.gender === value
                    ? {
                        background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                        boxShadow: '4px 4px 8px #C8BFB5, -4px -4px 8px #F5EDE5',
                      }
                    : undefined
                }
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdate({ gender: value })}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Height & Weight row */}
        <div className="grid grid-cols-2 gap-3">
          <NeuInput
            label="Height (cm)"
            type="number"
            placeholder="165"
            value={data.height ? String(data.height) : ''}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 0 })}
            leftIcon={<Ruler size={14} />}
            variant="pressed"
            inputSize="sm"
          />
          <NeuInput
            label="Weight (kg)"
            type="number"
            placeholder="60"
            value={data.weight ? String(data.weight) : ''}
            onChange={(e) => onUpdate({ weight: parseInt(e.target.value) || 0 })}
            leftIcon={<Weight size={14} />}
            variant="pressed"
            inputSize="sm"
          />
        </div>

        {/* Fitness Level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neu-text-secondary ml-1">Fitness Level</label>
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <motion.button
                key={level}
                className={`
                  flex-1 py-2.5 rounded-neu-sm text-xs font-semibold capitalize transition-all
                  ${data.fitnessLevel === level
                    ? 'text-white'
                    : 'text-neu-text-secondary neu-pressable'
                  }
                `}
                style={
                  data.fitnessLevel === level
                    ? {
                        background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                        boxShadow: '4px 4px 8px #C8BFB5, -4px -4px 8px #F5EDE5',
                      }
                    : undefined
                }
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdate({ fitnessLevel: level })}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 neu-pressed-sm p-3 rounded-neu-sm">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-neu-red font-medium">{err}</p>
          ))}
        </div>
      )}

      {/* Next button */}
      <div className="mt-6">
        <NeuButton
          variant="accent"
          accent="blue"
          size="lg"
          fullWidth
          onClick={handleNext}
        >
          Continue
        </NeuButton>
      </div>
    </div>
  );
};
