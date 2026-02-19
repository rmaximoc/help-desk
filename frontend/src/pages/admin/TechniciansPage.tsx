import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { technicianService } from '../../services/technician.service';
import { Technician } from '../../types';
import { Plus, Edit, Copy, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const createTechnicianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
});

type CreateTechnicianFormData = z.infer<typeof createTechnicianSchema>;

export function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [newTechnicianPassword, setNewTechnicianPassword] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTechnicianFormData>({
    resolver: zodResolver(createTechnicianSchema),
  });

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const data = await technicianService.findAll();
      setTechnicians(data);
    } catch (error) {
      toast.error('Erro ao carregar técnicos');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTechnician(null);
    setNewTechnicianPassword(null);
    reset({ name: '', email: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (technician: Technician) => {
    setEditingTechnician(technician);
    setNewTechnicianPassword(null);
    reset({ name: technician.name, email: technician.email });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTechnician(null);
    setNewTechnicianPassword(null);
    reset();
  };

  const onSubmit = async (data: CreateTechnicianFormData) => {
    setIsSubmitting(true);
    try {
      if (editingTechnician) {
        await technicianService.update(editingTechnician.id, data);
        toast.success('Técnico atualizado com sucesso!');
        closeModal();
      } else {
        const result = await technicianService.create(data);
        if (result.temporaryPassword) {
          setNewTechnicianPassword(result.temporaryPassword);
          toast.success('Técnico criado com sucesso!');
        }
      }
      loadTechnicians();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar técnico');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (newTechnicianPassword) {
      navigator.clipboard.writeText(newTechnicianPassword);
      toast.success('Senha copiada!');
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
        <h1 className="text-2xl font-bold text-gray-900">Técnicos</h1>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Novo Técnico
        </button>
      </div>

      {/* Lista de técnicos */}
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
                Status
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
            {technicians.map((technician) => (
              <tr key={technician.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {technician.avatarUrl ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={technician.avatarUrl}
                        alt={technician.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {technician.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {technician.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {technician.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {technician.isFirstAccess ? (
                    <span className="badge bg-yellow-100 text-yellow-800">
                      Primeiro acesso pendente
                    </span>
                  ) : (
                    <span className="badge bg-green-100 text-green-800">
                      Ativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(technician.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(technician)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {technicians.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum técnico cadastrado
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
                  {editingTechnician ? 'Editar Técnico' : 'Novo Técnico'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {newTechnicianPassword ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      Técnico criado com sucesso! Anote a senha provisória:
                    </p>
                    <div className="flex items-center justify-between bg-white border rounded p-2">
                      <code className="text-lg font-mono">{newTechnicianPassword}</code>
                      <button
                        onClick={copyPassword}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      O técnico deverá alterar esta senha no primeiro acesso.
                    </p>
                  </div>
                  <button onClick={closeModal} className="w-full btn-primary">
                    Fechar
                  </button>
                </div>
              ) : (
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
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : editingTechnician ? (
                        'Salvar'
                      ) : (
                        'Criar'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
