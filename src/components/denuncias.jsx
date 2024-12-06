import React, { useState, useEffect } from 'react';
import './../css/Denuncias.css';

const Denuncias = () => {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDenuncias = async () => {
      try {
        const response = await fetch('https://volun-api-eight.vercel.app/denuncias/');
        if (!response.ok) {
          throw new Error('Erro ao buscar as denúncias');
        }
        const data = await response.json();
        setDenuncias(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDenuncias();
  }, []);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  const renderDenunciaInfo = (denuncia) => {
    return (
      <>
        <p className="info-item"><strong>ID do Denunciante:</strong> {denuncia.denunciante_id}</p>
        {denuncia.motivo && (
          <p className="info-item">
            <strong>Motivo:</strong> {Array.isArray(denuncia.motivo) ? denuncia.motivo.join(', ') : denuncia.motivo}
          </p>
        )}
        {denuncia.descricao && (
          <p className="info-item"><strong>Descrição:</strong> {denuncia.descricao}</p>
        )}
        {denuncia.org_id && denuncia.org_id.nome && (
          <p className="info-item"><strong>Organização:</strong> {denuncia.org_id.nome}</p>
        )}
        {denuncia.evento_id && denuncia.evento_id.titulo && (
          <p className="info-item"><strong>Evento:</strong> {denuncia.evento_id.titulo}</p>
        )}
        {denuncia.comentario_id && denuncia.comentario_id.usuario_id && (
          <p className="info-item"><strong>Usuário do Comentário:</strong> {denuncia.comentario_id.usuario_id}</p>
        )}
        {denuncia.denunciado_id && (
          <p className="info-item"><strong>ID do Denunciado:</strong> {denuncia.denunciado_id}</p>
        )}
      </>
    );
  };

  return (
    <div className="denuncias-container">
      <h1>Denúncias</h1>
      <div className="cards-denuncias-container">
        {denuncias.map((denuncia) => (
          <div key={denuncia._id} className="card-denuncias">
            <div className="card-denuncias-header">
              <h3>Denúncia #{denuncia._id.slice(-4)}</h3>
              <p className="date">{new Date(denuncia.data).toLocaleString()}</p>
            </div>
            <div className="card-denuncias-body">
              {renderDenunciaInfo(denuncia)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Denuncias;

