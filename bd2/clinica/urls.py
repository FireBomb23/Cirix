from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('doente/novo/', views.registar_doente, name='novo_doente'),
    path('salvar-doente/', views.salvar_doente, name='gravar_doente'),
    path('doentes/', views.lista_doentes, name='lista_doentes'),
    
    # Rotas para os botões da tabela
    path('doente/eliminar/<int:id>/', views.eliminar_doente, name='eliminar_doente'),
    path('doente/editar/<int:id>/', views.editar_doente, name='editar_doente'),
    path('doente/atualizar/<int:id>/', views.atualizar_doente, name='atualizar_doente'),
]