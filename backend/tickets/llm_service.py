import json
import re
import logging
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

VALID_CATEGORIES = {'billing', 'technical', 'account', 'general'}
VALID_PRIORITIES = {'low', 'medium', 'high', 'critical'}

CLASSIFICATION_PROMPT = """You are a support ticket classifier. Analyze the following support ticket description and classify it.

You must return ONLY a valid JSON object with exactly two fields:
- "suggested_category": must be one of: billing, technical, account, general
- "suggested_priority": must be one of: low, medium, high, critical

Classification guidelines:
- "billing": payment issues, charges, invoices, subscriptions, refunds, pricing
- "technical": bugs, errors, crashes, performance, integrations, API issues
- "account": login issues, password resets, profile changes, permissions, access
- "general": feature requests, questions, feedback, other inquiries

Priority guidelines:
- "critical": system down, data loss, security breach, complete inability to use service
- "high": significant functionality broken, major business impact, urgent deadline
- "medium": moderate inconvenience, workaround exists, non-urgent issues
- "low": minor cosmetic issues, general questions, feature requests

Ticket description:
{description}

Return ONLY the JSON object, no markdown, no explanation:"""


def parse_llm_response(text):
    """
    Parse LLM response text to extract JSON.
    Handles Gemini's tendency to wrap JSON in ```json ... ``` markdown blocks.
    Validates that category and priority are valid choices.
    """
    text = text.strip()

    # Extract JSON object — handles cases where Gemini wraps in markdown
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group())
            category = data.get('suggested_category', '').lower().strip()
            priority = data.get('suggested_priority', '').lower().strip()

            if category in VALID_CATEGORIES and priority in VALID_PRIORITIES:
                return {
                    'suggested_category': category,
                    'suggested_priority': priority,
                }

            logger.warning(
                f"LLM returned invalid values: category='{category}', priority='{priority}'"
            )
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse LLM JSON response: {e}")

    return None


def classify_ticket(description):
    """
    Call Gemini API to classify a support ticket description.
    Returns dict with suggested_category and suggested_priority, or None on failure.
    Handles all failure modes gracefully — the ticket system works without LLM.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.info("GEMINI_API_KEY not set — skipping LLM classification")
        return None

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = CLASSIFICATION_PROMPT.format(description=description)
        response = model.generate_content(prompt)

        if response and response.text:
            result = parse_llm_response(response.text)
            if result:
                logger.info(f"LLM classified ticket: {result}")
                return result
            else:
                logger.warning(f"LLM returned unparseable response: {response.text[:200]}")
        else:
            logger.warning("LLM returned empty response")

    except Exception as e:
        logger.error(f"LLM classification failed: {type(e).__name__}: {e}")

    return None
