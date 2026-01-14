#!/usr/bin/env python3
# Script temporário para atualizar pipedriveService.ts

import re

file_path = 'backend/src/services/pipedriveService.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Substituições
replacements = [
    (r'isIndividualSDR: boolean', 'isIndividualCloser: boolean'),
    (r'// true se é funil individual "NOME - SDR"', '// true se é funil individual "CLOSER - NOME"'),
    (r'const isIndividualSDR = nameLower\.includes\([\'"]- sdr[\'"]\) \|\| nameLower\.includes\([\'"]-sdr[\'"]\);', 
     'const isIndividualCloser = nameLower.includes(\'closer -\') || nameLower.includes(\'closer-\');'),
    (r'isSDR: isMainSDR \|\| isIndividualSDR,', 'isSDR: isMainSDR, // Apenas o funil principal SDR'),
    (r'isIndividualSDR', 'isIndividualCloser'),
    (r'isIndividualSDRPipeline', 'isIndividualCloserPipeline'),
    (r'"NOME - SDR"', '"CLOSER - NOME"'),
    (r'João - SDR', 'CLOSER - João'),
    (r'if \(!pipeline\.isSDR\) \{[^}]+\}', '// Removido: verificação isSDR'),
    (r'if \(pipeline\.name\.toLowerCase\(\)\.trim\(\) === [\'"]sdr[\'"]\)', 'if (pipeline.isMainSDR)'),
    (r'// Extrai o nome do SDR removendo "- SDR" ou "-SDR"', '// Extrai o nome do CLOSER removendo "CLOSER -" ou "CLOSER-"'),
    (r'\.replace\(/\\s\*-\\s\*SDR\\s\*/i, [\'"]\s*[\'"]\)', '.replace(/\\s*CLOSER\\s*-\\s*/i, \'\')'),
    (r'TEM PERFIL = 1.*?SEM PERFIL = 4', 'LEAD FORMULÁRIO = 1 (maior prioridade)\n * LEAD CHATBOX = 2\n * LEAD INSTAGRAM = 3\n * ÁUREA FINAL = 4\n * FABIO FINAL = 5'),
    (r'if \(name\.includes\([\'"]TEM PERFIL[\'"]\)\) return 1;', 'if (name.includes(\'LEAD FORMULÁRIO\') || name.includes(\'LEAD FORMULARIO\')) return 1;'),
    (r'if \(name\.includes\([\'"]PERFIL MENOR[\'"]\)\) return 2;', 'if (name.includes(\'LEAD CHATBOX\')) return 2;'),
    (r'if \(name\.includes\([\'"]INCONCLUSIVO[\'"]\)\) return 3;', 'if (name.includes(\'LEAD INSTAGRAM\')) return 3;'),
    (r'if \(name\.includes\([\'"]SEM PERFIL[\'"]\)\) return 4;', 'if (name.includes(\'ÁUREA FINAL\') || name.includes(\'AUREA FINAL\')) return 4;\n  if (name.includes(\'FABIO FINAL\')) return 5;'),
    (r'Pipelines SDR encontrados:', 'Pipelines SDR (principal) encontrados:'),
    (r'// Log dos pipelines SDR encontrados', '// Log dos pipelines SDR encontrados\n  \n  // Log dos pipelines CLOSER encontrados\n  const closerPipelines = pipelines.filter(p => p.isIndividualCloser);\n  if (closerPipelines.length > 0) {\n    console.log(\'📋 Pipelines CLOSER encontrados:\');\n    closerPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));\n  }'),
]

# Aplicar substituições mais simples primeiro
content = content.replace('isIndividualSDR: boolean', 'isIndividualCloser: boolean')
content = content.replace('// true se é funil individual "NOME - SDR"', '// true se é funil individual "CLOSER - NOME"')
content = content.replace('const isIndividualSDR = nameLower.includes(\'- sdr\') || nameLower.includes(\'-sdr\'); // "NOME - SDR"', 
                          'const isIndividualCloser = nameLower.includes(\'closer -\') || nameLower.includes(\'closer-\'); // "CLOSER - NOME"')
content = content.replace('isSDR: isMainSDR || isIndividualSDR,', 'isSDR: isMainSDR, // Apenas o funil principal SDR')
content = content.replace('isIndividualSDR', 'isIndividualCloser')
content = content.replace('isIndividualSDRPipeline', 'isIndividualCloserPipeline')
content = content.replace('"NOME - SDR"', '"CLOSER - NOME"')
content = content.replace('João - SDR', 'CLOSER - João')

# Remover verificação isSDR desnecessária
content = re.sub(r'  if \(!pipeline\.isSDR\) \{\s+return pipeline\.name;\s+\}', '', content)

