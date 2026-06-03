from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('criar-cliente/', views.criar_cliente_view, name='criar_cliente'),
    path('editar-cliente/<int:id_cliente>/', views.editar_cliente_view, name='editar_cliente'),
    path('eliminar-cliente/<int:id_cliente>/', views.eliminar_cliente_view, name='eliminar_cliente'),
]