import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketService } from '../../services/ticket.service';
import { serviceService } from '../../services/service.service';
import { technicianService } from '../../services/technician.service';
import { Service, Technician } from '../../types';
import { Loader2, ArrowLeft, User, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const newTicketSchema = z.object({
  technicianId: z.string().min(1, 'Selecione um técnico'),
  serviceIds: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
  description: z.string().optional(),
});

type NewTicketFormData = z.infer<typeof newTicketSchema>;

export function NewTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<NewTicketFormData>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: {
      technicianId: '',
      serviceIds: [],
      description: '',
    },
  });

  const selectedServiceIds = watch('serviceIds');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, techniciansData] = await Promise.all([
        serviceService.findAll(),
        technicianService.findAvailable(),
      ]);
      setServices(servicesData.filter((s: Service) => s.isActive));
      setTechnicians(techniciansData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return selectedServiceIds.reduce((total, id) => {
      const service = services.find((s) => s.id === id);
      return total + (service?.price || 0);
    }, 0);
  };

  const onSubmit = async (data: NewTicketFormData) => {
    setIsSubmitting(true);
    try {
      await ticketService.create(data);
      toast.success('Chamado criado com sucesso!');
      navigate('/chamados');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar chamado');
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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Novo Chamado</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleção de técnico */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Selecione o Técnico</h2>

          {technicians.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="technicianId"
                control={control}
                render={({ field }) => (
                  <>
                    {technicians.map((tech) => (
                      <div
                        key={tech.id}
                        onClick={() => field.onChange(tech.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          field.value === tech.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {tech.avatarUrl ? (
                              <img
                                src={tech.avatarUrl}
                                alt={tech.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{tech.name}</p>
                            {tech.specialty && (
                              <p className="text-sm text-gray-500">{tech.specialty}</p>
                            )}
                            {tech.availableHours && tech.availableHours.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                Horários: {tech.availableHours.join(', ')}
                              </p>
                            )}
                          </div>
                          {field.value === tech.id && (
                            <Check className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum técnico disponível no momento
            </p>
          )}
          {errors.technicianId && (
            <p className="error-message mt-2">{errors.technicianId.message}</p>
          )}
        </div>

        {/* Seleção de serviços */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Selecione os Serviços</h2>

          {services.length > 0 ? (
            <div className="space-y-3">
              <Controller
                name="serviceIds"
                control={control}
                render={({ field }) => (
                  <>
                    {services.map((service) => {
                      const isSelected = field.value.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(field.value.filter((id) => id !== service.id));
                            } else {
                              field.onChange([...field.value, service.id]);
                            }
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-gray-500">{service.description}</p>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(service.price)}
                          </p>
                        </div>
                      );
                    })}
                  </>
                )}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum serviço disponível no momento
            </p>
          )}
          {errors.serviceIds && (
            <p className="error-message mt-2">{errors.serviceIds.message}</p>
          )}
        </div>

        {/* Descrição */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Descrição (opcional)</h2>
          <textarea
            rows={4}
            className="input"
            placeholder="Descreva seu problema ou necessidade..."
            {...register('description')}
          />
        </div>

        {/* Resumo */}
        {selectedServiceIds.length > 0 && (
          <div className="card bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Resumo</h2>
            <div className="space-y-2">
              {selectedServiceIds.map((id) => {
                const service = services.find((s) => s.id === id);
                return service ? (
                  <div key={id} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(service.price)}
                    </span>
                  </div>
                ) : null;
              })}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedServiceIds.length === 0}
            className="btn-primary"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Chamado
          </button>
        </div>
      </form>
    </div>
  );
}
