/**
 * Chip Group Component
 * Displays a horizontal, scrollable row of selectable chips.
 * The active chip is highlighted and a `change` event is emitted when a chip is tapped.
 *
 * @example
 * <app-chip-group
 *   items="{{ chipItems }}"
 *   activeId="{{ selectedChipId }}"
 *   bind:change="onChipChange"
 * />
 *
 * @property {Array} items - Array of chips to render; each item should include `id` and `label`.
 * @property {string} activeId - ID of the currently selected chip.
 *
 * @fires change - Emitted when a chip is tapped, with event detail `{ id }`.
 */
Component({
  properties: {
    items: {
      type: Array,
      value: []
    },
    activeId: {
      type: String,
      value: ''
    },
    edgeInset: {
      type: Number,
      value: 32
    }
  },

  methods: {
    handleTap(event) {
      const id = event.currentTarget.dataset.id;

      this.triggerEvent('change', {
        id
      });
    }
  }
});
