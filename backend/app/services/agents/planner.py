import json
from g4f.client import Client

def run(input_data: dict, memory_context: str) -> dict:
    """
    Planner Agent
    Uses GPT4Free (g4f) to generate the base itinerary with XAI reasoning.
    """
    print("Planner Agent Running...")

    client = Client()

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

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    content = response.choices[0].message.content
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        return json.loads(content.strip())
    except Exception as e:
        print(f"Error parsing g4f response: {e}")
        return {
            "destination": input_data.get("destination"),
            "days": input_data.get("days"),
            "itinerary": [],
            "metadata": {"source": "ErrorFallback", "reasoning": "Failed to parse AI response."}
        }
