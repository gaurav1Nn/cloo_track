from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """
    Single serializer for create, update, and list operations.
    Inherits choices from model fields — DRF auto-rejects invalid values
    on both POST and PATCH (e.g., {"status": "banana"} → 400).
    """

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'category', 'priority', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClassifySerializer(serializers.Serializer):
    """
    Validates input for the /api/tickets/classify/ endpoint.
    Rejects empty/missing descriptions before calling the LLM.
    """
    description = serializers.CharField(
        required=True,
        min_length=10,
        error_messages={
            'blank': 'Description is required for classification.',
            'min_length': 'Description is too short for meaningful classification (minimum 10 characters).',
        }
    )
