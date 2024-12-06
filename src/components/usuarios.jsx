import React, { useState, useEffect } from 'react';
import Modal from "react-modal";
import '../css/Usuario.css';

const Usuarios = ({ moderadorId }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [advertencia, setAdvertencia] = useState('');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch('https://volun-api-eight.vercel.app/usuarios/');
                if (!response.ok) {
                    throw new Error('Erro ao buscar os usuários');
                }
                const data = await response.json();
                setUsuarios(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

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

    const handleSuspender = async (usuario) => {
        const action = usuario.userSuspenso ? 'reativar' : 'suspender';
        if (window.confirm(`Tem certeza que deseja ${action} o usuário ${usuario.nome}?`)) {
            try {
                const response = await fetch(`https://volun-api-eight.vercel.app/usuarios/${usuario._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userSuspenso: !usuario.userSuspenso }),
                });
    
                if (!response.ok) {
                    throw new Error(`Erro ao ${action} o usuário`);
                }
    
                const updatedUsuario = { ...usuario, userSuspenso: !usuario.userSuspenso };
                setUsuarios((prevUsuarios) =>
                    prevUsuarios.map((u) => (u._id === usuario._id ? updatedUsuario : u))
                );
    
                await registrarAcao(
                    action,
                    usuario._id,
                    'usuario',
                    `Usuário ${usuario.nome} ${action === 'reativar' ? 'reativado' : 'suspenso'}`
                );
    
                alert(`Usuário ${usuario.nome} foi ${action === 'reativar' ? 'reativado' : 'suspenso'} com sucesso.`);
            } catch (err) {
                console.error(`Erro ao ${action} usuário:`, err);
                alert(`Erro ao ${action} usuário: ${err.message}`);
            }
        }
    };

    const handleDelete = async (usuario) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
            try {
                const response = await fetch(`https://volun-api-eight.vercel.app/usuarios/${usuario._id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Erro ao excluir o usuário`);
                }

                setUsuarios((prevUsuarios) =>
                    prevUsuarios.filter((u) => u._id !== usuario._id)
                );

                await registrarAcao(
                    'excluir',
                    usuario._id,
                    'usuario',
                    `Usuário ${usuario.nome} excluído`
                );

                alert(`Usuário ${usuario.nome} foi excluído com sucesso.`);
            } catch (err) {
                console.error('Erro ao excluir usuário:', err);
                alert(`Erro ao excluir usuário: ${err.message}`);
            }
        }
    };

    const handleAdvertir = (usuario) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleApplyAdvertencia = async () => {
        if (!advertencia) {
            alert('Por favor, insira uma advertência.');
            return;
        }
        try {
            await criarAdvertencia(selectedUsuario._id, advertencia);
            await registrarAcao(
                'advertir',
                selectedUsuario._id,
                'usuario',
                `Advertência aplicada ao usuário ${selectedUsuario.nome}: ${advertencia}`
            );

            alert(`Advertência aplicada com sucesso ao usuário ${selectedUsuario.nome}.`);
            setIsModalOpen(false);
            setAdvertencia('');
        } catch (err) {
            console.error('Erro ao aplicar advertência:', err);
            alert(`Erro ao aplicar advertência: ${err.message}`);
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">Erro: {error}</div>;

    return (
        <div className="lista-usuario">
            <h1>Gerenciamento de Usuários</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Sobrenome</th>
                        <th>Telefone</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario._id}>
                            <td>{usuario.nome}</td>
                            <td>{usuario.sobrenome}</td>
                            <td>{`(${usuario.ddd}) ${usuario.telefone}`}</td>
                            <td>{usuario.userSuspenso ? 'Suspenso' : 'Ativo'}</td>
                            <td>
                                <button onClick={() => handleDelete(usuario)} className="btn-delete">
                                    Excluir
                                </button>
                                <button onClick={() => handleAdvertir(usuario)} className="btn-warn">
                                    Advertir
                                </button>
                                <button onClick={() => handleSuspender(usuario)} className={usuario.userSuspenso ? "btn-activate" : "btn-suspend"}>
                                    {usuario.userSuspenso ? 'Reativar' : 'Suspender'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Advertir Usuário"
                className="ReactModal__Content"
                overlayClassName="ReactModal__Overlay"
            >
                <h2>Advertir Usuário: {selectedUsuario?.nome}</h2>
                <textarea
                    value={advertencia}
                    onChange={(e) => setAdvertencia(e.target.value)}
                    placeholder="Digite o motivo da advertência"
                    className="modal-textarea"
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

export default Usuarios;

