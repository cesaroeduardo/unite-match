# 🎨 Preview Mode - Desenvolvimento Visual

## 📋 O que é isso?

O arquivo `preview.html` permite visualizar e modificar o design da imagem de estatísticas em **tempo real**, sem precisar gerar a imagem toda vez. Ideal para ajustar o Tailwind CSS e ver as mudanças instantaneamente.

## 🚀 Como usar

### 1. Abrir o Preview

Simplesmente abra o arquivo no navegador:

```bash
# Caminho completo
E:\dev2\unite-match\preview.html
```

Ou arraste o arquivo para o navegador.

### 2. Usar o DevTools (F12)

O segredo está em usar o **Chrome DevTools** para editar em tempo real:

1. Abra o preview no Chrome
2. Pressione `F12` para abrir o DevTools
3. Vá na aba **"Elements"**
4. Clique em qualquer elemento para editá-lo
5. As mudanças aparecem **instantaneamente**!

### 3. Painel de Controle

No canto superior direito, você tem 3 botões úteis:

- **🎲 Dados Aleatórios**: Gera valores aleatórios para testar diferentes cenários
- **📸 Toggle Foto**: Mostra/esconde a foto do jogador
- **💾 Exportar PNG**: Lembra que é só um preview (use a extensão real)

## 🎨 Modificando o Design

### Classes Tailwind Principais

#### Gradientes
```html
<!-- Laranja -->
<div class="bg-gradient-to-br from-orange-600 to-orange-800">

<!-- Roxo -->
<div class="bg-gradient-to-br from-purple-600 to-purple-800">

<!-- Outros gradientes -->
from-blue-600 to-blue-800
from-green-600 to-green-800
from-red-600 to-red-800
```

#### Cantos Arredondados
```html
rounded        <!-- 4px -->
rounded-lg     <!-- 8px -->
rounded-xl     <!-- 12px -->
rounded-2xl    <!-- 16px -->
```

#### Espaçamento
```html
p-4   <!-- padding 16px -->
p-6   <!-- padding 24px -->
p-8   <!-- padding 32px -->

gap-2 <!-- grid gap 8px -->
gap-4 <!-- grid gap 16px -->
gap-6 <!-- grid gap 24px -->
```

#### Cores de Texto
```html
text-orange-200  <!-- Laranja claro -->
text-orange-400  <!-- Laranja médio -->
text-purple-200  <!-- Roxo claro -->
text-purple-300  <!-- Roxo médio -->
```

### Exemplo: Mudar Cor do Painel Esquerdo

**De laranja para azul:**

1. Encontre a classe:
```html
<div class="bg-gradient-to-br from-orange-600 to-orange-800">
```

2. Mude para:
```html
<div class="bg-gradient-to-br from-blue-600 to-blue-800">
```

3. Também mude os elementos internos:
```html
<!-- De: -->
<div class="bg-orange-500 bg-opacity-30">

<!-- Para: -->
<div class="bg-blue-500 bg-opacity-30">
```

### Exemplo: Aumentar Fonte do Nome

```html
<!-- De: -->
<h2 class="text-2xl font-bold mb-2">

<!-- Para: -->
<h2 class="text-3xl font-bold mb-2">
```

### Exemplo: Mudar Layout do Grid

```html
<!-- De 3 colunas: -->
<div class="grid grid-cols-3 gap-4">

<!-- Para 2 colunas: -->
<div class="grid grid-cols-2 gap-4">

<!-- Para 4 colunas: -->
<div class="grid grid-cols-4 gap-4">
```

## 📊 Estrutura do Layout

```
┌─────────────────────────────────────────────────────────┐
│                     1400px x 900px                       │
├──────────────┬──────────────┬──────────────┐            │
│   Seção 1    │   Seção 2    │   Seção 3    │            │
│  (Laranja)   │   (Roxo)     │   (Roxo)     │            │
│              │              │              │            │
│  - Nome      │  - Placar    │  - Radar     │            │
│  - Foto      │  - Mapa      │  - Chart     │            │
│  - Pokémon   │  - Stats     │  - Legenda   │            │
│  - Stats     │   Gerais     │              │            │
│              │              │              │            │
└──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Workflow Recomendado

1. **Abra o preview.html** no Chrome
2. **Abra o DevTools** (F12)
3. **Edite as classes Tailwind** diretamente no Elements
4. **Quando gostar do resultado**, copie as classes
5. **Cole no `preview.html`** e salve
6. **Recarregue** para confirmar
7. **Depois**, aplique as mesmas classes no `imageGenerator.js`

## 💡 Dicas Úteis

### Copiar Elemento no DevTools

1. Clique com botão direito no elemento
2. "Copy" → "Copy outerHTML"
3. Cole onde quiser

### Live Edit no DevTools

No DevTools, você pode editar:
- Classes CSS (adicionar/remover)
- Texto
- Atributos
- Estrutura HTML

**As mudanças são temporárias** - quando recarregar, volta ao normal. Por isso, copie o que você gostou!

### Testar Diferentes Resoluções

1. No DevTools, clique no ícone de celular (Toggle device toolbar)
2. Escolha "Responsive"
3. Digite: 1400 x 900
4. Veja como fica em diferentes zoom levels

## 🎯 Casos de Uso

### 1. Testar cores alternativas
Mude os gradientes e veja qual combina melhor

### 2. Ajustar espaçamentos
Teste diferentes `gap`, `p-`, `m-` até ficar perfeito

### 3. Melhorar tipografia
Experimente diferentes tamanhos de fonte e pesos

### 4. Adicionar novos elementos
Adicione badges, ícones, divisórias, etc.

### 5. Layouts responsivos
Teste como fica em diferentes tamanhos

## 🚫 Limitações

- **Não gera a imagem real** - é só para visualização
- **Imagens de Pokémon são placeholders** - na extensão real virão do banco de dados
- **Dados são mockados** - use os botões para testar cenários

## 📝 Depois de Modificar

Quando terminar as modificações no preview e estiver satisfeito:

1. **Documente as mudanças** que fez
2. **Informe quais classes foram alteradas**
3. **Eu atualizo o `imageGenerator.js`** para refletir as mudanças

Ou, se preferir, você mesmo pode atualizar o Canvas no `imageGenerator.js`, mas isso requer conhecimento de Canvas API.

## 🔗 Referências

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind Color Reference](https://tailwindcss.com/docs/customizing-colors)
- [Tailwind Spacing](https://tailwindcss.com/docs/padding)
- [Tailwind Grid](https://tailwindcss.com/docs/grid-template-columns)

---

**Divirta-se customizando! 🎨✨**

