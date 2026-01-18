from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Category


# O Decorator @receiver diz: "Fique ouvindo o evento post_save do modelo User"
@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):

    # 'created' é um booleano: True se for um novo usuário, False se for apenas uma edição
    if created:

        # Lista de categorias padrão para todo novo usuário
        default_categories = [
            'Salário',
            'Alimentação',
            'Transporte',
            'Moradia',
            'Lazer',
        ]

        for cat_name in default_categories:
            Category.objects.create(name=cat_name, user=instance)
