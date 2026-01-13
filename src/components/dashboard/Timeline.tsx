import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead, getPerformanceColor, formatTime } from "@/lib/mockData";
import { Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 15;

interface TimelineProps {
  leads: Lead[];
}

/**
 * Identifica o tipo de etapa do lead baseado no stage_name
 */
function getProfileType(stageName: string | null): {
  label: string;
  variant: 'default' | 'destructive' | 'secondary' | 'outline';
  className: string;
} {
  if (!stageName) {
    return {
      label: 'Outro',
      variant: 'outline',
      className: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
  }

  const stage = stageName.toLowerCase();

  if (stage.includes('lead formulário') || stage.includes('lead formularío')) {
    return {
      label: 'Lead Formulário',
      variant: 'destructive',
      className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
    };
  }

  if (stage.includes('lead chatbox')) {
    return {
      label: 'Lead Chatbox',
      variant: 'secondary',
      className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
    };
  }

  if (stage.includes('lead instagram')) {
    return {
      label: 'Lead Instagram',
      variant: 'outline',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
    };
  }

  if (stage.includes('áurea final') || stage.includes('aurea final')) {
    return {
      label: 'ÁUREA FINAL',
      variant: 'outline',
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
    };
  }

  if (stage.includes('fabio final')) {
    return {
      label: 'FABIO FINAL',
      variant: 'outline',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
    };
  }

  // Default
  return {
    label: 'Outro',
    variant: 'outline',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };
}

export const Timeline = ({ leads }: TimelineProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Todos os leads atendidos, ordenados por tempo (maior primeiro)
  const allAttendedLeads = useMemo(() => {
    return leads
      .filter(l => l.sla_minutes !== null)
      .sort((a, b) => (b.sla_minutes || 0) - (a.sla_minutes || 0));
  }, [leads]);

  // Paginação
  const totalPages = Math.ceil(allAttendedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeads = allAttendedLeads.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const maxTime = Math.max(...allAttendedLeads.map(l => l.sla_minutes || 0), 1);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Timeline de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paginatedLeads.map((lead) => {
            const widthPercentage = ((lead.sla_minutes || 0) / maxTime) * 100;
            const colorClass = getPerformanceColor(lead.sla_minutes || 0);
            
            const getBarColor = () => {
              if (colorClass === "success") return "bg-success";
              if (colorClass === "warning") return "bg-warning";
              return "bg-danger";
            };

            const getTextColor = () => {
              if (colorClass === "success") return "text-success";
              if (colorClass === "warning") return "text-warning";
              return "text-danger";
            };
            
            const profileInfo = getProfileType(lead.stage_name);
            
            return (
              <div key={lead.lead_id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.lead_name}</span>
                    <Badge 
                      variant={profileInfo.variant}
                      className={`text-xs font-medium ${profileInfo.className}`}
                    >
                      {profileInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{lead.sdr_name}</span>
                    <span className={`font-semibold ${getTextColor()}`}>
                      {formatTime(lead.sla_minutes)}
                    </span>
                  </div>
                </div>
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getBarColor()} rounded-full transition-all duration-500`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, allAttendedLeads.length)} de {allAttendedLeads.length} atendimentos
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground px-3">
                Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
