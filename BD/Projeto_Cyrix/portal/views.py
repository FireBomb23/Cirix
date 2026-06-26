from django.shortcuts import render, redirect
from django.db import connection  # Import necessário para ler os utilizadores na view se quiseres, ou crias função no basededados
from .basedados import (
    db_ler_servicos,
    db_criar_servico,
    db_eliminar_servico,
    db_criar_utilizador,
    db_eliminar_utilizador,
    db_clientes_por_conformidade_nis2,
    db_top5_clientes_incidentes,
    db_documentos_por_cliente_mes,
    db_distribuicao_utilizadores_perfil,
    db_estado_tickets_tempo_medio
)

def pagina_entrada(request):
    # Vamos ler os utilizadores existentes para listar na tabela do painel
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, name, email, role, company FROM users ORDER BY id DESC")
        columns = [col[0] for col in cursor.description]
        lista_utilizadores = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        'servicos': db_ler_servicos(),
        'utilizadores': lista_utilizadores, # Adicionado aqui
        'nis2': db_clientes_por_conformidade_nis2(),
        'top5': db_top5_clientes_incidentes(),
        'documentos': db_documentos_por_cliente_mes(),
        'perfis': db_distribuicao_utilizadores_perfil(),
        'tickets': db_estado_tickets_tempo_medio(),
    }
    return render(request, 'portal/index.html', context)

def criar_servico(request):
    if request.method == "POST":
        title = request.POST.get('title')
        sort_order = request.POST.get('sort_order', 0)
        active = request.POST.get('active') == 'on'
        db_criar_servico(title, sort_order, active)
    return redirect('index')

def eliminar_servico(request, servico_id):
    db_eliminar_servico(servico_id)
    return redirect('index')

def criar_utilizador(request):
    if request.method == "POST":
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')
        company = request.POST.get('company')
        db_criar_utilizador(name, email, password, role, company)
    return redirect('index')

def eliminar_utilizador(request, user_id):
    db_eliminar_utilizador(user_id)
    return redirect('index')