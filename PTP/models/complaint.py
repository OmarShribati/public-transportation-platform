from django.db import models

from PTP.models.user import User


class Complaint(models.Model):
    complaint_id = models.AutoField(primary_key=True, db_column='complaint_id')
    passenger = models.ForeignKey(User, related_name='complaints', on_delete=models.CASCADE)
    message = models.TextField()
    image = models.FileField(upload_to='complaints/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'complaint'

    def __str__(self):
        return f"{self.complaint_id} - {self.passenger_id}"
