from django.urls import path
from .views import health, run_code

urlpatterns = [
    path("health", health),
    path("run", run_code),
]
