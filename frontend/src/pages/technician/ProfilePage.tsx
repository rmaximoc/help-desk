import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { technicianService } from '../../services/technician.service';
import { Loader2, Camera, User } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  availableHours: z.array(z.string()).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const defaultHours = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00',
];

export function TechnicianProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedHours, setSelectedHours] = useState<string[]>(
    user?.technician?.availableHours || defaultHours
  );

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.technician?.phone || '',
      specialty: user?.technician?.specialty || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updated = await technicianService.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        availableHours: selectedHours,
      });
      updateUser(updated);
      toast.success('Perfil atualizado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await technicianService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Senha alterada com sucesso!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const updated = await technicianService.uploadAvatar(formData);
      updateUser(updated);
      toast.success('Avatar atualizado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const toggleHour = (hour: string) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter((h) => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour].sort());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Foto de Perfil</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
              )}
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full cursor-pointer hover:bg-primary-700"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Clique no ícone para alterar sua foto de perfil
              </p>
              <p className="text-xs text-gray-400">JPG, PNG ou GIF. Máximo 5MB.</p>
            </div>
          </div>
        </div>

        {/* Dados pessoais */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dados Pessoais</h2>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome</label>
                <input type="text" className="input" {...registerProfile('name')} />
                {profileErrors.name && (
                  <p className="error-message">{profileErrors.name.message}</p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" {...registerProfile('email')} />
                {profileErrors.email && (
                  <p className="error-message">{profileErrors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Telefone</label>
                <input type="text" className="input" {...registerProfile('phone')} />
              </div>
              <div>
                <label className="label">Especialidade</label>
                <input type="text" className="input" {...registerProfile('specialty')} />
              </div>
            </div>

            <div>
              <label className="label">Horários Disponíveis</label>
              <div className="flex flex-wrap gap-2">
                {defaultHours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHour(hour)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedHours.includes(hour)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Alterar senha */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="label">Senha Atual</label>
              <input
                type="password"
                className="input"
                {...registerPassword('currentPassword')}
              />
              {passwordErrors.currentPassword && (
                <p className="error-message">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nova Senha</label>
                <input
                  type="password"
                  className="input"
                  {...registerPassword('newPassword')}
                />
                {passwordErrors.newPassword && (
                  <p className="error-message">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className="label">Confirmar Nova Senha</label>
                <input
                  type="password"
                  className="input"
                  {...registerPassword('confirmPassword')}
                />
                {passwordErrors.confirmPassword && (
                  <p className="error-message">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-primary"
              >
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Alterar Senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
