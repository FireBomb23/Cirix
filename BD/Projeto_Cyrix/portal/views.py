from django.shortcuts import render
from .basedados import db_ler_utilizadores  # Importa a tua query SQL nativa

def pagina_entrada(request):
    # Em vez de usar o ORM do Django, usamos a tua função SQL pura!
    lista_utilizadores = db_ler_utilizadores()
    
    # Passamos os dados para o HTML
    return render(request, 'portal/index.html', {'utilizadores': lista_utilizadores})