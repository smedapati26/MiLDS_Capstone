<<<<<<< HEAD
"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# CurrentApp/MILDS/app/urls.py
from django.contrib import admin
from django.urls import path, include
from .api import api  # add this import

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("app.back_end.urls")),
    path("api/", api.urls),  # add this line if missing
]
=======
'''
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("app.back_end.urls")),  # all /api/* go to back_end/urls.py
]
'''
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("app.back_end.urls")),  # Layout B include
]
>>>>>>> 94930a1e (changes for axios)
