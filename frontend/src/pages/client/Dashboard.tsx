import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { Ticket, TicketStatus } from '../../types';
import { Loader2, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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

export function ClientDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const closedTickets = tickets.filter((t) => t.status === 'CLOSED').length;

  const recentTickets = tickets.slice(0, 5);

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
        <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
        <Link to="/chamados/novo" className="btn-primary">
          <Plus className="mr-2 h-5 w-5" />
          Novo Chamado
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Abertos</p>
              <p className="text-2xl font-semibold text-gray-900">{openTickets}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Em Atendimento</p>
              <p className="text-2xl font-semibold text-gray-900">{inProgressTickets}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Encerrados</p>
              <p className="text-2xl font-semibold text-gray-900">{closedTickets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chamados Recentes</h2>
          <Link to="/chamados" className="text-primary-600 hover:text-primary-700 text-sm">
            Ver todos
          </Link>
        </div>

        {recentTickets.length > 0 ? (
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      #{ticket.id.slice(0, 8)}
                    </span>
                    <span className={statusColors[ticket.status]}>
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Técnico: {ticket.technician?.name || 'Não atribuído'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {ticket.services.length} serviço(s) •{' '}
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(ticket.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Você ainda não possui chamados</p>
            <Link to="/chamados/novo" className="btn-primary">
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeiro Chamado
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
