import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { Ticket, TicketStatus } from '../../types';
import { Loader2, Eye, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  CLOSED: 'Encerrado',
};

const statusColors: Record<TicketStatus, string> = {
  OPEN: 'badge-open',
  IN_PROGRESS: 'badge-in-progress',
  CLOSED: 'badge-closed',
};

export function ClientTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await ticketService.findOwn();
      setTickets(data);
    } catch (error) {
      toast.error('Erro ao carregar chamados');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetails = async (id: string) => {
    try {
      const ticket = await ticketService.findById(id);
      setSelectedTicket(ticket);
    } catch (error) {
      toast.error('Erro ao carregar detalhes do chamado');
    }
  };

  const closeDetails = () => {
    setSelectedTicket(null);
  };

  const filteredTickets =
    filterStatus === 'ALL'
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Chamados</h1>
        <Link to="/chamados/novo" className="btn-primary">
          <Plus className="mr-2 h-5 w-5" />
          Novo Chamado
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({tickets.length})
          </button>
          <button
            onClick={() => setFilterStatus('OPEN')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'OPEN'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Abertos ({tickets.filter((t) => t.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setFilterStatus('IN_PROGRESS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Em Atendimento ({tickets.filter((t) => t.status === 'IN_PROGRESS').length})
          </button>
          <button
            onClick={() => setFilterStatus('CLOSED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'CLOSED'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Encerrados ({tickets.filter((t) => t.status === 'CLOSED').length})
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Técnico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{ticket.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.technician?.name || '-'}
                  </p>
                  {ticket.technician?.specialty && (
                    <p className="text-sm text-gray-500">
                      {ticket.technician.specialty}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={statusColors[ticket.status]}>
                    {statusLabels[ticket.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(ticket.totalPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => openDetails(ticket.id)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {tickets.length === 0 ? (
              <div>
                <p className="mb-4">Você ainda não possui chamados</p>
                <Link to="/chamados/novo" className="btn-primary inline-flex">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeiro Chamado
                </Link>
              </div>
            ) : (
              'Nenhum chamado encontrado para o filtro selecionado'
            )}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeDetails} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Chamado #{selectedTicket.id.slice(0, 8)}
                </h2>
                <button onClick={closeDetails} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={statusColors[selectedTicket.status]}>
                      {statusLabels[selectedTicket.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Abertura</p>
                    <p className="font-medium">
                      {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Técnico Responsável</p>
                  <p className="font-medium">
                    {selectedTicket.technician?.name || 'Não atribuído'}
                  </p>
                  {selectedTicket.technician?.specialty && (
                    <p className="text-sm text-gray-500">
                      {selectedTicket.technician.specialty}
                    </p>
                  )}
                </div>

                {selectedTicket.description && (
                  <div>
                    <p className="text-sm text-gray-500">Descrição</p>
                    <p className="text-gray-900">{selectedTicket.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Serviços</p>
                  <div className="border rounded-lg divide-y">
                    {selectedTicket.services.map((service) => (
                      <div key={service.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.addedByTechnician && (
                            <span className="text-xs text-blue-600">
                              Adicionado pelo técnico
                            </span>
                          )}
                        </div>
                        <p className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(service.price)}
                        </p>
                      </div>
                    ))}
                    <div className="p-3 flex justify-between items-center bg-gray-50">
                      <p className="font-semibold">Total</p>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(selectedTicket.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTicket.closedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Data de Encerramento</p>
                    <p className="font-medium">
                      {new Date(selectedTicket.closedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={closeDetails} className="btn-secondary">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
