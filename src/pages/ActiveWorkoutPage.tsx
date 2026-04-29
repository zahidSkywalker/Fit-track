import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useUserStore } from '@/store/useUserStore';
import { ActiveExercise } from '@/components/workout/ActiveExercise';
import { SetTracker } from '@/components/workout/SetTracker';
import { WorkoutControls } from '@/components/workout/WorkoutControls';
import { SegmentedProgressBar } from '@/components/ui/ProgressBar';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useToast } from '@/components/ui/Toast';
import { formatTime, formatDurationShort } from '@/utils/formatters';
import { TimerState, WorkoutStatus } from '@/types/common';
import type { WorkoutSummary } from '@/types/workout';

export const ActiveWorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { user } = useUserStore();
  const settings = useUserStore((s) => s.settings);

  const {
    activeWorkout,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    updateTimerTick,
    completeSet,
    skipSet,
    skipExercise,
    goToNextExercise,
    goToPreviousExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Start workout on mount
  useEffect(() => {
    if (id) {
      startWorkout(id);
    }
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Timer tick loop
  useEffect(() => {
    if (!activeWorkout || activeWorkout.isPaused) {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();
    tickIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const aw = useWorkoutStore.getState().activeWorkout;
      if (!aw || aw.isPaused) return;

      const newElapsed = aw.elapsedSeconds + delta;
      const newTotal = aw.totalElapsedSeconds + delta;
      updateTimerTick(newElapsed, newTotal);
    }, 200);

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [activeWorkout?.isPaused, activeWorkout?.timerState, updateTimerTick]);

  // Rest timer
  const restTimer = useRestTimer({
    defaultDuration: settings?.defaultRestDuration || 60,
    onRestComplete: () => {
      // After rest, auto-advance to next set or next exercise
      const aw = useWorkoutStore.getState().activeWorkout;
      if (!aw) return;
      const currentExRecord = aw.session.exercises[aw.currentExerciseIndex];
      const nextSetIdx = aw.currentSetIndex + 1;

      if (nextSetIdx < currentExRecord.sets.length) {
        // More sets in this exercise — just clear rest state
        // The timer for the next set will start automatically
      } else {
        // All sets done, move to next exercise
        goToNextExercise();
      }
    },
    onTick: (remaining) => {
      // Could update UI with rest countdown if needed
    },
  });

  // Trigger rest after completing a set
  const handleSetComplete = useCallback(async (reps?: number, duration?: number, weight?: number) => {
    if (!activeWorkout) return;
    completeSet(reps, duration, weight);

    const aw = useWorkoutStore.getState().activeWorkout;
    if (!aw) return;

    const currentExRecord = aw.session.exercises[aw.currentExerciseIndex];
    const nextSetIdx = aw.currentSetIndex + 1;
    const we = aw.workoutPlan.exercises[aw.currentExerciseIndex];

    if (nextSetIdx < currentExRecord.sets.length) {
      // More sets — trigger rest
      pauseWorkout();
      restTimer.startRest(we.restDuration);
    } else {
      // Last set — move to next exercise
      if (aw.currentExerciseIndex < aw.workoutPlan.exercises.length - 1) {
        pauseWorkout();
        restTimer.startRest(we.restDuration);
      }
      // goToNextExercise will be called by rest timer complete or manually
    }
  }, [activeWorkout, completeSet, pauseWorkout, restTimer]);

  const handleSetSkip = useCallback(() => {
    skipSet();
  }, [skipSet]);

  const handlePlay = useCallback(() => {
    restTimer.cancelRest();
    resumeWorkout();
  }, [restTimer, resumeWorkout]);

  const handlePause = useCallback(() => {
    pauseWorkout();
  }, [pauseWorkout]);

  const handleSkipForward = useCallback(() => {
    restTimer.cancelRest();
    const aw = useWorkoutStore.getState().activeWorkout;
    if (!aw) return;

    const currentExRecord = aw.session.exercises[aw.currentExerciseIndex];
    const allSetsDone = currentExRecord.sets.every((s) => s.completed || s.skipped);

    if (allSetsDone || aw.currentExerciseIndex >= aw.workoutPlan.exercises.length - 1) {
      goToNextExercise();
    } else {
      // Skip remaining sets and move to next exercise
      skipExercise();
    }
  }, [restTimer, goToNextExercise, skipExercise]);

  const handleSkipBack = useCallback(() => {
    restTimer.cancelRest();
    goToPreviousExercise();
  }, [restTimer, goToPreviousExercise]);

  const handleStop = useCallback(async () => {
    restTimer.cancelRest();
    const summary = await finishWorkout();
    if (summary) {
      navigate('/workout-summary', { state: { summary }, replace: true });
    }
  }, [restTimer, finishWorkout, navigate]);

  const handleCancel = useCallback(() => {
    restTimer.cancelRest();
    cancelWorkout();
    toast.info('Workout cancelled');
    navigate(-1);
  }, [restTimer, cancelWorkout, toast, navigate]);

  if (!activeWorkout) {
    return (
      <div className="min-h-dvh bg-neu-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-neu-bg-dark/30 border-t-neu-blue animate-spin" />
      </div>
    );
  }

  const aw = activeWorkout;
  const currentWE = aw.workoutPlan.exercises[aw.currentExerciseIndex];
  const currentRecord = aw.session.exercises[aw.currentExerciseIndex];
  const totalExercises = aw.workoutPlan.exercises.length;
  const isTimed = !!currentWE.targetDuration;

  return (
    <div className="min-h-dvh bg-neu-bg flex flex-col safe-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex-1">
          <p className="text-[10px] text-neu-text-tertiary font-medium uppercase tracking-wider">
            {aw.workoutPlan.name}
          </p>
          <p className="text-sm font-bold text-neu-text tabular-nums">
            {formatDurationShort(aw.totalElapsedSeconds)}
          </p>
        </div>
        <div className="neu-pressed-sm px-3 py-1.5 rounded-neu-sm">
          <p className="text-[10px] text-neu-text-secondary font-medium">
            Exercise {aw.currentExerciseIndex + 1}/{totalExercises}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-2">
        <SegmentedProgressBar
          total={totalExercises}
          current={aw.currentExerciseIndex + 1}
          color="#7BA7CC"
          completedColor="#8ECDA8"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <ActiveExercise
          workoutExercise={currentWE}
          exerciseRecord={currentRecord}
          elapsedSeconds={aw.elapsedSeconds}
          isResting={restTimer.isResting}
          restRemaining={restTimer.remaining}
          totalCalories={aw.session.totalCalories}
          heartRate={aw.session.avgHeartRate}
        />
      </div>

      {/* Set tracker (below the timer) */}
      <div className="px-5 max-h-[40vh] overflow-y-auto hide-scrollbar">
        <SetTracker
          sets={currentRecord.sets}
          currentSetIndex={aw.currentSetIndex}
          isTimed={isTimed}
          onSetComplete={handleSetComplete}
          onSetSkip={handleSetSkip}
          targetReps={currentWE.targetReps}
          targetDuration={currentWE.targetDuration}
        />
      </div>

      {/* Controls */}
      <div
        className="pb-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
      >
        <WorkoutControls
          isRunning={aw.timerState === TimerState.RUNNING && !restTimer.isResting}
          isPaused={aw.isPaused || restTimer.isResting}
          onPlay={handlePlay}
          onPause={handlePause}
          onSkipForward={handleSkipForward}
          onSkipBack={handleSkipBack}
          onStop={handleStop}
          onCancel={handleCancel}
          exerciseIndex={aw.currentExerciseIndex}
          totalExercises={totalExercises}
        />
      </div>
    </div>
  );
};

export default ActiveWorkoutPage;