# Atualizar getSDRNameFromPipelineId
content = content.replace('  // Se for o funil "SDR" principal (nome é exatamente "SDR")\n  if (pipeline.name.toLowerCase().trim() === \'sdr\') {\n    return \'SDR Geral\';\n  }\n\n  // Extrai o nome do SDR removendo "- SDR" ou "-SDR"\n  const name = pipeline.name\n    .replace(/\\s*-\\s*SDR\\s*/i, \'\')\n    .trim();\n  \n  return name || pipeline.name;', 
                        '  // Se for o funil "SDR" principal\n  if (pipeline.isMainSDR) {\n    return \'SDR Geral\';\n  }\n\n  // Se for um funil individual de CLOSER, extrai o nome\n  if (pipeline.isIndividualCloser) {\n    // Extrai o nome do CLOSER removendo "CLOSER -" ou "CLOSER-"\n    const name = pipeline.name\n      .replace(/\\s*CLOSER\\s*-\\s*/i, \'\')\n      .trim();\n    \n    return name || pipeline.name;\n  }\n\n  return pipeline.name;')

# Atualizar getStagePriority
content = content.replace(' * TEM PERFIL = 1 (maior prioridade)\n * PERFIL MENOR = 2\n * INCONCLUSIVO = 3\n * SEM PERFIL = 4 (menor prioridade)', 
                          ' * LEAD FORMULÁRIO = 1 (maior prioridade)\n * LEAD CHATBOX = 2\n * LEAD INSTAGRAM = 3\n * ÁUREA FINAL = 4\n * FABIO FINAL = 5 (menor prioridade)')
content = content.replace('  if (name.includes(\'TEM PERFIL\')) return 1;\n  if (name.includes(\'PERFIL MENOR\')) return 2;\n  if (name.includes(\'INCONCLUSIVO\')) return 3;\n  if (name.includes(\'SEM PERFIL\')) return 4;',
                          '  if (name.includes(\'LEAD FORMULÁRIO\') || name.includes(\'LEAD FORMULARIO\')) return 1;\n  if (name.includes(\'LEAD CHATBOX\')) return 2;\n  if (name.includes(\'LEAD INSTAGRAM\')) return 3;\n  if (name.includes(\'ÁUREA FINAL\') || name.includes(\'AUREA FINAL\')) return 4;\n  if (name.includes(\'FABIO FINAL\')) return 5;')

# Atualizar logs
content = content.replace('  // Log dos pipelines SDR encontrados\n  const sdrPipelines = pipelines.filter(p => p.isSDR);\n  if (sdrPipelines.length > 0) {\n    console.log(\'📋 Pipelines SDR encontrados:\');\n    sdrPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));\n  }',
                          '  // Log dos pipelines SDR encontrados\n  const sdrPipelines = pipelines.filter(p => p.isSDR);\n  if (sdrPipelines.length > 0) {\n    console.log(\'📋 Pipelines SDR (principal) encontrados:\');\n    sdrPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));\n  }\n  \n  // Log dos pipelines CLOSER encontrados\n  const closerPipelines = pipelines.filter(p => p.isIndividualCloser);\n  if (closerPipelines.length > 0) {\n    console.log(\'📋 Pipelines CLOSER encontrados:\');\n    closerPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));\n  }')

# Adicionar função listCloserPipelines
content = content.replace('export async function listSDRPipelines(): Promise<PipelineInfo[]> {\n  await loadPipedriveData();\n  \n  if (!pipelinesCache) return [];\n  \n  return Array.from(pipelinesCache.values()).filter(p => p.isSDR);\n}',
                          'export async function listSDRPipelines(): Promise<PipelineInfo[]> {\n  await loadPipedriveData();\n  \n  if (!pipelinesCache) return [];\n  \n  return Array.from(pipelinesCache.values()).filter(p => p.isSDR);\n}\n\n/**\n * Lista todos os pipelines CLOSER (individuais)\n */\nexport async function listCloserPipelines(): Promise<PipelineInfo[]> {\n  await loadPipedriveData();\n  \n  if (!pipelinesCache) return [];\n  \n  return Array.from(pipelinesCache.values()).filter(p => p.isIndividualCloser);\n}')

# Atualizar comentário
content = content.replace(' * Verifica se um pipeline é de SDR (nome contém "- SDR" ou é "SDR")', ' * Verifica se um pipeline é de SDR (funil principal)')

# Atualizar comentário getSDRNameFromPipelineId
content = content.replace(' * Extrai o nome do SDR do nome do pipeline\n * Ex: "João - SDR" → "João"', 
                          ' * Extrai o nome do CLOSER do nome do pipeline\n * Ex: "CLOSER - João" → "João"')

# Atualizar comentário isIndividualSDRPipeline
content = content.replace(' * Verifica se é um funil individual de SDR "NOME - SDR" (leads atendidos)', 
                          ' * Verifica se é um funil individual de CLOSER "CLOSER - NOME" (leads atendidos)')

# Atualizar comentário listSDRPipelines
content = content.replace(' * Lista todos os pipelines SDR', ' * Lista todos os pipelines SDR (principal)')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Arquivo atualizado com sucesso!')
