import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Lock,
  Minus,
  Plus,
  Settings,
  Trophy,
  Users,
} from "lucide-react";

const ENTRY_FEE = 5;
const MAX_PARTICIPANTS = 30;
const PIX_KEY = "bolaochurras2026@pix.com";

const initialParticipants = [
  { id: 1, name: "Joao da Silva", home: 2, away: 1, paid: true },
  { id: 2, name: "Rafael Souza", home: 1, away: 0, paid: true },
  { id: 3, name: "Carlos Eduardo", home: 3, away: 1, paid: true },
  { id: 4, name: "Bruno Lima", home: 2, away: 2, paid: false },
  { id: 5, name: "Juliana Costa", home: 1, away: 1, paid: false },
];

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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
  const [officialHome, setOfficialHome] = useState(2);
  const [officialAway, setOfficialAway] = useState(1);
  const [resultPublished, setResultPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const paidParticipants = participants.filter((participant) => participant.paid);
  const totalPot = paidParticipants.length * ENTRY_FEE;
  const remainingSlots = MAX_PARTICIPANTS - participants.length;

  const winners = useMemo(() => {
    if (!resultPublished) return [];

    return paidParticipants.filter(
      (participant) =>
        participant.home === officialHome && participant.away === officialAway,
    );
  }, [officialAway, officialHome, paidParticipants, resultPublished]);

  const prizePerWinner = winners.length ? totalPot / winners.length : 0;
  const isFull = participants.length >= MAX_PARTICIPANTS;

  function clampScore(value) {
    return Math.max(0, Math.min(12, value));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || isFull) return;

    setParticipants((current) => [
      {
        id: Date.now(),
        name: trimmedName,
        home: homeScore,
        away: awayScore,
        paid: false,
      },
      ...current,
    ]);

    setName("");
  }

  function togglePaid(id) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id
          ? { ...participant, paid: !participant.paid }
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
          <strong>
            {participants.length}/{MAX_PARTICIPANTS}
          </strong>
        </div>
        <div>
          <span>Vagas</span>
          <strong>{remainingSlots}</strong>
        </div>
      </section>

      <section className="pix-section" aria-label="Pagamento via Pix">
        <div className="section-heading">
          <Clipboard size={21} />
          <div>
            <span>Pix do organizador</span>
            <h2>Pague {currency(ENTRY_FEE)} para entrar</h2>
          </div>
        </div>
        <div className="pix-copy">
          <code>{PIX_KEY}</code>
          <button type="button" onClick={copyPixKey}>
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p>Depois do Pix, o organizador confirma seu pagamento na lista.</p>
      </section>

      <form className="bet-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <Trophy size={21} />
          <div>
            <span>Seu palpite</span>
            <h2>Qual vai ser o placar?</h2>
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
          placeholder="Ex.: Joao da Silva"
          disabled={isFull}
        />

        <button className="primary-button" type="submit" disabled={!name.trim() || isFull}>
          {isFull ? "Bolão cheio" : "Enviar palpite"}
        </button>
        <p className="form-note">
          Palpites ficam visíveis para todo mundo do churrasco acompanhar.
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
          <strong>{participants.length}/{MAX_PARTICIPANTS}</strong>
        </div>

        <div className="table-head">
          <span>Nome</span>
          <span>Palpite</span>
          <span>Pix</span>
        </div>

        <div className="participant-list">
          {participants.map((participant, index) => (
            <div className="participant-row" key={participant.id}>
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
                className={`payment-status ${participant.paid ? "paid" : "pending"}`}
                onClick={() => togglePaid(participant.id)}
              >
                {participant.paid ? "Pago" : "Pendente"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section" aria-label="Area do organizador">
        <div className="section-heading">
          <Lock size={21} />
          <div>
            <span>Organizador</span>
            <h2>Simular resultado</h2>
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

        <button
          type="button"
          className="secondary-button"
          onClick={() => setResultPublished((value) => !value)}
        >
          {resultPublished ? "Ocultar vencedores" : "Calcular vencedores"}
        </button>

        {resultPublished && (
          <div className="winner-box">
            {winners.length ? (
              <>
                <div>
                  <Check size={18} />
                  <strong>
                    {winners.length} vencedor{winners.length > 1 ? "es" : ""}
                  </strong>
                </div>
                <p>
                  {winners.map((winner) => winner.name).join(", ")} recebe{" "}
                  {currency(prizePerWinner)}.
                </p>
              </>
            ) : (
              <p>Ninguém pago acertou o placar exato. Vale combinar a regra do churrasco.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
