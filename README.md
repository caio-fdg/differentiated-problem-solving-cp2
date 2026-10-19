# RCP Game — A Trigonometria para Salvar Vidas

**Checkpoint II — Differentiated Problem Solving**

**Aluno:** Caio Fernando de Deus Gomes  
**Turma:** 1ESPA  
**Instituição:** FIAP

## Sobre o projeto

O RCP Game é um projeto acadêmico desenvolvido para demonstrar como os conceitos de trigonometria podem ser aplicados em situações do cotidiano, inclusive naquelas em que uma determinada frequência pode ajudar a salvar vidas.

O projeto utiliza funções seno para representar e comparar a frequência de compressões de uma RCP (Ressuscitação Cardiopulmonar) com o ritmo da música *Stayin' Alive*, dos Bee Gees.

Além da demonstração matemática, foi desenvolvido um jogo interativo em que o participante deve tentar acompanhar o ritmo das compressões, utilizando a música como referência.

## Objetivo

O principal objetivo é demonstrar a aplicação prática de conceitos como:

- Funções trigonométricas;
- Círculo trigonométrico e radianos;
- Amplitude, período e frequência;
- Representação de funções seno no plano cartesiano;
- Comparação de diferentes frequências.

## A relação entre a RCP e a música

Durante uma RCP em adultos, recomenda-se manter uma frequência de 100 a 120 compressões por minuto.

Curiosamente, a música *Stayin' Alive*, dos Bee Gees, possui aproximadamente 103 BPM (batidas por minuto), estando dentro do intervalo recomendado.

Para demonstrar essa relação, foram utilizadas três frequências:

| Referência | Frequência |
|---|---|
| RCP — Primeira comparação | 110 CPM |
| RCP — Segunda comparação | 104 CPM |
| Stayin' Alive — Bee Gees | 103 BPM |

## Representação matemática

A função seno utilizada no projeto é:

**f(x) = A · sen(2π · F · x)**

Em que:

- **A:** amplitude da onda;
- **F:** frequência em hertz;
- **x:** tempo em segundos.

Para facilitar a comparação, foi utilizada amplitude igual a 1.

As funções obtidas foram:

**RCP — 110 CPM**

`R₁(x) = sen((11π/3) · x)`

**RCP — 104 CPM**

`R₂(x) = sen((52π/15) · x)`

**Stayin' Alive — 103 BPM**

`M(x) = sen((103π/30) · x)`

Por meio dos gráficos, podemos observar como pequenas diferenças de frequência provocam um deslocamento entre as ondas ao longo do tempo.

## RCP Game

Após a demonstração matemática, o projeto apresenta um jogo interativo para colocar os conceitos em prática.

O participante deve realizar compressões virtuais, tentando manter uma frequência próxima do ritmo de referência.

Durante o jogo, é possível acompanhar:

- Quantidade de compressões realizadas;
- Pontuação do jogador;
- Classificação das compressões em PERFECT, OKAY e BAD;
- Frequência de compressões do jogador;
- Gráfico de acompanhamento em tempo real;
- Precisão em relação ao ritmo de referência.

## Tecnologias utilizadas

- **HTML5:** estrutura das páginas e elementos do jogo;
- **CSS3:** estilização e organização visual;
- **JavaScript:** lógica, interações e monitoramento das compressões;
- **YouTube IFrame API:** reprodução e controle do vídeo da música.

## Como executar o projeto

1. Clone ou baixe este repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Abra o arquivo `index.html` utilizando o Live Server ou outro servidor local.
4. Aguarde o carregamento do vídeo do YouTube.
5. Prepare e inicie o jogo para começar a realizar as compressões.

**Observação:** é necessária uma conexão com a internet para reproduzir o vídeo do YouTube.

## Considerações finais

Com este projeto, buscamos demonstrar que a trigonometria não está presente apenas em cálculos e gráficos, mas também pode ser utilizada para compreender situações reais.

A comparação entre as funções seno permite visualizar a proximidade entre o ritmo da música e a frequência recomendada para as compressões de uma RCP.

O jogo complementa essa demonstração, permitindo experimentar os conceitos de frequência e periodicidade de uma maneira interativa.

## Aviso importante

Este projeto possui finalidade exclusivamente acadêmica e educativa.

O RCP Game é uma simulação de ritmo e não substitui treinamento em Ressuscitação Cardiopulmonar. O jogo não avalia aspectos essenciais de uma RCP real, como profundidade das compressões, posicionamento correto das mãos e retorno completo do tórax.

A música *Stayin' Alive* pertence aos seus respectivos titulares de direitos autorais e é utilizada como referência por meio de um vídeo incorporado do YouTube.

---

**Desenvolvido por Caio Fernando de Deus Gomes**  
FIAP — Engenharia da Computação  
Checkpoint II — Differentiated Problem Solving
