import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lead, getPerformanceColor, getPerformanceLabel, formatTime } from "@/lib/mockData";
import { ArrowUpDown, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 20;

interface LeadsTableProps {
  leads: Lead[];
}

type SortField = "lead_name" | "sdr_name" | "entered_at" | "sla_minutes" | "stage_name";

// Mapeamento de nomes de stages para textos mais amigáveis
const getDisplayName = (stageName: string | null, isAttended: boolean, status: string | null): string => {
  // Se está perdido, mostrar "PERDIDO"
  if (status === 'lost') return 'PERDIDO';
  
  // Se está inválido, mostrar "INVALIDO"
  if (status === 'INVALIDO') return 'INVALIDO';
  
  // Se foi atendido (está em funil específico), sempre mostrar "Atendido"
  if (isAttended) return 'Atendido';
  
  if (!stageName) return '-';
  
  return stageName;
};

// Helper para cor do perfil
const getProfileColor = (stageName: string | null, isAttended: boolean, status: string | null): { bg: string; text: string; border: string } => {
  // Se está perdido, sempre preto
  if (status === 'lost') {
    return { bg: 'bg-gray-900/10 dark:bg-gray-100/10', text: 'text-gray-900 dark:text-gray-100', border: 'border-gray-900/30 dark:border-gray-100/30' };
  }
  
  // Se está inválido, sempre vermelho
  if (status === 'INVALIDO') {
    return { bg: 'bg-red-900/10 dark:bg-red-100/10', text: 'text-red-900 dark:text-red-100', border: 'border-red-900/30 dark:border-red-100/30' };
  }
  
  // Se foi atendido, sempre verde
  if (isAttended) {
    return { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' };
  }
  
  const stage = (stageName || '').toLowerCase();
  
  if (stage.includes('lead formulário') || stage.includes('lead formularío')) {
    return { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' };
  }
  if (stage.includes('lead chatbox')) {
    return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' };
  }
  if (stage.includes('lead instagram')) {
    return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' };
  }
  if (stage.includes('áurea final') || stage.includes('aurea final')) {
    return { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' };
  }
  if (stage.includes('fabio final')) {
    return { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/30' };
  }
  // Default para pendentes
  return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
};

export const LeadsTable = ({ leads }: LeadsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("entered_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset para página 1 quando os leads mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [leads.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredLeads = leads;

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "entered_at") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Detalhamento de Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("lead_name")}
                    className="font-semibold"
                  >
                    Lead
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("sdr_name")}
                    className="font-semibold"
                  >
                    Closer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("entered_at")}
                    className="font-semibold"
                  >
                    Entrada
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Atendimento</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("stage_name")}
                    className="font-semibold"
                  >
                    Etapa
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("sla_minutes")}
                    className="font-semibold"
                  >
                    Tempo
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead, index) => {
                const colorClass = lead.sla_minutes
                  ? getPerformanceColor(lead.sla_minutes)
                  : "muted";
                const label = lead.sla_minutes
                  ? getPerformanceLabel(lead.sla_minutes)
                  : "Pendente";

                const getBadgeVariant = () => {
                  if (colorClass === "success") return "success";
                  if (colorClass === "warning") return "warning";
                  if (colorClass === "danger") return "danger";
                  return "secondary";
                };

                return (
                  <TableRow key={lead.lead_id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <TableCell className="font-medium">{lead.lead_name}</TableCell>
                    <TableCell>{lead.sdr_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.entered_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.attended_at ? formatDate(lead.attended_at) : "-"}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const isAttended = lead.attended_at !== null;
                        const colors = getProfileColor(lead.stage_name, isAttended, lead.status);
                        const displayText = getDisplayName(lead.stage_name, isAttended, lead.status);
                        
                        return displayText !== '-' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {displayText}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant()}>
                        {lead.status === 'INVALIDO' 
                          ? 'INVALIDO' 
                          : lead.sla_minutes 
                            ? `${formatTime(lead.sla_minutes)} - ${label}` 
                            : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedLeads.length)} de {sortedLeads.length} leads
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Primeira página */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              {/* Página anterior */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Indicador de página */}
              <span className="text-sm text-muted-foreground px-3">
                Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              
              {/* Próxima página */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Última página */}
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
