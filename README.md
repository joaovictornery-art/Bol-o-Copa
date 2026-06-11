# Bolão da Churrascada

App para criar bolões rápidos da Copa do Mundo no grupo do churrasco.

## V1

- Vários bolões/jogos no mesmo app.
- Link próprio por bolão.
- Entrada sugerida: R$ 5.
- Sem limite de participantes.
- Palpites públicos para o grupo acompanhar.
- O participante precisa anexar comprovante do Pix para enviar o palpite.
- Confirmação do comprovante feita manualmente pelo organizador.
- Marcador de gol opcional como bônus de pontuação.
- Simulação local de resultado, pontuação e cálculo de vencedores.
- Modo demo local quando Firebase não está configurado.
- Modo Firebase com Firestore, Storage e Auth anônima quando `.env` está configurado.

## Regra de Pontuação

- Placar exato: 3 pontos.
- Resultado certo sem placar exato: 1 ponto.
- Marcador correto: +1 ponto.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase

Leia [docs/firebase-setup.md](docs/firebase-setup.md) antes de ativar Firebase.

Guardrail importante: budget alert ajuda a monitorar, mas não é limite rígido de cobrança. Para comprovantes, o app limita upload a 2 MB no front e nas regras de Storage.
