# Capstone_Base

This repository serves as the base code for the **XE401–XE402 Capstone Project**.

# Project Overview

* **Project Name:** MILDS  
* **Team Members:** CDTs Courville, Fuller, Medapati, Notaro, and Stoltzfus
* **Instructor**: COL Haynes
* **Advisor**: LTC Hutchinson
* **Project Owner**: Army Artificial Intelligence and Integration Center

The goal of this project is to develop an application that enables Observer/Controllers (OCs) at the National Training Center (NTC) to analyze and leverage information more effectively. The application will integrate data from multiple sources and tools into a single, cohesive platform to streamline workflows and test maintainers and logisticians at training centers.

## Repository Structure (view from code tab in GitHub)

CurrentApp/MILDS/
  app/
    back_end/
      models.py
      views.py
      urls.py
      forms.py
      migrations/
    template/
      base.html
      aircraft_*.html
      personnel_*.html
    api.py
    settings.py
    urls.py
  fixtures/
    aircraft_data.json
  manage.py
React

## Requirements

Python 3.11 or 3.12 (recommended 3.12). Do not use 3.14 with this Django version.

Git

PowerShell

## Getting Started

* Clone this repository:  
  ```bash
  git clone git@github.com:usma-eecs/ay26-team-repo-5-milds.git

cd ay26-team-repo-5-milds\CurrentApp\MILDS

### Create & activate a virtual environment

py -0p                     (shows installed Pythons; look for -3.12 or -3.11)

py -3.12 -m venv .venv     (or use -3.11 if 3.12 isn't installed) 

.venv\Scripts\Activate.ps1

If activation is blocked, run once:

Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

### Install dependencies

pip install django-ninja
pip install react

### Initialize the database & load demo data

python manage.py loaddata fixtures\aircraft_data.json
python manage.py migrate
python mange.py makemigrations
python manage.py runserver

### In split terminal
npm install
npm start

## Ai2c Appliction Install

Navigate to the README for Griffin and AMAP for more assistance on running these applications locally. 
## Must complete this step to load data in Griffin and AMAP
	py manage.py loaddata fixtures/Aircraft_data.json --settings=griffin_ai.settings.dev.local
	py manage.py loaddata fixtures/personnel_data.json --settings=amap.settings.dev.local

## Access admin page 
	add /admin at the end of url. Type in username and password
	example: http://127.0.0.1:8000/admin/
