from django.core.exceptions import ValidationError
from django.db import models

from PTP.models.route import Route


class Vehicle(models.Model):
    OWNERSHIP_CHOICES = [
        ('government', 'Government'),
        ('driver', 'Driver'),
    ]

    vehicle_id = models.AutoField(primary_key=True, db_column='vehicle_id')
    vehicle_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=100)
    is_full = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    route = models.ForeignKey(Route, null=True, blank=True, on_delete=models.SET_NULL)
    ownership = models.CharField(max_length=20, choices=OWNERSHIP_CHOICES)

    # ── Passenger counting (AI-driven) ───────────────────────────────────────
    capacity = models.PositiveIntegerField(
        default=50,
        help_text="Maximum number of passengers this vehicle can hold.",
    )
    passenger_count = models.PositiveIntegerField(
        default=0,
        help_text="Current number of passengers on board. Updated by the AI camera service.",
    )
    # ─────────────────────────────────────────────────────────────────────────

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle'

    @property
    def occupancy_percentage(self) -> float:
        """Returns occupancy as a 0–100 float. Returns 0.0 if capacity is 0."""
        if self.capacity == 0:
            return 0.0
        return round((self.passenger_count / self.capacity) * 100, 1)

    def clean(self):
        if self.passenger_count > self.capacity:
            raise ValidationError({
                'passenger_count': (
                    f'passenger_count ({self.passenger_count}) cannot exceed '
                    f'capacity ({self.capacity}).'
                )
            })

    def save(self, *args, **kwargs):
        # Auto-update is_full based on AI count vs capacity
        if self.capacity > 0:
            self.is_full = self.passenger_count >= self.capacity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vehicle_type} - {self.vehicle_number}"