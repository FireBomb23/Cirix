from django.shortcuts import render, redirect
from . import basedados 

# 1. Página Principal
def home(request):
    return render(request, 'clinica/home.html')

# 2. Mostrar Formulário de Registo
def registar_doente(request):
    return render(request, 'clinica/form.html')

# 3. Processar Gravação de Novo Doente
def salvar_doente(request):
    if request.method == "POST":
        nome = request.POST.get('nome')
        morada = request.POST.get('morada')
        nif = request.POST.get('nif')
        sns = request.POST.get('sns')
        data_nasc = request.POST.get('data_nascimento')

        try:
            basedados.inserir_doente(nome, morada, nif, sns, data_nasc)
        except Exception as e:
            print(f"Erro ao gravar na base de dados: {e}")

        return redirect('lista_doentes') # Redireciona logo para a lista para ver o resultado
    
    return redirect('novo_doente')

# 4. Listagem de Doentes (Tarefa 7)
def lista_doentes(request):
    dados = basedados.listar_doentes()
    return render(request, 'clinica/lista_doentes.html', {'lista': dados})

# 5. Eliminar Doente (Resolve o erro da imagem 3baa40)
def eliminar_doente(request, id):
    try:
        basedados.apagar_doente(id)
    except Exception as e:
        print(f"Erro ao eliminar: {e}")
    
    return redirect('lista_doentes')

def editar_doente(request, id):
    # Vai buscar os dados do doente à BD para preencher o form
    doente = basedados.consultar_doente(id) 
    # Abre o form.html enviando os dados (a variável 'doente')
    return render(request, 'clinica/form.html', {'doente': doente})

def atualizar_doente(request, id):
    if request.method == "POST":
        nome = request.POST.get('nome')
        morada = request.POST.get('morada')
        nif = request.POST.get('nif')
        sns = request.POST.get('sns')
        data_nasc = request.POST.get('data_nascimento')
        
        basedados.atualizar_doente(id, nome, morada, nif, sns, data_nasc)
        return redirect('lista_doentes')