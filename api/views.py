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


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ExportPDFView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        lang = request.query_params.get('lang', 'pt')

        # 1. DEFINE A MOEDA BASEADA NO IDIOMA
        currency_symbol = 'R$' if lang == 'pt' else '$'

        texts = {
            'pt': {
                'title': 'FinanceFlow - Extrato Financeiro',
                'user': 'Usuário',
                'period': 'Período',
                'generated': 'Gerado em',
                'all': 'Todas as Transações',
                'col_date': 'Data',
                'col_cat': 'Categoria',
                'col_desc': 'Descrição',
                'col_type': 'Tipo',
                # <--- Título da coluna dinâmico
                'col_val': f'Valor ({currency_symbol})',
                'in': 'Entrada',
                'out': 'Saída',
                'total_in': 'TOTAL ENTRADAS',
                'total_out': 'TOTAL SAÍDAS',
                'balance': 'SALDO FINAL'
            },
            'en': {
                'title': 'FinanceFlow - Financial Statement',
                'user': 'User',
                'period': 'Period',
                'generated': 'Generated on',
                'all': 'All Transactions',
                'col_date': 'Date',
                'col_cat': 'Category',
                'col_desc': 'Description',
                'col_type': 'Type',
                # <--- Título da coluna dinâmico
                'col_val': f'Amount ({currency_symbol})',
                'in': 'Income',
                'out': 'Expense',
                'total_in': 'TOTAL INCOME',
                'total_out': 'TOTAL EXPENSES',
                'balance': 'FINAL BALANCE'
            }
        }

        t = texts.get(lang, texts['pt'])

        transactions = Transaction.objects.filter(user=request.user)
        periodo_texto = t['all']
        if month and year:
            transactions = transactions.filter(
                date__month=month, date__year=year)
            periodo_texto = f"{month}/{year}"

        response = HttpResponse(content_type='application/pdf')
        filename = f"financeflow_{month}_{year}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4

        # Cabeçalho
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, t['title'])

        p.setFont("Helvetica", 12)
        p.drawString(50, height - 70, f"{t['user']}: {request.user.username}")
        p.drawString(50, height - 85, f"{t['period']}: {periodo_texto}")
        p.drawString(
            50, height - 100, f"{t['generated']}: {datetime.now().strftime('%d/%m/%Y %H:%M')}")

        # Tabela
        data = [[t['col_date'], t['col_cat'],
                 t['col_desc'], t['col_type'], t['col_val']]]

        total_entradas = 0
        total_saidas = 0

        for tr in transactions:
            date_str = tr.date.strftime('%d/%m/%Y')
            tipo_str = t['in'] if tr.type == 'IN' else t['out']

            # 2. USA A VARIÁVEL DE MOEDA AQUI NOS VALORES
            valor_str = f"{currency_symbol} {tr.amount:.2f}"

            if tr.type == 'IN':
                total_entradas += tr.amount
            else:
                total_saidas += tr.amount

            data.append([date_str, tr.category.name,
                        tr.description[:25], tipo_str, valor_str])

        # 3. USA A VARIÁVEL DE MOEDA NOS TOTAIS
        data.append(['', '', t['total_in'], '',
                    f"{currency_symbol} {total_entradas:.2f}"])
        data.append(['', '', t['total_out'], '',
                    f"{currency_symbol} {total_saidas:.2f}"])
        saldo = total_entradas - total_saidas
        data.append(['', '', t['balance'], '',
                    f"{currency_symbol} {saldo:.2f}"])

        # Estilo da Tabela
        table = Table(data, colWidths=[70, 100, 170, 60, 80])
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -3), 1, colors.black),
            ('LINEBELOW', (0, -3), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, -3), (-1, -1), 'Helvetica-Bold'),
        ])

        table.setStyle(style)
        w, h = table.wrapOn(p, width, height)
        table.drawOn(p, 50, height - 140 - h)

        p.showPage()
        p.save()
        return response
