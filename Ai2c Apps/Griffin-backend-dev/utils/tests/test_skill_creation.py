from personnel.models import Skill


def create_single_skill(asi_code: str = "ASI01", description: str = "ASI Skill Code 1"):
    return Skill.objects.create(asi_code=asi_code, description=description)


def create_n_skills(number: int = 5, prefix: str = "ASI"):
    """
    Creates N Skills
    """
    skills = []
    for i in range(1, number + 1):
        skills.append(create_single_skill(asi_code=f"{prefix}{i}", description=f"ASI Skill Code {i}"))

    return skills
