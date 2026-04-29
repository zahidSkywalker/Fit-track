import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from '@/components/ui/Toast';
import { BottomNav } from '@/components/ui/BottomNav';
import { useUserStore } from '@/store/useUserStore';
import { seedDatabase } from '@/db/seedData';
import { pageSlideUp } from '@/animations/pageTransitions';
import { lazy, Suspense } from 'react';

/* ===== Lazy-loaded pages for code splitting ===== */
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const ActivityPage = lazy(() => import('@/pages/ActivityPage'));
const WorkoutsPage = lazy(() => import('@/pages/WorkoutsPage'));
const WorkoutDetailPage = lazy(() => import('@/pages/WorkoutDetailPage'));
const ActiveWorkoutPage = lazy(() => import('@/pages/ActiveWorkoutPage'));
const WorkoutSummaryPage = lazy(() => import('@/pages/WorkoutSummaryPage'));
const DiaryPage = lazy(() => import('@/pages/DiaryPage'));
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'));
const ExerciseDetailPage = lazy(() => import('@/pages/ExerciseDetailPage'));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

/* ===== Loading fallback ===== */
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60dvh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-3 border-neu-bg-dark/30 border-t-neu-blue animate-spin" />
      <span className="text-xs text-neu-text-secondary font-medium">Loading...</span>
    </div>
  </div>
);

/* ===== Routes that show bottom nav ===== */
const NAV_ROUTES = ['/', '/activity', '/workouts', '/diary', '/profile'];

function shouldShowNav(pathname: string): boolean {
  return NAV_ROUTES.some(
    (r) => r === pathname || (r !== '/' && pathname.startsWith(r))
  );
}

/* ===== Animated Routes Wrapper ===== */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Onboarding */}
        <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />

        {/* App routes with nav */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
          <Route path="/activity" element={<Suspense fallback={<PageLoader />}><ActivityPage /></Suspense>} />
          <Route path="/workouts" element={<Suspense fallback={<PageLoader />}><WorkoutsPage /></Suspense>} />
          <Route path="/workouts/:id" element={<Suspense fallback={<PageLoader />}><WorkoutDetailPage /></Suspense>} />
          <Route path="/diary" element={<Suspense fallback={<PageLoader />}><DiaryPage /></Suspense>} />
          <Route path="/exercises" element={<Suspense fallback={<PageLoader />}><ExercisesPage /></Suspense>} />
          <Route path="/exercises/:id" element={<Suspense fallback={<PageLoader />}><ExerciseDetailPage /></Suspense>} />
          <Route path="/challenges" element={<Suspense fallback={<PageLoader />}><ChallengesPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        </Route>

        {/* Full-screen routes (no nav) */}
        <Route path="/workouts/:id/active" element={<Suspense fallback={<PageLoader />}><ActiveWorkoutPage /></Suspense>} />
        <Route path="/workout-summary" element={<Suspense fallback={<PageLoader />}><WorkoutSummaryPage /></Suspense>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

/* ===== App Shell: provides nav + animated outlet ===== */
const AppShell: React.FC = () => {
  const location = useLocation();
  const showNav = shouldShowNav(location.pathname);

  return (
    <div className="flex flex-col min-h-dvh">
      <motion.main
        className="flex-1"
        variants={pageSlideUp}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Outlet />
      </motion.main>
      {showNav && <BottomNav />}
    </div>
  );
};

/* ===== Root App Component ===== */
const App: React.FC = () => {
  const { initialize, isInitialized, needsOnboarding } = useUserStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function boot() {
      // Seed workout plans (idempotent — only seeds if empty)
      await seedDatabase();
      // Initialize user state (checks if user exists in DB)
      await initialize();
      setReady(true);
    }
    boot();
  }, [initialize]);

  // Show splash while booting
  if (!ready || !isInitialized) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-neu-bg">
        <div className="flex flex-col items-center gap-4">
          {/* Animated logo */}
          <motion.div
            className="w-16 h-16 neu-raised-circle flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
              <g transform="translate(256, 256) scale(0.5)">
                <rect x="-130" y="-28" width="40" height="56" rx="8" fill="#7BA7CC" />
                <rect x="-90" y="-10" width="50" height="20" rx="4" fill="#8A807A" />
                <rect x="-40" y="-14" width="80" height="28" rx="14" fill="#8A807A" />
                <rect x="40" y="-10" width="50" height="20" rx="4" fill="#8A807A" />
                <rect x="90" y="-28" width="40" height="56" rx="8" fill="#7BA7CC" />
              </g>
            </svg>
          </motion.div>
          <motion.span
            className="text-sm font-bold text-neu-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            FitTrack
          </motion.span>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if needed
  if (needsOnboarding) {
    return (
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
