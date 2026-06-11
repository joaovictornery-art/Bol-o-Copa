import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  Clipboard,
  Link,
  Lock,
  Minus,
  Plus,
  Settings,
  Target,
  Trophy,
  Upload,
  Users,
} from "lucide-react";
import { isFirebaseConfigured } from "./firebase";
import {
  createPool,
  submitBet,
  subscribeBets,
  subscribePools,
  updateBetConfirmed,
  updatePoolResult,
} from "./poolService";

const PIX_KEY = "bolaochurras2026@pix.com";
const MAX_RECEIPT_SIZE = 2 * 1024 * 1024;
const DEFAULT_POOL_ID = "brasil-marrocos-2026-06-13";

const demoPools = [
  {
    id: DEFAULT_POOL_ID,
    homeTeam: "Brasil",
    awayTeam: "Marrocos",
    matchLabel: "Sábado, 13 jun 2026 · 19:00 BRT",
    phase: "Copa do Mundo 2026",
    entryFee: 5,
    pixKey: PIX_KEY,
    officialHome: 2,
    officialAway: 1,
    officialScorer: "Vini Jr.",
    resultPublished: false,
  },
  {
    id: "argentina-mexico-demo",
    homeTeam: "Argentina",
    awayTeam: "México",
    matchLabel: "Domingo, 14 jun 2026 · 16:00 BRT",
    phase: "Bolão teste",
    entryFee: 5,
    pixKey: PIX_KEY,
    officialHome: 0,
    officialAway: 0,
    officialScorer: "",
    resultPublished: false,
  },
];

const demoBets = {
  [DEFAULT_POOL_ID]: [
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
  ],
  "argentina-mexico-demo": [
    {
      id: 11,
      name: "Neymar Júnior",
      home: 1,
      away: 1,
      scorer: "Messi",
      receiptName: "pix-neymar.png",
      confirmed: true,
    },
  ],
};

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
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
    officialScorer?.trim() &&
    participant.scorer?.trim() &&
    normalizeText(participant.scorer) === normalizeText(officialScorer);

  let points = exactScore ? 3 : correctOutcome ? 1 : 0;
  if (scorerHit) points += 1;
  return points;
}

