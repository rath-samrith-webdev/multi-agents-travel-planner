import json
from g4f.client import Client

def run(plan: dict) -> dict:
    """
    Local Expert Agent
    Injects local gems with XAI reasoning.
    """
    print("Expert Agent adding local gems...")

    client = Client()

    prompt = f"""
    You are a local tour guide.
    Add local, non-touristy experiences to this itinerary JSON.
    Replace 1-2 generic activities per day with hidden gems.

    Current Itinerary:
    {json.dumps(plan)}

    Return the EXACT same JSON format, but:
    1. Replace some activities with local hidden gems.
    2. Add a 'reasoning' field to 'metadata' explaining why these gems were added.

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
        new_plan["metadata"]["expert_curated"] = True
        return new_plan
    except Exception as e:
        print(f"Error parsing expert g4f: {e}")
        plan["metadata"]["expert_curated"] = False
        plan["metadata"]["reasoning"] = "Expert curation failed."
        return plan
