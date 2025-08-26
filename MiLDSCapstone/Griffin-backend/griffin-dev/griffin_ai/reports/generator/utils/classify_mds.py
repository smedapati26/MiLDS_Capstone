def classify_mds(model: str) -> str:
    """
    'Classifies' a model by prepending a value to the start of its model name. Used to help sorting
    where you might want to sort by type and then model.

    @param model: (str) the model to classify
    @returns (str) the classified model
    """
    if "H-" in model:
        return "1_%s" % model
    elif "Q-" in model:
        return "2_%s" % model
    elif "C-" in model:
        return "3_%s" % model
    else:
        return model
