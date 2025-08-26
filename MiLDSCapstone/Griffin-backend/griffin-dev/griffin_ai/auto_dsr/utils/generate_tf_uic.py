from auto_dsr.models import Unit


def generate_tf_uic():
    """
    Generate a new UIC in the format TF-0000001 by incrementing from the previous max Task Force UIC.
    """
    # Find the last created UIC that starts with 'TF-'
    last_uic = Unit.objects.filter(uic__startswith="TF-").order_by("-uic").first()

    if not last_uic:
        return "TF-000001"

    # Extract the numerical part, increment it, and return in the desired format
    last_uic_number = int(last_uic.uic.split("-")[1])
    new_uic_number = last_uic_number + 1

    new_uic = "TF-{0:06}".format(new_uic_number)

    return new_uic
