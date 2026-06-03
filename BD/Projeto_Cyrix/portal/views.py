from django.shortcuts import render, redirect
from .basedados import (
    obter_clientes_por_conformidade,
    obter_top5_clientes_incidentes,
    obter_documentos_por_cliente_mes,
    obter_distribuicao_perfil_utilizadores,
    obter_estado_e_tempo_medio_tickets,
    obter_todos_clientes,  # Nova importação
    inserir_cliente,
    obter_cliente_por_id,
    atualizar_cliente,
    eliminar_cliente_db
)

# 1. Vista do Dashboard Avançado
def dashboard_view(request):
    context = {
        'lista_clientes': obter_todos_clientes(),  # Passa os clientes reais para o CRUD
        'dados_conformidade': obter_clientes_por_conformidade(),
        'top5_incidentes': obter_top5_clientes_incidentes(),
        'documentos_mes': obter_documentos_por_cliente_mes(),
        'perfis_utilizadores': obter_distribuicao_perfil_utilizadores(),
        'tickets_suporte': obter_estado_e_tempo_medio_tickets(),
    }
    return render(request, 'dashboard.html', context)

# 2. Criar Cliente
def criar_cliente_view(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        company = request.POST.get('company')
        inserir_cliente(nome, email, 'client123', company)
        return redirect('dashboard')
    return render(request, 'form_cliente.html', {'acao': 'Criar'})

# 3. Editar Cliente
def editar_cliente_view(request, id_cliente):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        company = request.POST.get('company')
        atualizar_cliente(id_cliente, nome, email, company)
        return redirect('dashboard')
    
    cliente_dados = obter_cliente_por_id(id_cliente)
    return render(request, 'form_cliente.html', {'acao': 'Editar', 'cliente': cliente_dados})

# 4. Eliminar Cliente
def eliminar_cliente_view(request, id_cliente):
    eliminar_cliente_db(id_cliente)
    return redirect('dashboard')