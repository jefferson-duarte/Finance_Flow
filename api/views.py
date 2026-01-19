from datetime import datetime

from django.contrib.auth.models import User
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from rest_framework import generics, permissions, viewsets

from .models import Category, Transaction
from .serializers import (CategorySerializer, TransactionsSerializer,
                          UserSerializer)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if month and year:
            queryset = queryset.filter(date__month=month, date__year=year)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- ADICIONE ESTA NOVA CLASSE NO FINAL ---
class ExportPDFView(generics.GenericAPIView):
    # Essa view não precisa de Serializer, pois gera um arquivo
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Filtros (Mesma lógica do Dashboard)
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        transactions = Transaction.objects.filter(user=request.user)

        periodo_texto = "Todas as Transações"
        if month and year:
            transactions = transactions.filter(
                date__month=month, date__year=year)
            periodo_texto = f"{month}/{year}"

        # 2. Configuração do PDF
        response = HttpResponse(content_type='application/pdf')
        # Se quiser que baixe direto, use 'attachment'. Se quiser ver no navegador, use 'inline'
        filename = f"extrato_{periodo_texto.replace('/', '-')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # 3. Criando o Canvas (A folha em branco)
        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4

        # --- CABEÇALHO ---
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, f"FinanceFlow - Extrato Financeiro")

        p.setFont("Helvetica", 12)
        p.drawString(50, height - 70, f"Usuário: {request.user.username}")
        p.drawString(50, height - 85, f"Período: {periodo_texto}")
        p.drawString(50, height - 100,
                     f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")

        # --- TABELA DE DADOS ---
        # Cabeçalhos da tabela
        data = [['Data', 'Categoria', 'Descrição', 'Tipo', 'Valor (R$)']]

        # Preenchendo os dados
        total_entradas = 0
        total_saidas = 0

        for t in transactions:
            date_str = t.date.strftime('%d/%m/%Y')
            tipo = "Entrada" if t.type == 'IN' else "Saída"
            valor_str = f"{t.amount:.2f}"

            # Somatórios para o final
            if t.type == 'IN':
                total_entradas += t.amount
            else:
                total_saidas += t.amount

            data.append([date_str, t.category.name,
                        t.description[:25], tipo, valor_str])

        # Adiciona linha de totais
        data.append(['', '', 'TOTAL ENTRADAS', '', f"{total_entradas:.2f}"])
        data.append(['', '', 'TOTAL SAÍDAS', '', f"{total_saidas:.2f}"])
        saldo = total_entradas - total_saidas
        data.append(['', '', 'SALDO FINAL', '', f"{saldo:.2f}"])

        # Configuração visual da Tabela
        table = Table(data, colWidths=[70, 100, 170, 60, 80])

        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Cor do cabeçalho
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            # Grade nas linhas normais
            ('GRID', (0, 0), (-1, -3), 1, colors.black),
            ('LINEBELOW', (0, -3), (-1, -1), 1, colors.black),  # Linhas nos totais
            ('FONTNAME', (0, -3), (-1, -1), 'Helvetica-Bold'),  # Negrito nos totais
        ])

        table.setStyle(style)

        # Desenhar a tabela na posição X, Y
        # O cálculo height - 150 é para começar abaixo do cabeçalho
        w, h = table.wrapOn(p, width, height)
        table.drawOn(p, 50, height - 140 - h)

        # 4. Finalizar e Salvar
        p.showPage()
        p.save()
        return response
