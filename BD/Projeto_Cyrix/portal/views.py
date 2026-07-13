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

            elif action == 'dados_cliente':
                return JsonResponse({'status': 'success', 'dados': basedados.dados_cliente(data.get('id'))})

            elif action == 'verify_2fa':
                user = basedados.validar_2fa(data.get('id'), data.get('word'))
                if user:
                    return JsonResponse({'status': 'success', 'user': user})
                return JsonResponse({'status': 'error', 'message': 'Palavra de seguranca incorreta.'})

            elif action == 'dados_gestao':
                return JsonResponse({'status': 'success', 'dados': basedados.dados_gestao()})

            # --- ACOES DO CLIENTE (escrita) ---
            elif action == 'criar_ticket':
                ok = basedados.criar_ticket(
                    data.get('client_id'), data.get('titulo'),
                    data.get('categoria'), data.get('prioridade'), data.get('descricao')
                )
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'criar_pedido':
                ok = basedados.criar_pedido(
                    data.get('client_id'), data.get('titulo'), data.get('descricao')
                )
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'atualizar_conta':
                ok = basedados.atualizar_conta(
                    data.get('id'), data.get('nome'), data.get('email')
                )
                return JsonResponse({'status': 'success' if ok else 'error'})

            # --- ACOES DE GESTAO (Admin/Gestor) ---
            elif action == 'atualizar_estado_ticket':
                ok = basedados.atualizar_estado_ticket(data.get('id'), data.get('estado'))
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'atualizar_estado_pedido':
                ok = basedados.atualizar_estado_pedido(data.get('id'), data.get('estado'))
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'eliminar_documento':
                ok = basedados.eliminar_documento(data.get('id'))
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'criar_ativo':
                ok = basedados.criar_ativo(
                    data.get('client_id'), data.get('nome'), data.get('tipo'),
                    data.get('quantidade'), data.get('local'), data.get('criticidade'), data.get('notas')
                )
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'criar_incidente':
                ok = basedados.criar_incidente(
                    data.get('client_id'), data.get('titulo'), data.get('data'),
                    data.get('categoria'), data.get('severidade'), data.get('descricao')
                )
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'marcar_contacto_lido':
                ok = basedados.marcar_contacto_lido(data.get('id'))
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'atualizar_estado_servico':
                ok = basedados.atualizar_estado_servico(data.get('id'), data.get('estado'))
                return JsonResponse({'status': 'success' if ok else 'error'})

            # --- MENSAGENS / CHAT ---
            elif action == 'chat_cliente':
                return JsonResponse({'status': 'success', 'dados': basedados.dados_conversa_cliente(data.get('client_id'))})

            elif action == 'chat_conversas':
                return JsonResponse({'status': 'success', 'dados': basedados.listar_conversas()})

            elif action == 'chat_clientes_lista':
                return JsonResponse({'status': 'success', 'dados': basedados.listar_clientes_conversas()})

            elif action == 'ticket_comentarios':
                return JsonResponse({'status': 'success', 'dados': basedados.listar_comentarios_ticket(data.get('ticket_id'))})

            elif action == 'ticket_comentar':
                ok = basedados.criar_comentario_ticket(data.get('ticket_id'), data.get('user_id'), data.get('content'))
                return JsonResponse({'status': 'success' if ok else 'error'})

            elif action == 'chat_mensagens':
                return JsonResponse({'status': 'success', 'dados': basedados.listar_mensagens(data.get('conversation_id'))})

            elif action == 'enviar_mensagem':
                ok = basedados.enviar_mensagem(data.get('conversation_id'), data.get('sender_id'), data.get('content'))
                return JsonResponse({'status': 'success' if ok else 'error'})

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
