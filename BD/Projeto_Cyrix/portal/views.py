from django.shortcuts import render
from django.http import JsonResponse
import json
from . import basedados

def home(request):
    # 1. Tratamento de submissões assíncronas do Frontend (Post)
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
                return JsonResponse({'status': 'error', 'message': 'Credenciais inválidas.'})
                # --- PROCESSAMENTO DO CRUD NO VIEWS.PY ---
            
            elif action == 'criar_utilizador':
                sucesso = basedados.criar_utilizador(data.get('nome'), data.get('email'), data.get('password'), data.get('perfil'))
                return JsonResponse({'status': 'success' if sucesso else 'error'})

            elif action == 'atualizar_utilizador':
                sucesso = basedados.atualizar_utilizador(data.get('id'), data.get('nome'), data.get('email'), data.get('perfil'))
                return JsonResponse({'status': 'success' if sucesso else 'error'})

            elif action == 'eliminar_utilizador':
                sucesso = basedados.eliminar_utilizador(data.get('id'))
                return JsonResponse({'status': 'success' if sucesso else 'error'})
                
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    # 2. Carregamento da Página com as métricas exigidas pela FICHA 9
    contexto = {
        'dashboard_nis2': basedados.obter_conformidade_nis2(),         # Exercício 1
        'dashboard_top5': basedados.obter_top5_incidentes(),          # Exercício 2
        'dashboard_docs': basedados.obter_documentos_por_mes(),        # Exercício 3
        'dashboard_perfis': basedados.obter_distribuicao_perfis(),     # Exercício 4
        'dashboard_tickets': basedados.obter_estado_tickets_resolucao(),# Exercício 5
    }
    
    return render(request, 'portal/ciryx.html', contexto)