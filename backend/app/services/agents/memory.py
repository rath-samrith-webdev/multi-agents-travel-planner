import faiss
import numpy as np
import os
import pickle
from sentence_transformers import SentenceTransformer

# Use a lightweight embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

FAISS_INDEX_PATH = "travel_memory.index"
METADATA_PATH = "travel_memory_meta.pkl"

def get_faiss_index(dimension):
    if os.path.exists(FAISS_INDEX_PATH):
        return faiss.read_index(FAISS_INDEX_PATH)
    return faiss.IndexFlatL2(dimension)

def retrieve(input_data: dict) -> dict:
    """
    Memory Agent - Retrieval
    Retrieve relevant past data using FAISS based on the destination and preferences.
    """
    print(f"Memory Agent retrieving context for {input_data.get('destination')}...")

    query = f"{input_data.get('destination')} {' '.join(input_data.get('preferences', []))}"
    query_vector = model.encode([query]).astype('float32')

    if not os.path.exists(FAISS_INDEX_PATH):
        return {"past_trips": [], "preferences": input_data.get("preferences", []), "avoid": []}

    index = faiss.read_index(FAISS_INDEX_PATH)
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)

    # Search for top 3 relevant past trips
    D, I = index.search(query_vector, k=3)

    results = []
    for idx in I[0]:
        if idx != -1 and idx < len(metadata):
            results.append(metadata[idx])

    return {
        "past_trips": results,
        "preferences": input_data.get("preferences", []),
        "context": "Based on your past trips, we noticed you enjoy " + ", ".join([r.get('destination') for r in results]) if results else ""
    }

def store(input_data: dict, output_plan: dict):
    """
    Memory Agent - Storage
    Store the new user's travel preferences and generated trips back into FAISS.
    """
    print("Memory Agent storing the newly generated itinerary into FAISS...")

    text_content = f"Trip to {output_plan.get('destination')} for {output_plan.get('days')} days. Preferences: {input_data.get('preferences')}"
    vector = model.encode([text_content]).astype('float32')

    dimension = vector.shape[1]
    index = get_faiss_index(dimension)

    # Load or initialize metadata
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "rb") as f:
            metadata = pickle.load(f)
    else:
        metadata = []

    index.add(vector)
    metadata.append({
        "destination": output_plan.get("destination"),
        "days": output_plan.get("days"),
        "preferences": input_data.get("preferences")
    })

    # Save index and metadata
    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(METADATA_PATH, "wb") as f:
        pickle.dump(metadata, f)
