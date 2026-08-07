"""
count_state_manager.py
======================
Maintains total_in, total_out, and derives current passenger count.

This is the single source of truth for the count.
Only this class writes to the count — no other module does.
"""

import logging

logger = logging.getLogger(__name__)


class CountStateManager:
    """
    Applies crossing events to maintain an accurate passenger count.

    Usage:
        manager = CountStateManager()
        manager.apply_events(events)   # events from DirectionCounter
        print(manager.current_count)
    """

    def __init__(self, initial_count: int = 0):
        self._total_in: int = initial_count
        self._total_out: int = 0
        self._last_sent_count: int = initial_count

    # ── Public API ────────────────────────────────────────────────────────────

    def apply_events(self, events: list[dict]) -> bool:
        """
        Apply a list of crossing events.

        Returns True if the count changed (signals that an API send is needed).
        """
        if not events:
            return False

        before = self.current_count

        for event in events:
            if event["direction"] == "enter":
                self._total_in += 1
                logger.info(
                    "ENTER  total_in=%d  total_out=%d  current=%d",
                    self._total_in, self._total_out, self.current_count,
                )
            elif event["direction"] == "exit":
                # Never go below zero
                if self._total_out < self._total_in:
                    self._total_out += 1
                logger.info(
                    "EXIT   total_in=%d  total_out=%d  current=%d",
                    self._total_in, self._total_out, self.current_count,
                )

        return self.current_count != before

    @property
    def current_count(self) -> int:
        """Absolute current passenger count (never negative)."""
        return max(0, self._total_in - self._total_out)

    @property
    def total_in(self) -> int:
        return self._total_in

    @property
    def total_out(self) -> int:
        return self._total_out

    def has_changed_since_last_send(self) -> bool:
        return self.current_count != self._last_sent_count

    def mark_sent(self):
        """Call after a successful API send to track change state."""
        self._last_sent_count = self.current_count

    def reset(self):
        """Reset all counts (call when a new trip starts)."""
        self._total_in = 0
        self._total_out = 0
        self._last_sent_count = 0
        logger.info("CountStateManager reset.")