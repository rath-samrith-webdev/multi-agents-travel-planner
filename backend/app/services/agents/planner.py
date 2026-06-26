import json
# pyrefly: ignore [missing-import]
from openai import OpenAI
import os

def run(input_data: dict, memory_context: str) -> dict:
    """
    Planner Agent
    Uses GPT4Free (g4f) to generate the base itinerary with XAI reasoning.
    """
    print("Planner Agent Running...")

    prompt = f"""
    You are a professional travel planner.
    Destination: {input_data.get('destination')}
    Number of Days: {input_data.get('days')}
    User Preferences: {input_data.get('preferences')}
    Past Context: {memory_context}

    Output a JSON object containing:
    1. A 'reasoning' field explaining why you chose these activities based on preferences and past context.
    2. A day-by-day itinerary with realistic timings, activity names, costs, and local tips.

    Format exactly like this strictly:
    {{
        "destination": "{input_data.get('destination')}",
        "days": {input_data.get('days')},
        "itinerary": [
            {{
                "day": 1,
                "activities": [
                    {{"name": "Activity name", "time": "HH:MM AM/PM", "cost": 0, "notes": "Local tip"}}
                ]
            }}
        ],
        "metadata": {{
            "source": "PlannerAgent",
            "reasoning": "Your explanation here"
        }}
    }}
    """

    try:
        client = OpenAI(
            api_key=os.environ.get("GEMINI_API_KEY"),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            timeout=30.0,
            max_retries=1,
        )
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        return json.loads(content.strip())
    except Exception as e:
        print(f"Error generating g4f response: {e}")
        return {
            "destination": input_data.get("destination"),
            "days": input_data.get("days"),
            "itinerary": [
                {
                    "day": 1,
                    "activities": [
                        {"name": f"Explore {input_data.get('destination')}", "time": "10:00 AM", "cost": 0, "notes": "Local tip: Relax and enjoy."}
                    ]
                }
            ],
            "metadata": {"source": "ErrorFallback", "reasoning": "Failed to generate AI response. Using fallback data."}
        }
