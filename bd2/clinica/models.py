from django.db import models

# ----------------------
# DOENTE
# ----------------------
class Doente(models.Model):
    nome = models.CharField(max_length=100)
    morada = models.CharField(max_length=200)
    nif = models.CharField(max_length=9)
    numero_sns = models.CharField(max_length=15)
    data_nascimento = models.DateField()

    def __str__(self):
        return self.nome


# ----------------------
# CONTACTOS
# ----------------------
class Contacto(models.Model):
    doente = models.ForeignKey(Doente, on_delete=models.CASCADE)
    telefone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.doente.nome} - {self.telefone or self.email}"


# ----------------------
# CONSULTA
# ----------------------
class Consulta(models.Model):
    doente = models.ForeignKey(Doente, on_delete=models.CASCADE)
    data = models.DateTimeField()
    notas = models.TextField()

    def __str__(self):
        return f"Consulta - {self.doente.nome} ({self.data})"


# ----------------------
# PRESCRIÇÃO
# ----------------------
class Prescricao(models.Model):
    consulta = models.ForeignKey(Consulta, on_delete=models.CASCADE)
    medicamento = models.CharField(max_length=100)
    descricao = models.TextField()

    def __str__(self):
        return self.medicamento


# ----------------------
# EXAME
# ----------------------
class Exame(models.Model):
    consulta = models.ForeignKey(Consulta, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=100)
    descricao = models.TextField()

    def __str__(self):
        return self.tipo


# ----------------------
# PAGAMENTO
# ----------------------
class Pagamento(models.Model):
    consulta = models.OneToOneField(Consulta, on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=6, decimal_places=2)
    pago = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.valor}€ - {'Pago' if self.pago else 'Pendente'}"