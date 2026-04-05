from app.services.agents import planner, budget, expert, critic, memory

def generate_trip(input_data: dict) -> dict:
    """
    Orchestrates the multi-agent travel planning system with XAI and Adaptive Loop.
    """
    # 1. Retrieve past user preferences and context
    mem_result = memory.retrieve(input_data)
    mem_context = mem_result.get("context", "")

    max_retries = 2
    attempt = 0
    plan = None
    reasoning_log = []

    while attempt < max_retries:
        attempt += 1
        print(f"Generation Attempt {attempt}...")

        # 2. Planner Agent drafts the initial itinerary
        plan = planner.run(input_data, mem_context)
        reasoning_log.append(f"Planner: {plan.get('metadata', {}).get('reasoning', 'No reasoning provided.')}")

        # 3. Budget Agent refines the itinerary based on cost constraints
        plan = budget.run(plan, input_data.get("budget", 0))
        reasoning_log.append(f"Budget: {plan.get('metadata', {}).get('reasoning', 'No reasoning provided.')}")

        # 4. Local Expert Agent augments with hidden gems
        plan = expert.run(plan)
        reasoning_log.append(f"Expert: {plan.get('metadata', {}).get('reasoning', 'No reasoning provided.')}")

        # 5. Critic Agent does a final review
        plan = critic.run(plan)
        reasoning_log.append(f"Critic: {plan.get('metadata', {}).get('reasoning', 'No reasoning provided.')}")

        # Check if critic approved
        if plan.get("metadata", {}).get("critic_approved", True):
            break
        else:
            print("Critic rejected the plan. Retrying...")

    # 6. Finalize metadata with XAI reasoning trace
    plan["metadata"]["xai_reasoning"] = " | ".join(reasoning_log)
    plan["metadata"]["mem_context"] = mem_context

    # 7. Store the new plan back to memory with user context
    memory.store(input_data, plan)

    return plan
