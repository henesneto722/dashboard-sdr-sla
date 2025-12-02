export interface Lead {
  lead_id: string;
  lead_name: string;
  sdr_id: string;
  sdr_name: string;
  entered_at: string;
  attended_at: string | null;
  sla_minutes: number | null;
  source: string;
  pipeline: string;
}

export interface SDRPerformance {
  sdr_id: string;
  sdr_name: string;
  average_time: number;
  leads_attended: number;
}

const sdrs = [
  { id: "sdr1", name: "Ana Silva" },
  { id: "sdr2", name: "Carlos Santos" },
  { id: "sdr3", name: "Mariana Costa" },
  { id: "sdr4", name: "Pedro Oliveira" },
  { id: "sdr5", name: "Julia Ferreira" },
];

const sources = ["Website", "LinkedIn", "Indicação", "Email Marketing", "Cold Call"];
const pipelines = ["Vendas B2B", "Vendas B2C", "Parcerias", "Enterprise"];

const generateRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
};

export const generateMockLeads = (count: number = 100): Lead[] => {
  const leads: Lead[] = [];
  
  for (let i = 0; i < count; i++) {
    const sdr = sdrs[Math.floor(Math.random() * sdrs.length)];
    const enteredDate = generateRandomDate(Math.floor(Math.random() * 30));
    const hasAttended = Math.random() > 0.1; // 90% são atendidos
    
    let attendedDate: string | null = null;
    let slaMinutes: number | null = null;
    
    if (hasAttended) {
      const enteredTime = new Date(enteredDate).getTime();
      // Tempo de atendimento varia de 5 a 30 minutos
      const delayMinutes = Math.floor(Math.random() * 26) + 5;
      attendedDate = new Date(enteredTime + delayMinutes * 60000).toISOString();
      slaMinutes = delayMinutes;
    }
    
    leads.push({
      lead_id: `lead${i + 1}`,
      lead_name: `Lead ${i + 1}`,
      sdr_id: sdr.id,
      sdr_name: sdr.name,
      entered_at: enteredDate,
      attended_at: attendedDate,
      sla_minutes: slaMinutes,
      source: sources[Math.floor(Math.random() * sources.length)],
      pipeline: pipelines[Math.floor(Math.random() * pipelines.length)],
    });
  }
  
  return leads.sort((a, b) => new Date(b.entered_at).getTime() - new Date(a.entered_at).getTime());
};

export const calculateSDRPerformance = (leads: Lead[]): SDRPerformance[] => {
  const sdrMap = new Map<string, { total: number; count: number; name: string }>();
  
  leads.forEach(lead => {
    if (lead.sla_minutes !== null) {
      const current = sdrMap.get(lead.sdr_id) || { total: 0, count: 0, name: lead.sdr_name };
      current.total += lead.sla_minutes;
      current.count += 1;
      sdrMap.set(lead.sdr_id, current);
    }
  });
  
  return Array.from(sdrMap.entries())
    .map(([sdr_id, data]) => ({
      sdr_id,
      sdr_name: data.name,
      average_time: Math.round(data.total / data.count),
      leads_attended: data.count,
    }))
    .sort((a, b) => a.average_time - b.average_time);
};

export const getPerformanceColor = (minutes: number): string => {
  if (minutes <= 30) return "success";
  if (minutes <= 60) return "warning";
  return "danger";
};

export const getPerformanceLabel = (minutes: number): string => {
  if (minutes <= 30) return "Rápido";
  if (minutes <= 60) return "Aceitável";
  return "Lento";
};
