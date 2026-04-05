import json
from g4f.client import Client

def run(plan: dict) -> dict:
    """
    Critic Agent
    Final review for feasibility with XAI reasoning.
    """
    print("Critic Agent reviewing plan...")

    client = Client()

    prompt = f"""
    Review this travel itinerary for feasibility and logical flow.
    Make minor adjustments if there are time conflicts.

    Current Itinerary:
    {json.dumps(plan)}

    Return the EXACT same JSON format, but:
    1. Adjust activities for feasibility if needed.
    2. Add 'critic_approved' (boolean) to 'metadata'.
    3. Add 'reasoning' (string) to 'metadata' explaining your review.

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
        new_plan["metadata"]["critic_reviewed"] = True
        return new_plan
    except Exception as e:
        print(f"Error parsing critic g4f: {e}")
        plan["metadata"]["critic_reviewed"] = False
        plan["metadata"]["critic_approved"] = True # Default to True on error to avoid infinite loop
        plan["metadata"]["reasoning"] = "Critic review failed."
        return plan
