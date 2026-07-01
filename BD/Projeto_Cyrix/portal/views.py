from django.shortcuts import render
from django.http import JsonResponse
import json
from . import basedados


def home(request):
    # 1. Tratamento de submissoes assincronas do Frontend (POST)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'contacto':
                sucesso = basedados.inserir_contacto(
                    data.get('name'), data.get('email'), data.get('message')
                )
                return JsonResponse({'status': 'success' if sucesso else 'error'})

            elif action == 'login':
                user = basedados.validar_login(data.get('email'), data.get('password'))
                if user:
                    return JsonResponse({'status': 'success', 'user': user})
                return JsonResponse({'status': 'error', 'message': 'Credenciais invalidas.'})

            # --- PROCESSAMENTO DO CRUD ---
            elif action == 'criar_utilizador':
                sucesso = basedados.criar_utilizador(
                    data.get('nome'), data.get('email'), data.get('password'), data.get('perfil')
                )
                return JsonResponse({'status': 'success' if sucesso else 'error'})

            elif action == 'atualizar_utilizador':
                sucesso = basedados.atualizar_utilizador(
                    data.get('id'), data.get('nome'), data.get('email'), data.get('perfil')
                )
                return JsonResponse({'status': 'success' if sucesso else 'error'})

            elif action == 'eliminar_utilizador':
                sucesso = basedados.eliminar_utilizador(data.get('id'))
                return JsonResponse({'status': 'success' if sucesso else 'error'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    # 2. Carregamento da pagina com as metricas exigidas pela FICHA 9.
    # Os dados sao agrupados num so dicionario e serializados em JSON para
    # serem consumidos pelo dashboard (dbData) no template.
    dashboard = {
        'conformidade': basedados.obter_conformidade_nis2(),       # Exercicio 1
        'incidentes':   basedados.obter_top5_incidentes(),         # Exercicio 2
        'documentos':   basedados.obter_documentos_por_mes(),      # Exercicio 3
        'perfis':       basedados.obter_distribuicao_perfis(),     # Exercicio 4
        'tickets':      basedados.obter_estado_tickets_resolucao(),# Exercicio 5
    }

    contexto = {
        # default=str garante a serializacao de tipos como Decimal/None.
        'dashboard_json': json.dumps(dashboard, default=str),
    }

    return render(request, 'portal/cyrix.html', contexto)
