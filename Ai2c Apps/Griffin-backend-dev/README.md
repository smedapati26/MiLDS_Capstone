# griffin.ai

Predictive maintenance for U.S. Army Aviation


## Backend
Prerequisites:
- Git: https://git-scm.com/
- Python: https://www.python.org
- (Optional) IDE: https://code.visualstudio.com

### Django Set Up
1. Install Python
2. Open termainal in `griffin-ai/griffin_ai`
3. Create Virtual Environment: Self-contained directory tree that contains specific versions of python and packages for specific project.
    ```
    # py -m venv <path/to/virtualEnvironment>
    py -m venv .venv

    # Activate environment 
    .venv/scripts/activate
        # Type "deactivate" command to deactivate the environment
    ```

4. Posit PYPI registry configuration
    ```
    # Set Global trusted host for (Python package manager)
    pip config set global.trusted-host rspm.dse.futures.army.mil 
        
    # Set registry index
    pip config set global.index-url https://rspm.dse.futures.army.mil/pypi-dse/latest/simple
    
    # Upgrade pip
    py -m pip install --upgrade pip
    ```
5. Navigate to `griffin-ai/griffin_ai` and enter commands to install required packages:
    ```
    # Activate Virtual Environment
    .venv/scripts/activate
        
    # Install packages
    pip install -r ./requirements.txt

    # Deactivate Virtual Environment
    deactivate
    ```
6. Run Django Server
    ```
    # Run django server
    py manage.py runserver --settings=griffin_ai.settings.dev.dse
    ```

Extra Django Commands:
```
# After model changes run makemigrations command to then save/migrate to save changes
py manage.py makemigrations --settings=griffin_ai.settings.dev.dse
py manage.py migrate --settings=griffin_ai.settings.dev.dse
 

py manage.py createsuperuser --settings=griffin_ai.settings.dev.dse
# Use .local if .dse does not work.
```
