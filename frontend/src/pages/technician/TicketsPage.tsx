import { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticket.service';
import { serviceService } from '../../services/service.service';
import { Ticket, TicketStatus, Service } from '../../types';
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

export function TechnicianTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsData, servicesData] = await Promise.all([
        ticketService.findAssigned(),
        serviceService.findAll(),
      ]);
      setTickets(ticketsData);
      setServices(servicesData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetails = async (id: string) => {
    try {
      const ticket = await ticketService.findById(id);
      setSelectedTicket(ticket);
      setShowAddService(false);
      setSelectedServiceId('');
    } catch (error) {
      toast.error('Erro ao carregar detalhes do chamado');
    }
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setShowAddService(false);
    setSelectedServiceId('');
  };

  const updateStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      const updated = await ticketService.updateStatus(selectedTicket.id, { status });
      setSelectedTicket(updated);
      setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
      toast.success('Status atualizado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setIsUpdating(false);
    }
  };

  const addService = async () => {
    if (!selectedTicket || !selectedServiceId) return;
    setIsUpdating(true);
    try {
      const updated = await ticketService.addService(selectedTicket.id, {
        serviceId: selectedServiceId,
      });
      setSelectedTicket(updated);
      setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
      setShowAddService(false);
      setSelectedServiceId('');
      toast.success('Serviço adicionado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar serviço');
    } finally {
      setIsUpdating(false);
    }
  };

  const availableServices = selectedTicket
    ? services.filter(
        (s) => !selectedTicket.services.some((ts) => ts.id === s.id)
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Chamados</h1>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serviços
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
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{ticket.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.client?.name}
                    </p>
                    <p className="text-sm text-gray-500">{ticket.client?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={statusColors[ticket.status]}>
                    {statusLabels[ticket.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.services.length} serviço(s)
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

        {tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum chamado atribuído
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
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{selectedTicket.client?.name}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.client?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={statusColors[selectedTicket.status]}>
                      {statusLabels[selectedTicket.status]}
                    </span>
                    {selectedTicket.status !== 'CLOSED' && (
                      <div className="flex space-x-2">
                        {selectedTicket.status === 'OPEN' && (
                          <button
                            onClick={() => updateStatus('IN_PROGRESS')}
                            disabled={isUpdating}
                            className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm py-1 px-3"
                          >
                            Iniciar Atendimento
                          </button>
                        )}
                        {selectedTicket.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateStatus('CLOSED')}
                            disabled={isUpdating}
                            className="btn bg-green-600 text-white hover:bg-green-700 text-sm py-1 px-3"
                          >
                            Encerrar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedTicket.description && (
                  <div>
                    <p className="text-sm text-gray-500">Descrição</p>
                    <p className="text-gray-900">{selectedTicket.description}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Serviços</p>
                    {selectedTicket.status !== 'CLOSED' && availableServices.length > 0 && (
                      <button
                        onClick={() => setShowAddService(!showAddService)}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Serviço
                      </button>
                    )}
                  </div>

                  {showAddService && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="input mb-2"
                      >
                        <option value="">Selecione um serviço</option>
                        {availableServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} -{' '}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(service.price)}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowAddService(false)}
                          className="btn-secondary text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={addService}
                          disabled={!selectedServiceId || isUpdating}
                          className="btn-primary text-sm"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Adicionar'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

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
