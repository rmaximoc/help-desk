import { useEffect, useState } from 'react';
import { Ticket, ClipboardList } from 'lucide-react';
import { ticketService } from '../../services/ticket.service';
import { Ticket as TicketType } from '../../types';

export function TechnicianDashboard() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await ticketService.findAssigned();
        setTickets(data);
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const stats = {
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter((t) => t.status === 'CLOSED').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Chamados Abertos</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.open}</p>
            </div>
            <Ticket className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Em Atendimento</p>
              <p className="text-3xl font-bold text-blue-700">{stats.inProgress}</p>
            </div>
            <ClipboardList className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Encerrados</p>
              <p className="text-3xl font-bold text-green-700">{stats.closed}</p>
            </div>
            <Ticket className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Chamados recentes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chamados Recentes</h2>
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    #{ticket.id.slice(0, 8)} - {ticket.client?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ticket.services.length} serviço(s)
                  </p>
                </div>
                <span
                  className={`badge ${
                    ticket.status === 'OPEN'
                      ? 'badge-open'
                      : ticket.status === 'IN_PROGRESS'
                      ? 'badge-in-progress'
                      : 'badge-closed'
                  }`}
                >
                  {ticket.status === 'OPEN'
                    ? 'Aberto'
                    : ticket.status === 'IN_PROGRESS'
                    ? 'Em atendimento'
                    : 'Encerrado'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum chamado atribuído</p>
        )}
      </div>
    </div>
  );
}
