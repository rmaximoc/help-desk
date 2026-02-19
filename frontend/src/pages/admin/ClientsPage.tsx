import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientService } from '../../services/client.service';
import { Client } from '../../types';
import { Edit, Trash2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const updateClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
});

type UpdateClientFormData = z.infer<typeof updateClientSchema>;

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateClientFormData>({
    resolver: zodResolver(updateClientSchema),
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.findAll();
      setClients(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    reset({ name: client.name, email: client.email });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const openDeleteConfirm = (client: Client) => {
    setDeletingClient(client);
  };

  const closeDeleteConfirm = () => {
    setDeletingClient(null);
  };

  const onSubmit = async (data: UpdateClientFormData) => {
    if (!editingClient) return;
    setIsSubmitting(true);
    try {
      await clientService.updateByAdmin(editingClient.id, data);
      toast.success('Cliente atualizado com sucesso!');
      closeModal();
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    setIsSubmitting(true);
    try {
      await clientService.deleteByAdmin(deletingClient.id);
      toast.success('Cliente excluído com sucesso!');
      closeDeleteConfirm();
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chamados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {client.avatarUrl ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={client.avatarUrl}
                        alt={client.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge bg-gray-100 text-gray-800">
                    {client.ticketsCount || 0} chamados
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => openEditModal(client)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(client)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente cadastrado
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Editar Cliente</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Nome</label>
                  <input type="text" className="input" {...register('name')} />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">E-mail</label>
                  <input type="email" className="input" {...register('email')} />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeDeleteConfirm} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmar exclusão</h2>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o cliente <strong>{deletingClient.name}</strong>?
                <br />
                <span className="text-red-600 text-sm">
                  Todos os chamados deste cliente também serão excluídos.
                </span>
              </p>
              <div className="flex justify-end space-x-3">
                <button onClick={closeDeleteConfirm} className="btn-secondary">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={isSubmitting} className="btn-danger">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
