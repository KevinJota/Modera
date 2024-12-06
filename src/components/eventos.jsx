import React, { useState, useEffect } from 'react';
import Modal from "react-modal";
import '../css/Eventos.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MapPin, Calendar, Users } from 'lucide-react';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventos, setSelectedEventos] = useState(null);
  const [advertencia, setAdvertencia] = useState('');
  const [moderadorId, setModeradorId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setModeradorId(user.uid);
      } else {
        setModeradorId(null);
      }
    });

    fetchEventos();

    return () => unsubscribe();
  }, []);

  const fetchEventos = async () => {
    try {
      const response = await fetch('https://volun-api-eight.vercel.app/eventos/');
      if (!response.ok) {
        throw new Error('Erro ao buscar os eventos');
      }
      const data = await response.json();
      setEventos(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const registrarAcao = async (acao, alvoId, alvoTipo, descricao) => {
    try {
      const response = await fetch('https://volun-api-eight.vercel.app/acoes-moderacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderador_id: moderadorId,
          alvo_tipo: alvoTipo,
          alvo_id: alvoId,
          acao: acao,
          descricao: descricao,      
          data: new Date().toISOString(), 
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar ação');
      }
    } catch (err) {
      console.error('Erro ao registrar ação:', err);
      throw err;
    }
  };

  const criarAdvertencia = async (usuarioId, motivo) => {
    try {
      const response = await fetch('https://volun-api-eight.vercel.app/advertencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderador_id: moderadorId,
          usuario_id: usuarioId,
          motivo: motivo,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar advertência');
      }

      return await response.json();
    } catch (err) {
      console.error('Erro ao criar advertência:', err);
      throw err;
    }
  };

  const handleDeleteEvento = async (evento) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o evento "${evento.titulo}"?`);

    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://volun-api-eight.vercel.app/eventos/${evento._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Erro ao excluir o evento:', errorDetails);
        throw new Error('Erro ao excluir o evento');
      }

      setEventos((prevEventos) =>
        prevEventos.filter((e) => e._id !== evento._id)
      );

      await registrarAcao(
        'excluir',
        evento._id,
        'evento',
        `Evento "${evento.titulo}" excluído`
      );

      alert(`Evento "${evento.titulo}" excluído com sucesso.`);
    } catch (err) {
      console.error('Erro ao excluir o evento:', err);
      alert(`Erro ao excluir o evento: ${err.message}`);
    }
  };

  const handleAdvertir = (evento) => {
    setSelectedEventos(evento); 
    setIsModalOpen(true); 
  };

  function truncateText(text, length) {
    if (text.length > length) {
      return text.substring(0, length) + "...";
    }
    return text;
  }

  const handleApplyAdvertencia = async () => {
    if (!advertencia) {
      alert('Por favor, insira uma advertência.');
      return;
    }
    try {
      const usuarioId = selectedEventos.ong_id?.criador_id;
    
      if (!usuarioId) {
        throw new Error('ID do criador não encontrado');
      }

      await criarAdvertencia(usuarioId, advertencia);
      await registrarAcao(
        'advertir',
        usuarioId,
        'usuario',
        `Advertência aplicada ao criador do evento "${selectedEventos.titulo}": ${advertencia}`
      );

      alert(`Advertência aplicada com sucesso ao criador do evento: ${selectedEventos.titulo}`);
      setIsModalOpen(false);
      setAdvertencia('');
    } catch (err) {
      console.error('Erro ao aplicar advertência:', err);
      alert(`Erro ao aplicar advertência: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="eventos-container">
      {eventos.map(evento => (
        <div key={evento._id} className="card-x">
          <div className="card-capa-img" style={{ backgroundImage: `url(${evento.imagem})` }}>
            <span className="card-title">{evento.titulo}</span>
          </div>
          <div className="card-content">
            <p className="card-description-x">{truncateText(evento.descricao, 100)}</p>
            <div className="card-text-first">
              <strong className="card-text-ongname">{evento.ongnome}</strong>
              <span className="date-container">
                <Calendar size={16} />
                {evento.data_inicial}
              </span>
            </div>
            <div className="card-text-second">
              <span className="card-address">
                <MapPin size={16} />
                {evento.localidade}
              </span>
              <span className="card-vagas">
                <Users size={16} />
                {evento.vagas} vagas
              </span>
            </div>
          </div>
          {moderadorId && (
            <div className="action-buttons">
              <button onClick={() => handleDeleteEvento(evento)} className="delete-btn">
                Excluir Evento
              </button>
              <button onClick={() => handleAdvertir(evento)} className="advert-btn">
                Aplicar Advertência
              </button>
            </div>
          )}
        </div>
      ))}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Aplicar Advertência"
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <h2>Aplicar Advertência ao Criador do Evento: {selectedEventos?.titulo}</h2>
        <textarea
          className="modal-textarea"
          value={advertencia}
          onChange={(e) => setAdvertencia(e.target.value)}
          placeholder="Digite o motivo da advertência"
          rows="5"
        />
        <div className="modal-buttons">
          <button onClick={handleApplyAdvertencia}>Aplicar Advertência</button>
          <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
};

export default Eventos;


