from django import forms
from .models import Doente, Consulta, Prescricao, Exame, Pagamento


class DoenteForm(forms.ModelForm):
    class Meta:
        model = Doente
        fields = '__all__'


class ConsultaForm(forms.ModelForm):
    class Meta:
        model = Consulta
        fields = '__all__'


class PrescricaoForm(forms.ModelForm):
    class Meta:
        model = Prescricao
        fields = '__all__'


class ExameForm(forms.ModelForm):
    class Meta:
        model = Exame
        fields = '__all__'


class PagamentoForm(forms.ModelForm):
    class Meta:
        model = Pagamento
        fields = '__all__'