from django.db.models import Count, Q, Min
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer, ClassifySerializer
from .llm_service import classify_ticket


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket CRUD operations.

    POST   /api/tickets/           → Create a new ticket (returns 201)
    GET    /api/tickets/           → List all tickets, newest first
                                     Supports ?category=, ?priority=, ?status=, ?search=
    PATCH  /api/tickets/<id>/      → Update a ticket
    GET    /api/tickets/stats/     → Aggregated statistics (DB-level)
    POST   /api/tickets/classify/  → LLM-suggested category + priority
    """
    serializer_class = TicketSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        """
        Returns tickets ordered newest first.
        Supports filtering by category, priority, status, and search (title + description).
        All filters can be combined.
        """
        queryset = Ticket.objects.all().order_by('-created_at')

        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        ticket_status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if ticket_status:
            queryset = queryset.filter(status=ticket_status)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Return aggregated statistics using DB-level aggregation.
        Uses Django ORM aggregate() with Count + filter — NO Python-level loops.

        avg_tickets_per_day: hybrid approach (DB aggregation + minimal Python division).
        This is acceptable — pure DB-level division using ExpressionWrapper is fragile.
        """
        stats = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            open_tickets=Count('id', filter=Q(status='open')),
            in_progress_tickets=Count('id', filter=Q(status='in_progress')),
            resolved_tickets=Count('id', filter=Q(status='resolved')),
            earliest=Min('created_at'),
            # Priority breakdown — DB-level aggregation, NO Python loops
            priority_low=Count('id', filter=Q(priority='low')),
            priority_medium=Count('id', filter=Q(priority='medium')),
            priority_high=Count('id', filter=Q(priority='high')),
            priority_critical=Count('id', filter=Q(priority='critical')),
            # Category breakdown — DB-level aggregation, NO Python loops
            category_billing=Count('id', filter=Q(category='billing')),
            category_technical=Count('id', filter=Q(category='technical')),
            category_account=Count('id', filter=Q(category='account')),
            category_general=Count('id', filter=Q(category='general')),
        )

        # avg_tickets_per_day: hybrid (DB aggregation + minimal Python division)
        total = stats['total_tickets']
        earliest = stats['earliest']
        if earliest:
            days = max((timezone.now() - earliest).days, 1)
            avg_per_day = round(total / days, 1)
        else:
            avg_per_day = 0

        return Response({
            'total_tickets': total,
            'open_tickets': stats['open_tickets'],
            'in_progress_tickets': stats['in_progress_tickets'],
            'resolved_tickets': stats['resolved_tickets'],
            'avg_tickets_per_day': avg_per_day,
            'priority_breakdown': {
                'low': stats['priority_low'],
                'medium': stats['priority_medium'],
                'high': stats['priority_high'],
                'critical': stats['priority_critical'],
            },
            'category_breakdown': {
                'billing': stats['category_billing'],
                'technical': stats['category_technical'],
                'account': stats['category_account'],
                'general': stats['category_general'],
            },
        })

    @action(detail=False, methods=['post'])
    def classify(self, request):
        """
        Send a description, get back LLM-suggested category + priority.
        Validates input before calling LLM — rejects empty/short descriptions.
        Returns 503 if LLM is unavailable or returns garbage.
        """
        serializer = ClassifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = classify_ticket(serializer.validated_data['description'])
        if result is None:
            return Response(
                {'error': 'Classification unavailable. Please select category and priority manually.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response(result)
