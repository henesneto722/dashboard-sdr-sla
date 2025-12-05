import { useState } from "react";
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
import { Lead, getPerformanceColor, getPerformanceLabel } from "@/lib/mockData";
import { ArrowUpDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadsTableProps {
  leads: Lead[];
  filterByImportant?: boolean; // filtra apenas leads importantes
}

type SortField = "lead_name" | "sdr_name" | "entered_at" | "sla_minutes" | "stage_name";

// Mapeamento de nomes de stages para textos mais amigáveis
const getDisplayName = (stageName: string | null, isAttended: boolean): string => {
  // Se foi atendido (está em funil específico), sempre mostrar "Atendido"
  if (isAttended) return 'Atendido';
  
  if (!stageName) return '-';
  
  return stageName;
};

// Helper para cor do perfil
const getProfileColor = (stageName: string | null, isAttended: boolean): { bg: string; text: string; border: string } => {
  // Se foi atendido, sempre verde
  if (isAttended) {
    return { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' };
  }
  
  const stage = (stageName || '').toLowerCase();
  
  if (stage.includes('tem perfil') || stage === 'tem perfil') {
    return { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' };
  }
  if (stage.includes('perfil menor') || stage === 'perfil menor') {
    return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' };
  }
  if (stage.includes('inconclusivo') || stage === 'inconclusivo') {
    return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/30' };
  }
  if (stage.includes('sem perfil') || stage === 'sem perfil') {
    return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
  }
  // Default para pendentes
  return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' };
};

export const LeadsTable = ({ leads, filterByImportant = false }: LeadsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("entered_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  // Filtrar leads importantes se necessário
  const filteredLeads = filterByImportant 
    ? leads.filter(lead => {
        const stage = (lead.stage_name || '').toLowerCase();
        return stage.includes('tem perfil') || stage.includes('perfil menor');
      })
    : leads;

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
                    SDR
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
                    Perfil
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
                    Tempo (min)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.slice(0, 20).map((lead, index) => {
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
                        const colors = getProfileColor(lead.stage_name, isAttended);
                        const displayText = getDisplayName(lead.stage_name, isAttended);
                        
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
                        {lead.sla_minutes ? `${lead.sla_minutes}min - ${label}` : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Mostrando {Math.min(20, sortedLeads.length)} de {sortedLeads.length} leads
          {filterByImportant && " (filtrado por leads importantes)"}
        </p>
      </CardContent>
    </Card>
  );
};