function getInitials(teamName) {
  return teamName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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

function PoolBadge({ team, tone }) {
  return (
    <div className={`pool-badge ${tone}`} aria-hidden="true">
      {getInitials(team)}
    </div>
  );
}

function NewPoolForm({ onCreate, disabled }) {
  const [homeTeam, setHomeTeam] = useState("Brasil");
  const [awayTeam, setAwayTeam] = useState("Marrocos");
  const [matchLabel, setMatchLabel] = useState("Sábado, 13 jun 2026 · 19:00 BRT");
  const [phase, setPhase] = useState("Copa do Mundo 2026");
  const [entryFee, setEntryFee] = useState(5);
  const [pixKey, setPixKey] = useState(PIX_KEY);

  function handleSubmit(event) {
    event.preventDefault();
    onCreate({
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      matchLabel: matchLabel.trim(),
      phase: phase.trim(),
      entryFee: Number(entryFee) || 5,
      pixKey: pixKey.trim(),
    });
  }

  return (
    <form className="new-pool-form" onSubmit={handleSubmit}>
      <div className="two-column">
        <label>
          <span>Time A</span>
          <input value={homeTeam} onChange={(event) => setHomeTeam(event.target.value)} />
        </label>
        <label>
          <span>Time B</span>
          <input value={awayTeam} onChange={(event) => setAwayTeam(event.target.value)} />
        </label>
      </div>
      <label>
        <span>Data e horário</span>
        <input
          value={matchLabel}
          onChange={(event) => setMatchLabel(event.target.value)}
        />
      </label>
      <label>
        <span>Competição ou contexto</span>
        <input value={phase} onChange={(event) => setPhase(event.target.value)} />
      </label>
      <div className="two-column">
        <label>
          <span>Aposta</span>
          <input
            min="1"
            max="20"
            type="number"
            value={entryFee}
            onChange={(event) => setEntryFee(event.target.value)}
          />
        </label>
        <label>
          <span>Pix</span>
          <input value={pixKey} onChange={(event) => setPixKey(event.target.value)} />
        </label>
      </div>
      <button type="submit" className="secondary-button compact" disabled={disabled}>
        Criar bolão
      </button>
    </form>
  );
}

export function App() {
  const [pools, setPools] = useState(demoPools);
  const [betsByPool, setBetsByPool] = useState(demoBets);
  const [selectedPoolId, setSelectedPoolId] = useState(() => {
    return new URLSearchParams(window.location.search).get("bolao") || DEFAULT_POOL_ID;
  });
  const [name, setName] = useState("");
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [scorer, setScorer] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptInputKey, setReceiptInputKey] = useState(0);
  const [officialHome, setOfficialHome] = useState(2);
  const [officialAway, setOfficialAway] = useState(1);
  const [officialScorer, setOfficialScorer] = useState("Vini Jr.");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const activePool = pools.find((pool) => pool.id === selectedPoolId) || pools[0];
  const poolId = activePool?.id;
  const bets = betsByPool[poolId] || [];
  const entryFee = Number(activePool?.entryFee || 5);
  const confirmedParticipants = bets.filter((participant) => participant.confirmed);
  const totalPot = bets.length * entryFee;
  const confirmedPot = confirmedParticipants.length * entryFee;
  const resultPublished = Boolean(activePool?.resultPublished);

  const poolLink = useMemo(() => {
    if (!poolId) return "";
    return `${window.location.origin}${window.location.pathname}?bolao=${poolId}`;
  }, [poolId]);

  const ranking = useMemo(() => {
    if (!resultPublished) return [];

    return confirmedParticipants
      .map((participant) => ({
        ...participant,
        points: getPoints(participant, officialHome, officialAway, officialScorer),
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  }, [
    confirmedParticipants,
    officialAway,
    officialHome,
    officialScorer,
    resultPublished,
  ]);

  const topScore = ranking[0]?.points ?? 0;
  const winners = ranking.filter(
    (participant) => participant.points === topScore && topScore > 0,
  );
  const prizePerWinner = winners.length ? confirmedPot / winners.length : 0;

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    return subscribePools(
      (firebasePools) => {
        setPools(firebasePools.length ? firebasePools : demoPools);
        if (firebasePools.length && !firebasePools.some((pool) => pool.id === selectedPoolId)) {
          setSelectedPoolId(firebasePools[0].id);
        }
      },
      (error) => setStatusMessage(`Firebase: ${error.message}`),
    );
  }, [selectedPoolId]);

  useEffect(() => {
    if (!isFirebaseConfigured || !poolId) return undefined;

    return subscribeBets(
      poolId,
      (firebaseBets) =>
        setBetsByPool((current) => ({ ...current, [poolId]: firebaseBets })),
      (error) => setStatusMessage(`Firebase: ${error.message}`),
    );
  }, [poolId]);

  useEffect(() => {
    if (!activePool) return;

    setOfficialHome(Number(activePool.officialHome || 0));
    setOfficialAway(Number(activePool.officialAway || 0));
    setOfficialScorer(activePool.officialScorer || "");

    window.history.replaceState(null, "", `?bolao=${activePool.id}`);
  }, [activePool]);

  function updateLocalPool(poolIdToUpdate, changes) {
    setPools((current) =>
      current.map((pool) =>
        pool.id === poolIdToUpdate ? { ...pool, ...changes } : pool,
      ),
    );
  }

  function clampScore(value) {
    return Math.max(0, Math.min(12, value));
  }

  async function handleCreatePool(pool) {
    if (!pool.homeTeam || !pool.awayTeam || !pool.pixKey) {
      setStatusMessage("Preencha os times e o Pix para criar o bolão.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("");

    try {
      if (isFirebaseConfigured) {
        const newPoolId = await createPool(pool);
        setSelectedPoolId(newPoolId);
      } else {
        const newPoolId = `${pool.homeTeam}-${pool.awayTeam}-${Date.now()}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        setPools((current) => [
          { id: newPoolId, ...pool, resultPublished: false },
          ...current,
        ]);
        setBetsByPool((current) => ({ ...current, [newPoolId]: [] }));
        setSelectedPoolId(newPoolId);
      }

      setShowCreatePool(false);
      setStatusMessage("Bolão criado.");
    } catch (error) {
      setStatusMessage(`Não consegui criar o bolão: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatusMessage("Informe seu nome para entrar no bolão.");
      return;
    }

    if (!receiptFile) {
      setStatusMessage("Anexe o comprovante do Pix antes de enviar.");
      return;
    }

    if (receiptFile.size > MAX_RECEIPT_SIZE) {
      setStatusMessage("Comprovante muito grande. Use arquivo de até 2 MB.");
      return;
    }

    const bet = {
      name: trimmedName,
      home: homeScore,
      away: awayScore,
      scorer: scorer.trim(),
    };

    setIsBusy(true);
    setStatusMessage("");

    try {
      if (isFirebaseConfigured) {
        await submitBet(poolId, bet, receiptFile);
      } else {
        setBetsByPool((current) => ({
          ...current,
          [poolId]: [
            {
              id: Date.now(),
              ...bet,
              receiptName: receiptFile.name,
              confirmed: false,
            },
            ...(current[poolId] || []),
          ],
        }));
      }

      setName("");
      setScorer("");
      setReceiptFile(null);
      setReceiptInputKey((value) => value + 1);
      setStatusMessage("Palpite enviado. Agora é só o organizador validar.");
    } catch (error) {
      setStatusMessage(`Não consegui enviar o palpite: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleConfirmed(betId, confirmed) {
    setStatusMessage("");

    try {
      if (isFirebaseConfigured) {
        await updateBetConfirmed(poolId, betId, !confirmed);
      } else {
        setBetsByPool((current) => ({
          ...current,
          [poolId]: (current[poolId] || []).map((participant) =>
            participant.id === betId
              ? { ...participant, confirmed: !participant.confirmed }
              : participant,
          ),
        }));
      }
    } catch (error) {
      setStatusMessage(`Ação de organizador bloqueada: ${error.message}`);
    }
  }

  async function toggleResultPublished() {
    const nextPublished = !resultPublished;
    const result = {
      officialHome,
      officialAway,
      officialScorer,
      resultPublished: nextPublished,
    };

    setStatusMessage("");

    try {
      if (isFirebaseConfigured) {
        await updatePoolResult(poolId, result);
      } else {
        updateLocalPool(poolId, result);
      }
    } catch (error) {
      setStatusMessage(`Ação de organizador bloqueada: ${error.message}`);
    }
  }

  async function copyText(value, onCopied) {
    await navigator.clipboard.writeText(value);
    onCopied(true);
    window.setTimeout(() => onCopied(false), 1600);
  }

  if (!activePool) {
    return <main className="app-shell">Carregando bolões...</main>;
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
            <strong>{currency(entryFee)}</strong>
          </div>
        </div>

        <div className="headline">
          <p>{activePool.phase || "Bolão entre amigos"}</p>
          <h1>Bolão da Churrascada</h1>
        </div>

        <div className="pool-switcher">
          <div className="section-heading inline">
            <Users size={19} />
            <div>
              <span>Bolões ativos</span>
              <h2>Escolha o jogo</h2>
            </div>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => setShowCreatePool((value) => !value)}
          >
            {showCreatePool ? "Fechar" : "Novo"}
          </button>
        </div>

        <div className="pool-tabs" aria-label="Selecionar bolão">
          {pools.map((pool) => (
            <button
              type="button"
              key={pool.id}
              className={pool.id === poolId ? "active" : ""}
              onClick={() => setSelectedPoolId(pool.id)}
            >
              {pool.homeTeam} x {pool.awayTeam}
            </button>
          ))}
        </div>

        {showCreatePool && (
          <NewPoolForm onCreate={handleCreatePool} disabled={isBusy} />
        )}

        <div className="matchup" aria-label={`${activePool.homeTeam} contra ${activePool.awayTeam}`}>
          <div className="team">
            <PoolBadge team={activePool.homeTeam} tone="home" />
            <strong>{activePool.homeTeam}</strong>
          </div>
          <span className="versus">VS</span>
          <div className="team">
            <PoolBadge team={activePool.awayTeam} tone="away" />
            <strong>{activePool.awayTeam}</strong>
          </div>
        </div>

        <p className="match-date">{activePool.matchLabel}</p>
      </section>

      <section className="summary-band" aria-label="Resumo do premio">
        <div>
          <span>Prêmio total</span>
          <strong>{currency(totalPot)}</strong>
        </div>
        <div>
          <span>Participantes</span>
          <strong>{bets.length}</strong>
        </div>
        <div>
          <span>Validados</span>
          <strong>{confirmedParticipants.length}</strong>
        </div>
      </section>

      <section className="pix-section" aria-label="Pagamento via Pix">
        <div className="section-heading">
          <Clipboard size={21} />
          <div>
            <span>Pix copia e cola</span>
            <h2>Pague {currency(entryFee)} para entrar</h2>
          </div>
        </div>
        <div className="pix-copy">
          <code>{activePool.pixKey}</code>
          <button type="button" onClick={() => copyText(activePool.pixKey, setCopied)}>
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <div className="link-copy">
          <Link size={16} />
          <span>Link do bolão</span>
          <button type="button" onClick={() => copyText(poolLink, setLinkCopied)}>
            {linkCopied ? "Copiado" : "Copiar link"}
          </button>
        </div>
        <p>
          Para enviar o palpite, anexe o comprovante. Limite do arquivo: 2 MB.
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
            label={activePool.homeTeam}
            value={homeScore}
            tone="green"
            onDecrease={() => setHomeScore((value) => clampScore(value - 1))}
            onIncrease={() => setHomeScore((value) => clampScore(value + 1))}
          />
          <span className="score-x">x</span>
          <Stepper
            label={activePool.awayTeam}
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
            placeholder={`Ex.: jogador do ${activePool.homeTeam}`}
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
          disabled={!name.trim() || !receiptFile || isBusy}
        >
          {isBusy ? "Enviando..." : "Enviar palpite com comprovante"}
        </button>
        <p className="form-note">
          Regra: placar exato vale 3 pts, resultado certo vale 1 pt e marcador
          certo soma +1 pt.
        </p>
      </form>

      {statusMessage && <p className="status-message">{statusMessage}</p>}

      <section className="participants-section" aria-label="Participantes">
        <div className="participants-title">
          <div className="section-heading">
            <Users size={21} />
            <div>
              <span>Lista pública</span>
              <h2>Participantes</h2>
            </div>
          </div>
          <strong>{bets.length}</strong>
        </div>

        <div className="participant-list">
          {bets.length === 0 && (
            <p className="empty-state">Ninguém entrou ainda. O primeiro palpite puxa a resenha.</p>
          )}

          {bets.map((participant, index) => (
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
                  onClick={() => toggleConfirmed(participant.id, participant.confirmed)}
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
            label={activePool.homeTeam}
            value={officialHome}
            tone="green"
            onDecrease={() => setOfficialHome((value) => clampScore(value - 1))}
            onIncrease={() => setOfficialHome((value) => clampScore(value + 1))}
          />
          <span className="score-x">x</span>
          <Stepper
            label={activePool.awayTeam}
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

        <button type="button" className="secondary-button" onClick={toggleResultPublished}>
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

      <section className="cost-note" aria-label="Cuidados com Firebase">
        <strong>{isFirebaseConfigured ? "Firebase conectado" : "Modo demo local"}</strong>
        <p>
          Guardrail de custo: uploads limitados a 2 MB no app e nas regras.
          Antes de publicar com Storage, revisar Blaze, orçamento e uso no console.
        </p>
      </section>
    </main>
  );
}
