# NutriPlanner Mulher

App web para mulheres que querem atingir objetivo físico com acompanhamento de metas de macronutrientes, hidratação, peso e medidas corporais.

## O que o app faz

- Define objetivo principal (perda de peso, recomposição, ganho de massa, aumentar glúteos).
- Gera automaticamente metas de calorias, macros e água com base em idade, altura, peso e atividade.
- Sugere metas de micronutrientes diários (fibra, cálcio, ferro, vitamina C, ômega-3, potássio e sódio máximo).
- Registra alimentos com informação nutricional por porção.
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
- Compatível também com start legado: `gunicorn your_application.wsgi` (usa `application`)

Se o painel do Render estiver com `gunicorn your_application.wsgi` (usa `application`), pode manter (agora está suportado) ou trocar para `gunicorn app:app`.

Esses arquivos já estão no repositório (`requirements.txt`, `Procfile`, `app.py` e `your_application/wsgi.py`).

## Observação importante

Este app é de apoio e organização. Para ajustes de saúde, composição corporal e condições clínicas, combine com acompanhamento de nutricionista/médica.
