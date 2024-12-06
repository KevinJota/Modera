import React, { useEffect, useState } from 'react';
import './../css/Historico.css';

const Historico = () => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await fetch('https://volun-api-eight.vercel.app/acoes-moderacao');
        if (!response.ok) {
          throw new Error('Erro ao buscar o histórico');
        }
        const data = await response.json();
        setHistorico(data.reverse());  // Inverte a ordem dos dados para mostrar os mais recentes primeiro
      } catch (err) {
        console.error('Erro ao carregar o histórico:', err);
        setError('Erro ao carregar o histórico.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  if (loading) {
    return <div className="historico-message">Carregando...</div>;
  }

  if (error) {
    return <div className="historico-message error">Erro: {error}</div>;
  }

  if (!historico.length) {
    return <div className="historico-message">Sem histórico registrado.</div>;
  }

  return (
    <div className="historico-container">
      <h1>Histórico de Ações</h1>
      <ul className="historico-list">
        {historico.map((acao, index) => (
          <li key={index} className="historico-item">
            <div className="historico-item-header">
              <span className="acao-tipo">{acao.acao}</span>
              <span className="acao-data">{new Date(acao.data).toLocaleString()}</span>
            </div>
            <div className="historico-item-body">
              <p><strong>Moderador:</strong> {acao.moderador_id}</p>
              <p><strong>Alvo:</strong> {acao.alvo_tipo} (ID: {acao.alvo_id})</p>
              <p><strong>Descrição:</strong> {acao.descricao || 'Sem descrição'}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Historico;

