
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Check, User, Star } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface Professional {
  id: string;
  name: string;
  role: string | null;
  profilePhoto: string | null;
  bio: string | null;
  specialties: string[];
}

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedProfessionalId: string | null;
  onSelectProfessional: (professionalId: string | null) => void;
  showPhotos: boolean;
  allowAnyChoice: boolean;
}

export function ProfessionalSelector({
  professionals,
  selectedProfessionalId,
  onSelectProfessional,
  showPhotos,
  allowAnyChoice,
}: ProfessionalSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha o Profissional</h2>
        <p className="text-muted-foreground">
          Selecione quem você gostaria que realizasse o serviço
        </p>
      </div>

      <div className="space-y-4">
        {/* Any Available Option */}
        {allowAnyChoice && (
          <Card
            onClick={() => onSelectProfessional(null)}
            className={cn(
              'p-4 cursor-pointer transition-all duration-200 hover:shadow-glow-md',
              'hover:scale-[1.02] hover:border-neon-500/50',
              selectedProfessionalId === null && 'border-neon-500 shadow-glow-md bg-neon-500/5'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-500/20 to-neon-600/20 flex items-center justify-center border-2 border-neon-500/30">
                <Star className="h-8 w-8 text-neon-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-lg">Qualquer Profissional Disponível</h4>
                  {selectedProfessionalId === null && (
                    <div className="w-6 h-6 rounded-full bg-neon-500 flex items-center justify-center ml-auto">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Deixe-nos escolher o melhor profissional disponível para você
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Professional Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professionals.map((professional) => {
            const isSelected = selectedProfessionalId === professional.id;
            return (
              <Card
                key={professional.id}
                onClick={() => onSelectProfessional(professional.id)}
                className={cn(
                  'p-4 cursor-pointer transition-all duration-200 hover:shadow-glow-md',
                  'hover:scale-[1.02] hover:border-neon-500/50',
                  isSelected && 'border-neon-500 shadow-glow-md bg-neon-500/5'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Profile Photo or Avatar */}
                  {showPhotos && professional.profilePhoto ? (
                    <img
                      src={professional.profilePhoto}
                      alt={professional.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-neon-500/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-2 border-zinc-700">
                      <User className="h-8 w-8 text-zinc-400" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">{professional.name}</h4>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-neon-500 flex items-center justify-center ml-auto">
                          <Check className="h-4 w-4 text-black" />
                        </div>
                      )}
                    </div>

                    {professional.role && (
                      <p className="text-sm text-muted-foreground">
                        {professional.role}
                      </p>
                    )}

                    {professional.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {professional.bio}
                      </p>
                    )}

                    {professional.specialties && professional.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {professional.specialties.slice(0, 3).map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {professionals.length === 0 && !allowAnyChoice && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum profissional disponível no momento
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
