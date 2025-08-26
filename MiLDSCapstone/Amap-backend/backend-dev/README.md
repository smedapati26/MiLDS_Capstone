# A-MAP (Backend)

U.S. Army Aviation Maintainer Analytics Platform Backend Repository

## Backend

Prerequisites:
- Git: https://git-scm.com/
- Python: https://www.python.org
- (Optional) IDE: https://code.visualstudio.com


### Django Set Up

1. Install Python
2. Open termainal in `amap`
3. Create Virtual Environment: Self-contained directory tree that contains specific versions of python and packages for specific project.
    ```
    # C:\Users\<user>\AppData\Local\Programs\Python\<python version>\python.exe -m venv <path\to\virtualEnvironment>
    C:\Users\<user>\AppData\Local\Programs\Python\Python311\python.exe -m venv .venv

    # Activate environment 
    .\.venv\Scripts\activate
    
    ```

4. Posit PYPI registry configuration
    ```
    # Set Global trusted host for (Python package manager)
    pip config set global.trusted-host rspm.dse.futures.army.mil 
        
    # Set registry index
    pip config set global.index-url https://rspm.dse.futures.army.mil/pypi-dse/latest/simple
    
    # Upgrade pip
    C:\Users\<user>\AppData\Local\Programs\Python\Python311\python.exe -m pip install --upgrade pip
    ```
5. Enter commands to install required packages:
    ```        
    # Install packages
    pip install -r ./requirements.txt
    ```
6. Configure .env file in amap/settings/dev/dse
    ```
    create .env with global vars - DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_DRIVER
    ```
7. Run Django Server
    ```
    # Run django server
    py manage.py runserver --settings=amap.settings.dev.dse
    ```


Extra Django Commands:

```
# After model changes run makemigrations command to automatically create file designating necessary database changes
py manage.py makemigrations --settings=amap.settings.dev.dse
# Apply those changes using the migrate command
py manage.py migrate --settings=amap.settings.dev.dse
 

py manage.py createsuperuser --settings=amap.settings.dev.dse
# Use .local if .dse does not work.
```
