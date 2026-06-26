from django.urls import path
from . import views

urlpatterns = [
    path('', views.pagina_entrada, name='index'),
    path('servico/criar/', views.criar_servico, name='criar_servico'),
    path('servico/eliminar/<int:servico_id>/', views.eliminar_servico, name='eliminar_servico'),
    path('utilizador/criar/', views.criar_utilizador, name='criar_utilizador'), # Nova rota
    path('utilizador/eliminar/<int:user_id>/', views.eliminar_utilizador, name='eliminar_utilizador'), # Nova rota
]