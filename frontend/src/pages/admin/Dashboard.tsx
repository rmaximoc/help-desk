import { useEffect, useState } from 'react';
import { Users, Wrench, Ticket, TrendingUp } from 'lucide-react';
import { technicianService } from '../../services/technician.service';
import { clientService } from '../../services/client.service';
import { serviceService } from '../../services/service.service';
import { ticketService } from '../../services/ticket.service';

interface DashboardStats {
  technicians: number;
  clients: number;
  services: number;
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    technicians: 0,
    clients: 0,
    services: 0,
    tickets: { total: 0, open: 0, inProgress: 0, closed: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [technicians, clients, services, tickets] = await Promise.all([
          technicianService.findAll(),
          clientService.findAll(),
          serviceService.findAllAdmin(),
          ticketService.findAll(),
        ]);

        setStats({
          technicians: technicians.length,
          clients: clients.length,
          services: services.filter((s) => s.isActive).length,
          tickets: {
            total: tickets.length,
            open: tickets.filter((t) => t.status === 'OPEN').length,
            inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
            closed: tickets.filter((t) => t.status === 'CLOSED').length,
          },
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Técnicos',
      value: stats.technicians,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Clientes',
      value: stats.clients,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Serviços Ativos',
      value: stats.services,
      icon: Wrench,
      color: 'bg-purple-500',
    },
    {
      title: 'Total de Chamados',
      value: stats.tickets.total,
      icon: Ticket,
      color: 'bg-orange-500',
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status dos Chamados */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status dos Chamados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Abertos</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.tickets.open}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Em Atendimento</p>
            <p className="text-3xl font-bold text-blue-700">{stats.tickets.inProgress}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Encerrados</p>
            <p className="text-3xl font-bold text-green-700">{stats.tickets.closed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
