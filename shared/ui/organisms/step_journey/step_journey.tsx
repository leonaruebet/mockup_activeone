"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils";
import { Typography } from "../../atoms/typography";
import { Stack } from "../../templates/stack/stack";
import { Button } from "../../atoms/button";

type StepJourneyStatus = "completed" | "current" | "upcoming";

export interface StepJourneyItem {
  id: string;
  label: string;
  description?: string;
  href?: string;
  status: StepJourneyStatus;
}

export interface StepJourneyProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepJourneyItem[];
  onStepSelect?: (step: StepJourneyItem) => void;
  correlationId?: string;
  showOnlyCurrentStep?: boolean;
  showNavigationButtons?: boolean;
}

/**
 * Display a horizontal journey indicator highlighting the user's current step.
 * Includes optional navigation callbacks and mounts/unmounts logs for observability.
 *
 * @param showOnlyCurrentStep - If true, only displays the current step with navigation buttons
 * @param showNavigationButtons - If true, shows prev/next navigation buttons (default: true when showOnlyCurrentStep is true)
 */
export function StepJourney({
  steps,
  onStepSelect,
  className,
  correlationId,
  showOnlyCurrentStep = false,
  showNavigationButtons = false,
  ...props
}: StepJourneyProps) {
  const correlationSignature = React.useMemo(
    () => correlationId ?? "n/a",
    [correlationId]
  );

  React.useEffect(() => {
    console.info("[StepJourney] mount", {
      timestamp: new Date().toISOString(),
      correlation_id: correlationSignature,
      step_count: steps.length,
      show_only_current: showOnlyCurrentStep,
    });

    return () => {
      console.info("[StepJourney] unmount", {
        timestamp: new Date().toISOString(),
        correlation_id: correlationSignature,
        step_count: steps.length,
      });
    };
  }, [correlationSignature, steps.length, showOnlyCurrentStep]);

  const currentStepIndex = React.useMemo(
    () => steps.findIndex((step) => step.status === "current"),
    [steps]
  );

  const currentStep = React.useMemo(
    () => steps[currentStepIndex],
    [steps, currentStepIndex]
  );

  const canGoPrevious = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;

  const handleStepSelect = React.useCallback(
    (step: StepJourneyItem) => {
      console.info("[StepJourney] step_select", {
        timestamp: new Date().toISOString(),
        correlation_id: correlationSignature,
        step_id: step.id,
        step_status: step.status,
      });

      if (onStepSelect) {
        onStepSelect(step);
      }
    },
    [correlationSignature, onStepSelect]
  );

  const handlePrevious = React.useCallback(() => {
    if (canGoPrevious) {
      const previousStep = steps[currentStepIndex - 1];
      handleStepSelect(previousStep);
    }
  }, [canGoPrevious, currentStepIndex, steps, handleStepSelect]);

  const handleNext = React.useCallback(() => {
    if (canGoNext) {
      const nextStep = steps[currentStepIndex + 1];
      handleStepSelect(nextStep);
    }
  }, [canGoNext, currentStepIndex, steps, handleStepSelect]);

  // Render compact view with only current step
  if (showOnlyCurrentStep && currentStep) {
    const statusClasses = getStepStatusClasses(currentStep.status);
    const statusDotClasses = getStepDotClasses(currentStep.status);

    return (
      <Stack
        spacing="sm"
        className={cn("w-full", className)}
        {...props}
      >
        {/* Current Step Display */}
        <div
          className={cn(
            "flex flex-1 flex-col items-start rounded-lg border border-transparent px-4 py-3",
            statusClasses
          )}
        >
          <div className="flex items-center gap-2 w-full">
            <span
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                statusDotClasses
              )}
            >
              {currentStepIndex + 1}
            </span>
            <Typography
              as="span"
              variant="body-m"
              weight="semibold"
              className="text-current flex-1"
            >
              {currentStep.label}
            </Typography>
            <Typography
              as="span"
              variant="body-s"
              className="text-muted-foreground"
            >
              Step {currentStepIndex + 1} of {steps.length}
            </Typography>
          </div>
          {currentStep.description && (
            <Typography
              as="span"
              variant="body-s"
              className="mt-2 text-muted-foreground leading-relaxed pl-8"
            >
              {currentStep.description}
            </Typography>
          )}
        </div>
      </Stack>
    );
  }

  // Render full view with all steps
  return (
    <Stack
      spacing="sm"
      className={cn("w-full overflow-x-auto pb-2", className)}
      {...props}
    >
      <div className="flex items-start gap-2 md:gap-4 min-w-[320px]">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const statusClasses = getStepStatusClasses(step.status);
          const statusDotClasses = getStepDotClasses(step.status);

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => handleStepSelect(step)}
                className={cn(
                  "flex min-w-[180px] max-w-[280px] flex-col items-start rounded-lg border border-transparent px-4 py-3 text-left transition-colors hover:border-current/20",
                  statusClasses
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      statusDotClasses
                    )}
                  >
                    {index + 1}
                  </span>
                  <Typography
                    as="span"
                    variant="body-m"
                    weight="semibold"
                    className="text-current flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {step.label}
                  </Typography>
                </div>
                {step.description && (
                  <Typography
                    as="span"
                    variant="body-s"
                    className="mt-2 text-muted-foreground leading-relaxed pl-8"
                  >
                    {step.description}
                  </Typography>
                )}
              </button>

              {!isLast && (
                <div className="flex-1 flex items-center min-w-[20px] pt-3">
                  <div className="h-px w-full bg-muted" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Stack>
  );
}

/**
 * Map a journey step status to its container classes.
 * @param status Step status variant.
 */
function getStepStatusClasses(status: StepJourneyStatus): string {
  switch (status) {
    case "completed":
      return "bg-stem-green-50 text-stem-green-800 dark:bg-stem-green-900/20 dark:text-stem-green-200";
    case "current":
      return "bg-stem-green-50 text-stem-green-800 dark:bg-stem-green-900/20 dark:text-stem-green-200";
    default:
      return "bg-muted/30 text-muted-foreground";
  }
}

/**
 * Map a journey step status to its indicator dot classes.
 * @param status Step status variant.
 */
function getStepDotClasses(status: StepJourneyStatus): string {
  switch (status) {
    case "completed":
      return "bg-stem-green-600 text-white";
    case "current":
      return "bg-stem-green-600 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}
