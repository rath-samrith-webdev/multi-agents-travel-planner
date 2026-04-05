import json
from g4f.client import Client

def run(plan: dict, budget: float) -> dict:
    """
    Budget Agent
    Optimizes the itinerary cost with XAI reasoning.
    """
    print(f"Budget Agent refining for budget {budget}...")

    client = Client()

    prompt = f"""
    You are a financial travel advisor.
    Review this JSON itinerary and optimize it to fit a budget of ${budget}.
    Minimize cost where possible, maintain user preferences, and offer cheaper alternatives.

    Current Itinerary:
    {json.dumps(plan)}

    Return the EXACT same JSON format, but:
    1. Adjust 'cost', 'notes', and 'activities' to fit the budget.
    2. Add a 'reasoning' field to 'metadata' explaining your financial optimizations.

    Output ONLY the JSON.
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
        new_plan = json.loads(content.strip())
        new_plan["metadata"]["budget_checked"] = True
        return new_plan
    except Exception as e:
        print(f"Error parsing budget g4f: {e}")
        plan["metadata"]["budget_checked"] = False
        plan["metadata"]["reasoning"] = "Budget optimization failed."
        return plan
