# NutriPlanner Mulher

App web para mulheres que querem atingir objetivo físico com acompanhamento de metas de macronutrientes, hidratação, peso e medidas corporais.

## O que o app faz

- Define metas diárias: calorias, proteína, carboidrato, gordura e água.
- Registra alimentos com informação nutricional completa por porção.
- Busca produtos no **Open Food Facts** para preencher macros rapidamente.
- Registra refeições por data e calcula automaticamente o consumo diário.
- Mostra o quanto ainda falta para bater as metas de macros.
- Traz um planejador de porções (estimativa de quanto comer de um alimento para bater um macro restante).
- Mantém histórico de hidratação (últimos dias).
- Mantém histórico de evolução: peso, cintura, quadril e braço.

## Executar localmente

### Modo estático
Abra o `index.html` no navegador.

### Modo servidor (igual deploy)
```bash
pip install -r requirements.txt
python app.py
```

Acesse: `http://localhost:5000`

## Deploy no Render

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

Esses arquivos já estão no repositório (`requirements.txt`, `Procfile` e `app.py`).

## Observação importante

Este app é de apoio e organização. Para ajustes de saúde, composição corporal e condições clínicas, combine com acompanhamento de nutricionista/médica.
