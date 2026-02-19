import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { serviceService } from '../../services/service.service';
import { Service } from '../../types';
import { Plus, Edit, Power, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'O preço deve ser maior que zero',
  }),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await serviceService.findAllAdmin();
      setServices(data);
    } catch (error) {
      toast.error('Erro ao carregar serviços');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    reset({ name: '', description: '', price: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    reset();
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
      };

      if (editingService) {
        await serviceService.update(editingService.id, payload);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await serviceService.create(payload);
        toast.success('Serviço criado com sucesso!');
      }
      closeModal();
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      if (service.isActive) {
        await serviceService.deactivate(service.id);
        toast.success('Serviço desativado!');
      } else {
        await serviceService.activate(service.id);
        toast.success('Serviço ativado!');
      }
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar status');
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
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Novo Serviço
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className={!service.isActive ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{service.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {service.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(service.price)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {service.isActive ? (
                    <span className="badge bg-green-100 text-green-800">Ativo</span>
                  ) : (
                    <span className="badge bg-red-100 text-red-800">Inativo</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`${
                      service.isActive
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                    }`}
                    title={service.isActive ? 'Desativar' : 'Ativar'}
                  >
                    <Power className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum serviço cadastrado
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </h2>
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
                  <label className="label">Descrição</label>
                  <textarea className="input" rows={3} {...register('description')} />
                </div>
                <div>
                  <label className="label">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    {...register('price')}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : editingService ? (
                      'Salvar'
                    ) : (
                      'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
