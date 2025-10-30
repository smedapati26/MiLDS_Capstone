# Capstone_Base

This repository serves as the base code for the **XE401–XE402 Capstone Project**.

# Project Overview

* **Project Name:** MILDS  
* **Team Members:** CDTs Courville, Fuller, Medapati, Notaro, and Stoltzfus  

The goal of this project is to develop an application that enables Observer/Controllers (OCs) at the National Training Center (NTC) to analyze and leverage information more effectively. The application will integrate data from multiple sources and tools into a single, cohesive platform to streamline workflows and test maintainers and logisticians at training centers.

# Repository Structure (view from code tab in GitHub)

.
├─ CurrentApp/
│  └─ MILDS/
│     ├─ manage.py
│     ├─ app/
│     │  ├─ settings.py
│     │  ├─ urls.py
│     │  └─ ...
│     ├─ app/back_end/
│     │  ├─ apps.py
│     │  ├─ models.py
│     │  ├─ migrations/
│     │  └─ ...
│     └─ fixtures/
│        └─ aircraft_data.json
├─ docs/
├─ tests/
└─ README.md

# Requirements

Python 3.11 or 3.12 (recommended 3.12). Do not use 3.14 with this Django version.

Git

PowerShell

# Getting Started

* Clone this repository:  
  ```bash
  git clone git@github.com:usma-eecs/ay26-team-repo-5-milds.git

cd ay26-team-repo-5-milds\CurrentApp\MILDS

Create & activate a virtual environment

py -0p                     # shows installed Pythons; look for -3.12 or -3.11
py -3.12 -m venv .venv     # or use -3.11 if 3.12 isn't installed
.\.venv\Scripts\Activate.ps1

If activation is blocked, run once:
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

Install dependencies

pip install -r requirements.txt

Initialize the database & load demo data

python manage.py migrate
python manage.py loaddata fixtures\aircraft_data.json

python manage.py runserver

# Useful commands from terminal (.venv):

# Count all Aircraft
python manage.py shell -c "from app.back_end.models import Aircraft as A; print(A.objects.count())"

# Show first 10 (pk, model_name, status)
python manage.py shell -c "from app.back_end.models import Aircraft as A; print(list(A.objects.order_by('pk').values('pk','model_name','status')[:10]))"

# FMC aircraft in WDDRA0 (pk, model_name, unit)
python manage.py shell -c "from app.back_end.models import Aircraft as A; print(list(A.objects.filter(status='FMC', current_unit='WDDRA0').values('pk','model_name','current_unit')))"

# Down birds (NMCM/NMCS) with notes (pk, model_name, remarks)
python manage.py shell -c "from app.back_end.models import Aircraft as A; print(list(A.objects.filter(status__startswith='NMC').exclude(remarks='').values('pk','model_name','remarks')[:10]))"