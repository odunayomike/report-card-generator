import { useState, useEffect } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { API_BASE_URL } from '../config/env';
import confetti from 'canvas-confetti';

export default function OnboardingTour({ school, run, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);

  // Trigger confetti on first and last step
  useEffect(() => {
    if (run && (stepIndex === 0 || stepIndex === 8)) {
      // Delay confetti slightly to ensure modal is visible
      const timer = setTimeout(() => {
        if (stepIndex === 0) {
          // Welcome confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1990C8', '#66bded', '#33a7e7', '#FFC107', '#FF5722']
          });
        } else {
          // Success confetti - more celebratory!
          const count = 200;
          const defaults = {
            origin: { y: 0.7 },
            colors: ['#1990C8', '#66bded', '#33a7e7', '#FFC107', '#FF5722', '#4CAF50']
          };

          function fire(particleRatio, opts) {
            confetti({
              ...defaults,
              ...opts,
              particleCount: Math.floor(count * particleRatio)
            });
          }

          fire(0.25, {
            spread: 26,
            startVelocity: 55,
          });
          fire(0.2, {
            spread: 60,
          });
          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 45,
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [run, stepIndex]);

  // Define tour steps
  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">Welcome to SchoolHub! 🎉</h2>
          <p className="text-sm text-gray-700 mb-1">
            Hi <span className="font-semibold">{school?.school_name}</span>!
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Let's take a quick tour to help you get started with managing your school.
          </p>
          <p className="text-xs text-gray-600">
            This will only take 2 minutes. You can skip anytime!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar-students"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">Manage Students</h3>
          <p className="text-sm text-gray-700">
            Click here to view all your students, add new students, or import them in bulk.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="add-student-btn"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">Add Your First Student</h3>
          <p className="text-sm text-gray-700">
            Start by adding students to your school. You can add them one by one or import multiple students at once.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="create-report"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">Create Report Cards</h3>
          <p className="text-sm text-gray-700">
            Once you have students, you can create beautiful report cards with grades, comments, and attendance.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="manage-teachers"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">Add Teachers</h3>
          <p className="text-sm text-gray-700">
            Invite teachers to your school. They can mark attendance, create reports, and manage their classes.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="settings"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">Customize Settings</h3>
          <p className="text-sm text-gray-700">
            Configure your grading scale, assessment types, subjects, and other school-specific settings here.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="profile"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">School Profile</h3>
          <p className="text-sm text-gray-700">
            Update your school logo, motto, contact information, and branding colors from your profile.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="subscription-status"]',
      content: (
        <div>
          <h3 className="text-base font-bold mb-1">Subscription Status</h3>
          <p className="text-sm text-gray-700 mb-1">
            Keep track of your trial or subscription status here.
          </p>
          <p className="text-xs text-gray-600">
            {school?.subscription_status === 'trial'
              ? `You have ${school?.days_remaining || 0} days remaining in your free trial.`
              : 'Manage your subscription to continue using all features.'
            }
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">You're All Set! 🚀</h2>
          <p className="text-sm text-gray-700 mb-1">
            You now know the basics of SchoolHub!
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Feel free to explore and start managing your school.
          </p>
          <p className="text-xs text-gray-600">
            Need help? Click the help icon (?) anytime to replay this tour.
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = async (data) => {
    const { status, action, index, type } = data;

    // Update step index
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    // Tour finished or skipped
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Mark onboarding as completed
      try {
        const response = await fetch(`${API_BASE_URL}/school/complete-onboarding`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Wait a bit for database to commit
          await new Promise(resolve => setTimeout(resolve, 500));

          // Call parent completion handler to refresh school data
          if (onComplete) {
            onComplete();
          }
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Still call onComplete even if there's an error
        if (onComplete) {
          onComplete();
        }
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#1990C8', // SchoolHub brand color
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 16,
        },
        tooltipContent: {
          padding: '8px 0',
        },
        buttonNext: {
          backgroundColor: '#1990C8',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: '13px',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 10,
          fontSize: '13px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '13px',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
