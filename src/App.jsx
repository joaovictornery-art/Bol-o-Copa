import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  Clipboard,
  Lock,
  Minus,
  Plus,
  Settings,
  Target,
  Trophy,
  Upload,
  Users,
} from "lucide-react";

const ENTRY_FEE = 5;
const PIX_KEY = "bolaochurras2026@pix.com";

const initialParticipants = [
  {
    id: 1,
    name: "Joao da Silva",
    home: 2,
    away: 1,
    scorer: "Vini Jr.",
    receiptName: "pix-joao.png",
    confirmed: true,
  },
  {
    id: 2,
    name: "Rafael Souza",
    home: 1,
    away: 0,
    scorer: "Rodrygo",
    receiptName: "comprovante-rafael.pdf",
    confirmed: true,
  },
  {
    id: 3,
    name: "Carlos Eduardo",
    home: 3,
    away: 1,
    scorer: "Vini Jr.",
    receiptName: "pix-carlos.jpg",
    confirmed: true,
  },
  {
    id: 4,
    name: "Bruno Lima",
    home: 2,
    away: 2,
    scorer: "Hakimi",
    receiptName: "bruno-pix.jpeg",
    confirmed: false,
  },
  {
    id: 5,
    name: "Juliana Costa",
    home: 1,
    away: 1,
    scorer: "",
    receiptName: "juliana-comprovante.pdf",
    confirmed: false,
  },
];

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function getOutcome(home, away) {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

function getPoints(participant, officialHome, officialAway, officialScorer) {
  const exactScore =
    participant.home === officialHome && participant.away === officialAway;
  const correctOutcome =
    getOutcome(participant.home, participant.away) ===
    getOutcome(officialHome, officialAway);
  const scorerHit =
    officialScorer.trim() &&
    participant.scorer.trim() &&
    normalizeText(participant.scorer) === normalizeText(officialScorer);

  let points = exactScore ? 3 : correctOutcome ? 1 : 0;
  if (scorerHit) points += 1;
  return points;
}

function Stepper({ label, value, tone, onDecrease, onIncrease }) {
  return (
    <div className="score-control">
      <span className={`score-label ${tone}`}>{label}</span>
      <div className="stepper" aria-label={`Palpite ${label}`}>
        <button type="button" onClick={onDecrease} aria-label={`Diminuir ${label}`}>
          <Minus size={18} />
        </button>
        <strong>{value}</strong>
        <button type="button" onClick={onIncrease} aria-label={`Aumentar ${label}`}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [participants, setParticipants] = useState(initialParticipants);
  const [name, setName] = useState("");
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [scorer, setScorer] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptInputKey, setReceiptInputKey] = useState(0);
  const [officialHome, setOfficialHome] = useState(2);
  const [officialAway, setOfficialAway] = useState(1);
  const [officialScorer, setOfficialScorer] = useState("Vini Jr.");
  const [resultPublished, setResultPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const confirmedParticipants = participants.filter(
    (participant) => participant.confirmed,
  );
  const totalPot = participants.length * ENTRY_FEE;
  const confirmedPot = confirmedParticipants.length * ENTRY_FEE;

  const ranking = useMemo(() => {
    if (!resultPublished) return [];

    return confirmedParticipants
      .map((participant) => ({
        ...participant,
        points: getPoints(participant, officialHome, officialAway, officialScorer),
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  }, [confirmedParticipants, officialAway, officialHome, officialScorer, resultPublished]);

  const topScore = ranking[0]?.points ?? 0;
  const winners = ranking.filter(
    (participant) => participant.points === topScore && topScore > 0,
  );
  const prizePerWinner = winners.length ? confirmedPot / winners.length : 0;

  function clampScore(value) {
    return Math.max(0, Math.min(12, value));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || !receiptFile) return;

    setParticipants((current) => [
      {
        id: Date.now(),
        name: trimmedName,
        home: homeScore,
        away: awayScore,
        scorer: scorer.trim(),
        receiptName: receiptFile.name,
        confirmed: false,
      },
      ...current,
    ]);

    setName("");
    setScorer("");
    setReceiptFile(null);
    setReceiptInputKey((value) => value + 1);
  }

  function toggleConfirmed(id) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id
          ? { ...participant, confirmed: !participant.confirmed }
          : participant,
      ),
    );
  }

  async function copyPixKey() {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="app-shell">
      <section className="hero-section" aria-label="Resumo do bolao">
        <div className="topbar">
          <button type="button" className="icon-button" aria-label="Abrir menu">
            <Settings size={22} />
          </button>
          <div className="brand-mark">
            <Trophy size={28} />
          </div>
          <div className="entry-pill">
            <span>Entrada</span>
            <strong>{currency(ENTRY_FEE)}</strong>
          </div>
        </div>

        <div className="headline">
          <p>Copa do Mundo 2026</p>
          <h1>Bolão da Churrascada</h1>
        </div>

        <div className="matchup" aria-label="Brasil contra Marrocos">
          <div className="team">
            <img
              src="https://flagcdn.com/w160/br.png"
              alt="Bandeira do Brasil"
              width="88"
              height="58"
            />
            <strong>Brasil</strong>
          </div>
          <span className="versus">VS</span>
          <div className="team">
            <img
              src="https://flagcdn.com/w160/ma.png"
              alt="Bandeira do Marrocos"
              width="88"
              height="58"
            />
            <strong>Marrocos</strong>
          </div>
        </div>

        <p className="match-date">Sábado, 13 jun 2026 · 19:00 BRT</p>
      </section>

      <section className="summary-band" aria-label="Resumo do premio">
        <div>
          <span>Prêmio total</span>
          <strong>{currency(totalPot)}</strong>
        </div>
        <div>
          <span>Participantes</span>
          <strong>{participants.length}</strong>
        </div>
        <div>
          <span>Por aposta</span>
          <strong>{currency(ENTRY_FEE)}</strong>
        </div>
      </section>

      <section className="pix-section" aria-label="Pagamento via Pix">
        <div className="section-heading">
          <Clipboard size={21} />
          <div>
            <span>Pix copia e cola</span>
            <h2>Pague {currency(ENTRY_FEE)} para entrar</h2>
          </div>
        </div>
        <div className="pix-copy">
          <code>{PIX_KEY}</code>
          <button type="button" onClick={copyPixKey}>
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p>
          Para enviar o palpite, anexe o comprovante. O organizador valida depois.
        </p>
      </section>

      <form className="bet-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <Trophy size={21} />
          <div>
            <span>Seu palpite</span>
            <h2>Placar + marcador bônus</h2>
          </div>
        </div>

        <div className="score-row">
          <Stepper
            label="Brasil"
            value={homeScore}
            tone="green"
            onDecrease={() => setHomeScore((value) => clampScore(value - 1))}
            onIncrease={() => setHomeScore((value) => clampScore(value + 1))}
          />
          <span className="score-x">x</span>
          <Stepper
            label="Marrocos"
            value={awayScore}
            tone="red"
            onDecrease={() => setAwayScore((value) => clampScore(value - 1))}
            onIncrease={() => setAwayScore((value) => clampScore(value + 1))}
          />
        </div>

        <label className="field-label" htmlFor="participant-name">
          Seu nome
        </label>
        <input
          id="participant-name"
          value={name}
          maxLength={30}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Neymar Júnior"
        />

        <label className="field-label" htmlFor="goal-scorer">
          Marcador bônus
        </label>
        <div className="bonus-field">
          <Target size={18} />
          <input
            id="goal-scorer"
            value={scorer}
            maxLength={30}
            onChange={(event) => setScorer(event.target.value)}
            placeholder="Ex.: Vini Jr., Rodrygo, Hakimi"
          />
        </div>

        <label className="receipt-drop" htmlFor="receipt-upload">
          <Upload size={22} />
          <span>
            {receiptFile
              ? receiptFile.name
              : "Anexar comprovante do Pix para confirmar o envio"}
          </span>
        </label>
        <input
          key={receiptInputKey}
          id="receipt-upload"
          className="file-input"
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
        />

        <button
          className="primary-button"
          type="submit"
          disabled={!name.trim() || !receiptFile}
        >
          Enviar palpite com comprovante
        </button>
        <p className="form-note">
          Regra: placar exato vale 3 pts, resultado certo vale 1 pt e marcador
          certo soma +1 pt.
        </p>
      </form>

      <section className="participants-section" aria-label="Participantes">
        <div className="participants-title">
          <div className="section-heading">
            <Users size={21} />
            <div>
              <span>Lista pública</span>
              <h2>Participantes</h2>
            </div>
          </div>
          <strong>{participants.length}</strong>
        </div>

        <div className="participant-list">
          {participants.map((participant, index) => (
            <div className="participant-row" key={participant.id}>
              <div className="participant-main">
                <div className="participant-name">
                  <span>{index + 1}</span>
                  <strong>{participant.name}</strong>
                </div>
                <div className="prediction">
                  <strong>{participant.home}</strong>
                  <span>x</span>
                  <strong className="away">{participant.away}</strong>
                </div>
                <button
                  type="button"
                  className={`payment-status ${
                    participant.confirmed ? "paid" : "pending"
                  }`}
                  onClick={() => toggleConfirmed(participant.id)}
                >
                  {participant.confirmed ? "Validado" : "Comprovante"}
                </button>
              </div>
              <div className="participant-extra">
                <span>
                  Gol: <strong>{participant.scorer || "sem bônus"}</strong>
                </span>
                <span title={participant.receiptName}>
                  Pix: <strong>{participant.receiptName}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section" aria-label="Area do organizador">
        <div className="section-heading">
          <Lock size={21} />
          <div>
            <span>Organizador</span>
            <h2>Resultado e pontuação</h2>
          </div>
        </div>

        <div className="admin-score">
          <Stepper
            label="Brasil"
            value={officialHome}
            tone="green"
            onDecrease={() => setOfficialHome((value) => clampScore(value - 1))}
            onIncrease={() => setOfficialHome((value) => clampScore(value + 1))}
          />
          <span className="score-x">x</span>
          <Stepper
            label="Marrocos"
            value={officialAway}
            tone="red"
            onDecrease={() => setOfficialAway((value) => clampScore(value - 1))}
            onIncrease={() => setOfficialAway((value) => clampScore(value + 1))}
          />
        </div>

        <label className="field-label" htmlFor="official-scorer">
          Marcador oficial
        </label>
        <div className="bonus-field">
          <BadgeCheck size={18} />
          <input
            id="official-scorer"
            value={officialScorer}
            maxLength={30}
            onChange={(event) => setOfficialScorer(event.target.value)}
            placeholder="Ex.: Vini Jr."
          />
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setResultPublished((value) => !value)}
        >
          {resultPublished ? "Ocultar ranking" : "Calcular ranking"}
        </button>

        {resultPublished && (
          <div className="winner-box">
            {winners.length ? (
              <>
                <div>
                  <Check size={18} />
                  <strong>
                    {winners.length} vencedor{winners.length > 1 ? "es" : ""} ·{" "}
                    {topScore} pts
                  </strong>
                </div>
                <p>
                  {winners.map((winner) => winner.name).join(", ")} recebe{" "}
                  {currency(prizePerWinner)} do prêmio validado de{" "}
                  {currency(confirmedPot)}.
                </p>
              </>
            ) : (
              <p>
                Ninguém validado pontuou. Vale combinar se acumula, devolve ou
                usa desempate.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
