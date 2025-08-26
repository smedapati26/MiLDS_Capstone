# aircraft/urls.py
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.list_aircraft, name='list_aircraft'),
    path('aircraft/new/', views.create_aircraft, name='create_aircraft'),
    path('aircraft/<int:pk>/edit/', views.update_aircraft, name='update_aircraft'),
    path('aircraft/recent/', views.recent_pushes, name='recent_pushes'),
    path('aircraft/<int:pk>/delete/', views.delete_aircraft, name='delete_aircraft'),
    path('personnel/', views.list_personnel,name='list_personnel'),
    path('personnel/add/',views.create_personnel, name='create_personnel'),
    path('personnel/<str:pk>/edit/',views.update_personnel, name='update_personnel'),
    path('personnel/<str:pk>/delete/', views.delete_personnel, name='delete_personnel'),

    
    path("api/aircraft/", views.api_get_aircraft, name="api_get_aircraft"),
    path("api/push-aircraft/", views.api_push_aircraft, name="api_push_aircraft"),
    path("api/pull-personnel/", views.api_get_personnel, name="api_get_personnel"),
    path("api/push-personnel/", views.api_push_personnel, name="api_push_personnel"),

]
