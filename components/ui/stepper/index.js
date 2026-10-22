// ============================================================================
// STEPPER COMPONENT
// Step indicator for multi-step flows (checkout, forms, onboarding, etc.)
// ============================================================================

/**
 * @typedef {Object} Step
 * @property {string} label - Display label for the step
 * @property {string} [value] - Unique identifier (defaults to index)
 * @property {boolean} [disabled] - Whether step is clickable
 */

/**
 * Stepper component for multi-step flows
 *
 * @example
 * <app-stepper
 *   steps="{{ steps }}"
 *   current="{{ currentStep }}"
 *   bind:change="onStepChange"
 * />
 *
 * @fires change - When user taps a step (detail: { value, index })
 */
Component({
  properties: {
    /** Array of step objects or labels */
    steps: {
      type: Array,
      value: [],
    },
    /** Current active step (value or index) */
    current: {
      type: null,
      value: 0,
    },
    /** Whether to show connecting lines between steps */
    showLines: {
      type: Boolean,
      value: true,
    },
    /** Whether steps are clickable */
    clickable: {
      type: Boolean,
      value: false,
    },
    /** Visual style variant: 'default' | 'compact' | 'pill' */
    variant: {
      type: String,
      value: 'default',
    },
  },

  data: {
    normalizedSteps: [],
    currentIndex: 0,
  },

  observers: {
    'steps, current': function (steps, current) {
      this.normalizeSteps(steps, current);
    },
  },

  lifetimes: {
    attached() {
      this.normalizeSteps(this.data.steps, this.data.current);
    },
  },

  methods: {
    normalizeSteps(steps, current) {
      if (!Array.isArray(steps)) return;

      const normalized = steps.map((step, index) => {
        if (typeof step === 'string') {
          return { label: step, value: String(index), index };
        }
        return {
          label: step.label || `Step ${index + 1}`,
          value: step.value !== undefined ? String(step.value) : String(index),
          index,
          disabled: step.disabled || false,
        };
      });

      let currentIndex = 0;
      if (typeof current === 'number') {
        currentIndex = current;
      } else {
        const found = normalized.findIndex((s) => s.value === String(current));
        currentIndex = found >= 0 ? found : 0;
      }

      this.setData({
        normalizedSteps: normalized,
        currentIndex,
      });
    },

    onStepTap(e) {
      if (!this.data.clickable) return;

      const { index } = e.currentTarget.dataset;
      const step = this.data.normalizedSteps[index];

      if (step?.disabled) return;

      this.triggerEvent('change', {
        value: step.value,
        index,
        label: step.label,
      });
    },
  },
});
