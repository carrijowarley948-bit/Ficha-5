
import { useState, useEffect } from "react";
import Card from "./Card.jsx";

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [randomCard, setRandomCard] = useState(null);
  const [sorted, setSorted] = useState(false);

  // Formulário da Ficha 5
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [attack, setAttack] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/cartas")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setCards(data))
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    setFormError("");

    const card = {
      name,
      type,
      attack: Number(attack),
      defense: 0
    };

    setSending(true);

    fetch("http://localhost:3000/api/cartas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(card)
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return data;
      })
      .then((savedCard) => {
        setCards([...cards, savedCard]);

        setName("");
        setType("");
        setAttack("");
        setFormError("");
      })
      .catch((err) => {
        setFormError(err.message);
      })
      .finally(() => {
        setSending(false);
      });
  }

  if (loading) {
    return <main><p>A carregar...</p></main>;
  }

  if (error) {
    return <main><p>Erro: {error}</p></main>;
  }

  let visible = cards
    .filter((card) => filter === "Todas" || card.type === filter)
    .filter((card) => card.name.toLowerCase().includes(search.toLowerCase()));

  if (sorted) {
    visible = [...visible].sort((a, b) => b.attack - a.attack);
  }

  function pickRandom() {
    if (cards.length === 0) return;
    setRandomCard(cards[Math.floor(Math.random() * cards.length)]);
  }

  return (
    <>
      <h1>A minha coleção</h1>

      <p>
        Tenho {cards.length} cartas · a mostrar {visible.length}
      </p>

      <h2>Adicionar carta</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da carta"
            required
          />
        </div>

        <div>
          <label>Tipo:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Escolher tipo</option>
            <option value="Criatura">Criatura</option>
            <option value="Feitiço">Feitiço</option>
          </select>
        </div>

        <div>
          <label>Ataque:</label>
          <input
            type="number"
            value={attack}
            onChange={(e) => setAttack(e.target.value)}
            placeholder="Ataque"
            min="0"
            required
          />
        </div>

        <button type="submit" disabled={sending}>
          {sending ? "A enviar" : "Adicionar carta"}
        </button>

        {formError && <p>{formError}</p>}
      </form>

      <div>
        <button onClick={() => setFilter("Todas")}>Todas</button>
        <button onClick={() => setFilter("Criatura")}>Só criaturas</button>
        <button onClick={() => setFilter("Feitiço")}>Só feitiços</button>
        <button onClick={() => setSorted(!sorted)}>
          {sorted ? "Ordem original" : "Ordenar por ataque"}
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Procurar pelo nome…"
      />

      {visible.length === 0 ? (
        <p>Nenhuma carta corresponde.</p>
      ) : (
        <ul>
          {visible.map((card) => (
            <Card key={card.name} {...card} />
          ))}
        </ul>
      )}

      <h2>Carta à sorte</h2>
      <button onClick={pickRandom}>Escolher outra</button>

      {randomCard && (
        <p>
          <b>{randomCard.name}</b> — {randomCard.type} ataque {randomCard.attack} ·
          defesa {randomCard.defense}
        </p>
      )}
    </>
  );
}

export default App;
