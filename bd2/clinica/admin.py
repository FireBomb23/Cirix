from django.contrib import admin
from .models import Doente, Contacto, Consulta, Prescricao, Exame, Pagamento

admin.site.register(Doente)
admin.site.register(Contacto)
admin.site.register(Consulta)
admin.site.register(Prescricao)
admin.site.register(Exame)
admin.site.register(Pagamento)