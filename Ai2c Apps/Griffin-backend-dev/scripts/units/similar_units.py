import numpy as np
from django.db.models import Count
from sklearn.neighbors import NearestNeighbors

from aircraft.models import Aircraft
from auto_dsr.models import Unit


def get_unit_feature_vectors():
    # Get all airframe models
    all_models = Aircraft.objects.values_list("airframe__model", flat=True).distinct()
    # Build feature vectors for each unit
    unit_vectors = []
    unit_ids = []
    for unit in Unit.objects.all():
        model_counts = Aircraft.objects.filter(uic=unit).values("airframe__model").annotate(count=Count("serial"))
        # Convert to a fixed-size vector
        model_count_dict = {m["airframe__model"]: m["count"] for m in model_counts}
        feature_vector = np.array([model_count_dict.get(model, 0) for model in all_models])
        unit_vectors.append(feature_vector)
        unit_ids.append(unit.uic)
    unit_vectors = np.array(unit_vectors)
    knn = NearestNeighbors(n_neighbors=10, metric="euclidean")
    knn.fit(unit_vectors)
    return knn, unit_vectors, unit_ids


def update_similar_units_knn(knn, unit_vectors, unit_ids):
    # Find the index of the unit_id in unit_ids
    for unit_id in unit_ids:
        unit = Unit.objects.get(uic=unit_id)
        try:
            unit_index = unit_ids.index(unit_id)
        except ValueError:
            return []  # Unit not found
        # Get K nearest neighbors
        distances, indices = knn.kneighbors([unit_vectors[unit_index]])
        # Extract similar unit IDs, excluding the query unit itself
        similar_units = [unit_ids[i] for i in indices[0] if unit_ids[i] != unit_id]
        unit.similar_units = similar_units
        unit.save()
