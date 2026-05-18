import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Download,
  Hand,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  RotateCw,
  Rocket,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

type Page = 'dashboard' | 'diagnostic' | 'trail' | 'courses' | 'lesson' | 'progress' | 'manager' | 'certificates' | 'profile' | 'settings' | 'help';

interface LessonModule {
  id: number;
  title: string;
  time: number;
  paragraphs: string[];
  highlights: string[];
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  level: string;
  modules: LessonModule[];
}

type ProgressState = Record<number, number[]>;
type AttemptsState = Record<string, number>;

interface DiagnosticAnswers {
  pain: string;
  time: string;
  area: string;
  format: string;
}

interface DashboardStats {
  overall: number;
  completedModules: number;
  totalMinutes: number;
  studyHours: number;
  activeCourses: number;
  completedCourses: number;
  developedCompetencies: number;
  estimatedHoursSaved: number;
}

const storageKeys = {
  progress: 'capacitagov-progress',
  attempts: 'capacitagov-attempts',
  theme: 'capacitagov-compact-mode',
  diagnostic: 'capacitagov-diagnostic',
};

const recommendedTrailLimit = 4;

const courses: Course[] = [
  {
    id: 1,
    title: 'Inovação no Setor Público',
    description: 'Aprenda princípios de inovação aplicados ao contexto governamental.',
    icon: Rocket,
    level: 'Básico',
    modules: [
      {
        id: 1,
        title: 'Conceitos Fundamentais',
        time: 15,
        paragraphs: [
          'Inovar no setor público é implementar ideias novas ou melhoradas que geram valor real para servidores, gestores e cidadãos.',
          'A inovação pode aparecer em tecnologia, processos, atendimento, gestão de pessoas e novas formas de colaboração.',
        ],
        highlights: ['Valor público antes de novidade', 'Experimentação com responsabilidade', 'Melhoria mensurável dos serviços'],
        question: 'Qual é a definição mais adequada de inovação pública?',
        options: ['Usar qualquer tecnologia nova', 'Implementar ideias que geram valor público real', 'Trocar todos os sistemas atuais', 'Copiar práticas privadas sem adaptação'],
        correct: 1,
        explanation: 'Inovação pública precisa gerar valor e impacto. Tecnologia pode ajudar, mas não é o objetivo por si só.',
      },
      {
        id: 2,
        title: 'Barreiras à Inovação',
        time: 12,
        paragraphs: [
          'As maiores barreiras costumam ser culturais e institucionais: medo de errar, excesso de burocracia e pouca integração entre equipes.',
          'Superar essas barreiras exige patrocínio, comunicação clara, pequenos testes e aprendizado contínuo.',
        ],
        highlights: ['Resistência à mudança', 'Processos pouco flexíveis', 'Baixa segurança para testar'],
        question: 'Qual barreira costuma travar a inovação com mais frequência?',
        options: ['Cultura burocrática e resistência à mudança', 'Falta total de computadores', 'Excesso de cidadãos interessados', 'Cursos muito curtos'],
        correct: 0,
        explanation: 'Recursos importam, mas cultura e resistência à mudança costumam bloquear até soluções simples.',
      },
      {
        id: 3,
        title: 'Medindo Impacto',
        time: 18,
        paragraphs: [
          'Uma boa iniciativa precisa mostrar resultados por meio de indicadores de eficiência, qualidade e satisfação do usuário.',
          'Medir impacto ajuda a decidir se a solução deve ser ampliada, ajustada ou encerrada.',
        ],
        highlights: ['Tempo economizado', 'Satisfação do usuário', 'Redução de custo ou retrabalho'],
        question: 'Como medir o impacto de uma inovação?',
        options: ['Apenas por opinião informal', 'Não é possível medir inovação', 'Com métricas de eficiência, qualidade e impacto', 'Somente pela quantidade de reuniões'],
        correct: 2,
        explanation: 'Indicadores objetivos e feedback dos usuários dão base para avaliar o impacto real.',
      },
    ],
  },
  {
    id: 2,
    title: 'Design Thinking',
    description: 'Use empatia, definição de problemas e prototipação para resolver desafios complexos.',
    icon: Lightbulb,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Empatia com o Usuário',
        time: 14,
        paragraphs: [
          'Design Thinking começa pela compreensão profunda das pessoas afetadas por um serviço ou problema.',
          'Entrevistas, observação e análise de jornada ajudam a revelar necessidades que não aparecem em relatórios frios.',
        ],
        highlights: ['Ouvir usuários reais', 'Observar rotinas', 'Mapear dores e expectativas'],
        question: 'Qual é o ponto de partida do Design Thinking?',
        options: ['Comprar uma ferramenta', 'Empatia com as pessoas usuárias', 'Escrever uma norma extensa', 'Definir a solução antes do problema'],
        correct: 1,
        explanation: 'A etapa de empatia reduz achismos e coloca o usuário no centro da solução.',
      },
      {
        id: 2,
        title: 'Ideação e Priorização',
        time: 16,
        paragraphs: [
          'Depois de entender o problema, a equipe gera alternativas e prioriza ideias viáveis, desejáveis e capazes de gerar impacto.',
          'A diversidade de perfis melhora a qualidade das ideias e reduz pontos cegos.',
        ],
        highlights: ['Divergir antes de convergir', 'Priorizar impacto e viabilidade', 'Combinar ideias complementares'],
        question: 'O que deve orientar a priorização das ideias?',
        options: ['A ideia da pessoa mais antiga', 'Impacto, viabilidade e valor para o usuário', 'A opção mais cara', 'A primeira ideia citada'],
        correct: 1,
        explanation: 'Boas ideias precisam ser úteis para o usuário e possíveis de implementar no contexto real.',
      },
      {
        id: 3,
        title: 'Prototipação',
        time: 13,
        paragraphs: [
          'Protótipos são versões simples da solução usadas para aprender rápido antes de investir pesado.',
          'Eles podem ser fluxos desenhados, telas clicáveis, scripts de atendimento ou simulações de processo.',
        ],
        highlights: ['Testar cedo', 'Aprender com baixo custo', 'Ajustar antes de escalar'],
        question: 'Por que criar protótipos?',
        options: ['Para aprender rápido com baixo custo', 'Para substituir a implementação final', 'Para evitar conversar com usuários', 'Para encerrar o projeto'],
        correct: 0,
        explanation: 'Protótipos antecipam aprendizados e reduzem risco antes da implementação completa.',
      },
    ],
  },
  {
    id: 3,
    title: 'Agilidade no Governo',
    description: 'Implemente práticas ágeis para melhorar entregas e colaboração entre equipes.',
    icon: Zap,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Princípios Ágeis',
        time: 12,
        paragraphs: [
          'Agilidade é uma forma de trabalhar com ciclos curtos, transparência e adaptação contínua.',
          'No governo, ela ajuda equipes a entregar valor em etapas sem perder governança.',
        ],
        highlights: ['Ciclos curtos', 'Feedback constante', 'Transparência do trabalho'],
        question: 'O que caracteriza uma abordagem ágil?',
        options: ['Planejamento imutável por anos', 'Ciclos curtos com feedback contínuo', 'Mais documentos e menos entrega', 'Trabalho sem prioridades'],
        correct: 1,
        explanation: 'Agilidade combina planejamento suficiente com aprendizado e adaptação ao longo do caminho.',
      },
      {
        id: 2,
        title: 'Kanban para Serviços',
        time: 15,
        paragraphs: [
          'Kanban torna o fluxo de trabalho visível e ajuda a controlar gargalos.',
          'Quadros com etapas claras permitem acompanhar demandas, responsáveis e prazos de forma simples.',
        ],
        highlights: ['Visualizar o fluxo', 'Limitar trabalho em andamento', 'Melhorar continuamente'],
        question: 'Qual benefício direto do Kanban?',
        options: ['Esconder gargalos', 'Visualizar o fluxo de trabalho', 'Eliminar qualquer reunião', 'Garantir orçamento infinito'],
        correct: 1,
        explanation: 'Ao visualizar o fluxo, a equipe identifica gargalos e melhora a gestão das demandas.',
      },
      {
        id: 3,
        title: 'Retrospectivas',
        time: 10,
        paragraphs: [
          'Retrospectivas são encontros para analisar o que funcionou, o que atrapalhou e quais melhorias serão testadas.',
          'Elas devem terminar com ações pequenas, responsáveis definidos e acompanhamento.',
        ],
        highlights: ['Aprendizado em equipe', 'Ações concretas', 'Melhoria contínua'],
        question: 'Qual é o objetivo de uma retrospectiva?',
        options: ['Culpar pessoas', 'Aprender e definir melhorias práticas', 'Cancelar entregas', 'Substituir todos os indicadores'],
        correct: 1,
        explanation: 'A retrospectiva foca aprendizado coletivo e melhorias reais no processo de trabalho.',
      },
    ],
  },
  {
    id: 4,
    title: 'Transformação Digital',
    description: 'Modernize processos administrativos com serviços digitais centrados no cidadão.',
    icon: RotateCw,
    level: 'Avançado',
    modules: [
      {
        id: 1,
        title: 'Serviços Digitais',
        time: 18,
        paragraphs: [
          'Transformação digital não é digitalizar burocracia ruim. É redesenhar serviços para serem simples, acessíveis e integrados.',
          'A jornada do cidadão deve orientar prioridades e eliminar etapas desnecessárias.',
        ],
        highlights: ['Simplicidade', 'Acessibilidade', 'Integração entre órgãos'],
        question: 'O que uma transformação digital efetiva deve fazer?',
        options: ['Apenas trocar papel por PDF', 'Redesenhar serviços com foco no cidadão', 'Criar mais senhas', 'Aumentar etapas presenciais'],
        correct: 1,
        explanation: 'Digitalizar sem simplificar mantém o problema. O foco deve ser a experiência e o valor do serviço.',
      },
      {
        id: 2,
        title: 'Dados para Decisão',
        time: 16,
        paragraphs: [
          'Dados ajudam a priorizar melhorias, monitorar serviços e identificar desigualdades no acesso.',
          'Qualidade, segurança e governança são essenciais para que os dados sejam confiáveis.',
        ],
        highlights: ['Indicadores confiáveis', 'Governança de dados', 'Privacidade e segurança'],
        question: 'Por que dados são importantes na transformação digital?',
        options: ['Para decidir por evidências', 'Para substituir todos os servidores', 'Para evitar transparência', 'Para complicar relatórios'],
        correct: 0,
        explanation: 'Dados bem governados apoiam decisões melhores e permitem acompanhar resultados.',
      },
      {
        id: 3,
        title: 'Adoção e Sustentação',
        time: 14,
        paragraphs: [
          'Uma solução digital só gera valor quando as pessoas conseguem adotá-la no dia a dia.',
          'Treinamento, suporte, comunicação e monitoramento sustentam a mudança depois do lançamento.',
        ],
        highlights: ['Capacitação', 'Suporte contínuo', 'Monitoramento pós-lançamento'],
        question: 'O que sustenta uma solução digital depois do lançamento?',
        options: ['Abandonar o acompanhamento', 'Treinamento, suporte e monitoramento', 'Remover canais de ajuda', 'Não ouvir usuários'],
        correct: 1,
        explanation: 'Adoção depende de suporte contínuo e ajustes baseados no uso real.',
      },
    ],
  },
  {
    id: 5,
    title: 'Atendimento ao Cidadão',
    description: 'Aprimore escuta, linguagem simples e resolução de demandas em serviços públicos.',
    icon: Users,
    level: 'Básico',
    modules: [
      {
        id: 1,
        title: 'Escuta Ativa no Serviço Público',
        time: 12,
        paragraphs: [
          'Atendimento humanizado começa por reconhecer a situação da pessoa usuária e compreender sua necessidade real antes de encaminhar a demanda.',
          'Perguntas abertas, confirmação do entendimento e comunicação respeitosa reduzem retrabalho e aumentam confiança no serviço.',
        ],
        highlights: ['Escuta sem julgamento', 'Confirmação da demanda', 'Encaminhamento responsável'],
        question: 'Qual prática fortalece a escuta ativa no atendimento?',
        options: ['Interromper para acelerar a fila', 'Confirmar o entendimento antes de orientar', 'Responder com termos técnicos', 'Encaminhar sem registrar contexto'],
        correct: 1,
        explanation: 'Confirmar o entendimento evita encaminhamentos errados e demonstra respeito pela necessidade apresentada.',
      },
      {
        id: 2,
        title: 'Linguagem Simples',
        time: 14,
        paragraphs: [
          'Linguagem simples torna informações públicas mais claras, diretas e acessíveis para diferentes perfis de cidadãos.',
          'Textos, formulários e respostas devem priorizar termos conhecidos, ordem lógica e instruções objetivas.',
        ],
        highlights: ['Clareza nas orientações', 'Menos juridiquês', 'Acesso inclusivo'],
        question: 'O que caracteriza uma comunicação em linguagem simples?',
        options: ['Frases longas e formais', 'Uso de siglas sem explicação', 'Orientações claras e diretas', 'Cópia integral de normas'],
        correct: 2,
        explanation: 'Linguagem simples mantém rigor, mas apresenta a informação de forma compreensível e acionável.',
      },
      {
        id: 3,
        title: 'Gestão de Demandas',
        time: 15,
        paragraphs: [
          'Demandas bem registradas permitem acompanhar prazos, identificar recorrências e melhorar a qualidade do serviço.',
          'Classificação, priorização e retorno ao cidadão ajudam a equipe a atuar com transparência.',
        ],
        highlights: ['Registro padronizado', 'Priorização transparente', 'Retorno ao cidadão'],
        question: 'Por que classificar demandas de atendimento?',
        options: ['Para esconder atrasos', 'Para organizar prioridades e recorrências', 'Para impedir novos pedidos', 'Para substituir a escuta'],
        correct: 1,
        explanation: 'Classificar demandas ajuda a enxergar padrões, priorizar corretamente e planejar melhorias.',
      },
    ],
  },
  {
    id: 6,
    title: 'Gestão de Projetos Públicos',
    description: 'Planeje entregas, riscos, partes interessadas e resultados em iniciativas governamentais.',
    icon: BookMarked,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Objetivos e Escopo',
        time: 16,
        paragraphs: [
          'Projetos públicos precisam declarar problema, público beneficiado, entregas e critérios de sucesso desde o início.',
          'Um escopo bem definido reduz dispersão e facilita pactos com gestores, equipes técnicas e usuários do serviço.',
        ],
        highlights: ['Problema claro', 'Entregas pactuadas', 'Critérios de sucesso'],
        question: 'O que ajuda a manter um projeto público bem direcionado?',
        options: ['Escopo indefinido', 'Objetivos e entregas claros', 'Mudanças sem registro', 'Ausência de indicadores'],
        correct: 1,
        explanation: 'Objetivos e entregas claros ajudam a alinhar expectativas e acompanhar avanço real.',
      },
      {
        id: 2,
        title: 'Riscos e Governança',
        time: 18,
        paragraphs: [
          'Riscos devem ser identificados cedo, avaliados por impacto e probabilidade, e acompanhados durante a execução.',
          'Governança define papéis, decisões, canais de prestação de contas e momentos de revisão.',
        ],
        highlights: ['Mapa de riscos', 'Papéis definidos', 'Ritos de decisão'],
        question: 'Como tratar riscos em projetos públicos?',
        options: ['Ignorar até acontecerem', 'Registrar, avaliar e acompanhar respostas', 'Transferir todos para a equipe técnica', 'Evitar qualquer decisão'],
        correct: 1,
        explanation: 'Riscos acompanhados com método reduzem surpresas e melhoram a tomada de decisão.',
      },
      {
        id: 3,
        title: 'Monitoramento de Resultados',
        time: 17,
        paragraphs: [
          'Monitorar resultados permite comparar entregas previstas, entregas realizadas e benefícios alcançados.',
          'Indicadores simples e revisões periódicas ajudam a corrigir rota antes que o projeto perca valor.',
        ],
        highlights: ['Indicadores de entrega', 'Benefícios esperados', 'Revisão de rota'],
        question: 'Qual é a função do monitoramento em projetos?',
        options: ['Apenas gerar relatórios longos', 'Acompanhar resultados e apoiar ajustes', 'Encerrar a participação da equipe', 'Eliminar toda mudança'],
        correct: 1,
        explanation: 'Monitoramento mostra se o projeto está produzindo valor e onde precisa de ajuste.',
      },
    ],
  },
  {
    id: 7,
    title: 'Dados e Indicadores para Políticas Públicas',
    description: 'Use evidências, painéis e indicadores para priorizar ações e acompanhar resultados.',
    icon: BarChart3,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Indicadores Úteis',
        time: 15,
        paragraphs: [
          'Indicadores úteis conectam uma pergunta de gestão a uma medida que pode orientar decisão.',
          'Eles precisam ter fonte conhecida, periodicidade definida e interpretação simples para a equipe.',
        ],
        highlights: ['Pergunta de gestão', 'Fonte confiável', 'Periodicidade definida'],
        question: 'O que torna um indicador útil para gestão pública?',
        options: ['Ser difícil de explicar', 'Responder a uma pergunta de decisão', 'Não ter fonte definida', 'Mudar todo dia sem critério'],
        correct: 1,
        explanation: 'Um bom indicador ajuda a decidir e precisa ser compreendido por quem usa a informação.',
      },
      {
        id: 2,
        title: 'Painéis para Acompanhamento',
        time: 16,
        paragraphs: [
          'Painéis devem destacar poucos indicadores essenciais, com contexto suficiente para apoiar análise rápida.',
          'Cores, filtros e comparações precisam facilitar leitura sem esconder limitações dos dados.',
        ],
        highlights: ['Poucos sinais vitais', 'Contexto para leitura', 'Comparações consistentes'],
        question: 'Qual cuidado melhora um painel de indicadores?',
        options: ['Exibir todos os dados possíveis', 'Selecionar indicadores essenciais e comparáveis', 'Remover contexto', 'Usar cores sem significado'],
        correct: 1,
        explanation: 'Painéis efetivos priorizam clareza e foco nos indicadores que orientam ação.',
      },
      {
        id: 3,
        title: 'Decisão Baseada em Evidências',
        time: 17,
        paragraphs: [
          'Evidências combinam dados administrativos, escuta dos usuários, avaliações e conhecimento das equipes.',
          'Decisões melhores surgem quando dados são usados para aprender, não apenas para justificar escolhas já feitas.',
        ],
        highlights: ['Dados administrativos', 'Avaliação de resultados', 'Aprendizado institucional'],
        question: 'Como evidências devem apoiar decisões?',
        options: ['Confirmando qualquer opinião', 'Combinando dados e análise do contexto', 'Substituindo diálogo com usuários', 'Eliminando revisão'],
        correct: 1,
        explanation: 'Evidências ganham força quando são interpretadas junto com contexto e finalidade pública.',
      },
    ],
  },
  {
    id: 8,
    title: 'Ética, LGPD e Segurança da Informação',
    description: 'Proteja dados pessoais, reduza riscos e fortaleça a confiança nos serviços públicos digitais.',
    icon: Check,
    level: 'Avançado',
    modules: [
      {
        id: 1,
        title: 'Proteção de Dados Pessoais',
        time: 18,
        paragraphs: [
          'Dados pessoais devem ser tratados com finalidade clara, base adequada e acesso limitado ao necessário.',
          'Boas práticas de privacidade reduzem exposição indevida e fortalecem a confiança da população.',
        ],
        highlights: ['Finalidade definida', 'Acesso necessário', 'Transparência no tratamento'],
        question: 'Qual princípio orienta o uso responsável de dados pessoais?',
        options: ['Coletar tudo por precaução', 'Usar apenas o necessário para finalidade clara', 'Compartilhar sem controle', 'Guardar sem prazo'],
        correct: 1,
        explanation: 'Minimizar dados e declarar finalidade são práticas centrais para proteção de dados.',
      },
      {
        id: 2,
        title: 'Segurança no Dia a Dia',
        time: 14,
        paragraphs: [
          'Segurança da informação depende de hábitos cotidianos: senhas fortes, atenção a links, atualização de sistemas e cuidado com compartilhamentos.',
          'Pequenas falhas operacionais podem comprometer serviços inteiros quando não há orientação e controle.',
        ],
        highlights: ['Senhas fortes', 'Cuidado com links', 'Compartilhamento responsável'],
        question: 'Qual atitude reduz risco de segurança da informação?',
        options: ['Reutilizar senhas simples', 'Conferir links e canais antes de informar dados', 'Enviar planilhas sensíveis sem controle', 'Ignorar atualizações'],
        correct: 1,
        explanation: 'Verificar canais e links reduz exposição a golpes e vazamentos.',
      },
      {
        id: 3,
        title: 'Ética no Uso de Tecnologia',
        time: 16,
        paragraphs: [
          'Tecnologias públicas precisam ser avaliadas quanto a transparência, inclusão, vieses e impactos sobre direitos.',
          'A decisão ética considera eficiência, mas também riscos, explicabilidade e possibilidade de contestação pelo cidadão.',
        ],
        highlights: ['Transparência', 'Inclusão digital', 'Responsabilidade pública'],
        question: 'O que uma análise ética de tecnologia deve considerar?',
        options: ['Apenas velocidade', 'Impactos, transparência e direitos', 'Somente custo de licença', 'Preferência pessoal da equipe'],
        correct: 1,
        explanation: 'Uso ético de tecnologia exige olhar para efeitos sobre pessoas, direitos e confiança pública.',
      },
    ],
  },
  {
    id: 9,
    title: 'Comunicação Pública e Facilitação',
    description: 'Conduza reuniões, oficinas e comunicações internas com foco, clareza e participação.',
    icon: Hand,
    level: 'Básico',
    modules: [
      {
        id: 1,
        title: 'Reuniões Produtivas',
        time: 11,
        paragraphs: [
          'Reuniões produtivas têm objetivo claro, pauta enxuta, papéis definidos e encaminhamentos registrados.',
          'Quando a equipe sabe o que será decidido, a reunião deixa de ser apenas informe e passa a gerar avanço.',
        ],
        highlights: ['Objetivo claro', 'Pauta enxuta', 'Encaminhamentos registrados'],
        question: 'O que aumenta a efetividade de uma reunião?',
        options: ['Pauta indefinida', 'Objetivo e encaminhamentos claros', 'Convocar todos sempre', 'Evitar decisões'],
        correct: 1,
        explanation: 'Objetivo e encaminhamentos claros tornam a reunião útil e rastreável.',
      },
      {
        id: 2,
        title: 'Facilitação de Oficinas',
        time: 15,
        paragraphs: [
          'Facilitar oficinas é criar condições para que pessoas contribuam, organizem ideias e cheguem a decisões práticas.',
          'Dinâmicas simples, tempo bem distribuído e sínteses visuais ajudam a transformar debate em ação.',
        ],
        highlights: ['Participação equilibrada', 'Síntese visual', 'Decisão prática'],
        question: 'Qual é o papel da facilitação em uma oficina?',
        options: ['Impor a opinião do facilitador', 'Organizar participação e apoiar decisões', 'Evitar divergências', 'Substituir o planejamento'],
        correct: 1,
        explanation: 'Facilitação ajuda o grupo a pensar melhor junto e sair com próximos passos claros.',
      },
      {
        id: 3,
        title: 'Comunicação Interna',
        time: 12,
        paragraphs: [
          'Comunicação interna eficiente reduz ruídos, alinha prioridades e dá visibilidade às decisões que afetam o trabalho.',
          'Canais, frequência e responsáveis precisam ser combinados para evitar excesso de mensagens e perda de informação.',
        ],
        highlights: ['Canais definidos', 'Mensagens objetivas', 'Ritmo combinado'],
        question: 'O que reduz ruído na comunicação interna?',
        options: ['Mensagens duplicadas em todos os canais', 'Canais e responsáveis definidos', 'Decisões sem registro', 'Informações sempre urgentes'],
        correct: 1,
        explanation: 'Combinar canais e responsáveis torna a comunicação mais previsível e menos dispersa.',
      },
    ],
  },
];

const demoProgress: ProgressState = {
  1: [1, 2, 3],
  2: [1, 2],
  3: [1],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
};

const defaultDiagnostic: DiagnosticAnswers = {
  pain: 'Tenho pouco tempo e preciso de aulas objetivas.',
  time: '2 horas por semana',
  area: 'Modernização administrativa',
  format: 'Conteúdo curto com prática guiada',
};

const courseCompetencies: Record<number, string[]> = {
  1: ['Inovação pública', 'Mensuração de impacto', 'Melhoria de serviços'],
  2: ['Empatia com usuários', 'Prototipação', 'Priorização de soluções'],
  3: ['Gestão visual', 'Trabalho em ciclos curtos', 'Melhoria contínua'],
  4: ['Serviços digitais', 'Governança de dados', 'Adoção de tecnologia'],
  5: ['Atendimento humanizado', 'Linguagem simples', 'Gestão de demandas'],
  6: ['Gestão de projetos', 'Governança', 'Monitoramento de resultados'],
  7: ['Indicadores públicos', 'Análise de dados', 'Decisão por evidências'],
  8: ['Proteção de dados', 'Segurança da informação', 'Ética digital'],
  9: ['Comunicação pública', 'Facilitação', 'Reuniões produtivas'],
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readProgressStorage() {
  const savedProgress = readStorage<ProgressState>(storageKeys.progress, demoProgress);
  const completedCount = Object.values(savedProgress).reduce((total, modules) => total + modules.length, 0);
  return completedCount > 0 ? savedProgress : demoProgress;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreCourseRecommendation(courseId: number, diagnostic: DiagnosticAnswers) {
  const scoreGroups = [
    diagnostic.area.includes('Digital') ? [4, 8, 7, 3, 1] : [],
    diagnostic.area.includes('Atendimento') ? [5, 9, 2, 1, 7] : [],
    diagnostic.area.includes('Dados') ? [7, 4, 6, 8, 1] : [],
    diagnostic.area.includes('Projetos') ? [6, 3, 1, 7, 9] : [],
    diagnostic.area.includes('Modernização') ? [1, 3, 6, 4, 2] : [],
    diagnostic.pain.includes('pouco tempo') ? [9, 5, 3, 1, 8] : [],
    diagnostic.pain.includes('teóricos') ? [2, 6, 9, 5, 3] : [],
    diagnostic.pain.includes('ferramentas digitais') ? [4, 8, 7, 1, 3] : [],
    diagnostic.pain.includes('dados') ? [7, 6, 4, 8, 1] : [],
    diagnostic.pain.includes('atendimento') ? [5, 9, 2, 1, 6] : [],
    diagnostic.time.includes('1 hora') ? [9, 5, 3, 1, 8] : [],
    diagnostic.time.includes('4 horas') ? [6, 4, 7, 8, 2] : [],
    diagnostic.format.includes('certificação') ? [6, 4, 8, 7, 1] : [],
    diagnostic.format.includes('consulta rápida') ? [9, 7, 8, 5, 3] : [],
    diagnostic.format.includes('prática guiada') ? [2, 3, 5, 6, 1] : [],
  ];

  return scoreGroups.reduce((total, group) => {
    const index = group.indexOf(courseId);
    return index >= 0 ? total + group.length - index : total;
  }, 0);
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(courses[0].id);
  const [currentModule, setCurrentModule] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [compactMode, setCompactMode] = useState(() => readStorage<boolean>(storageKeys.theme, false));
  const [progress, setProgress] = useState<ProgressState>(() => readProgressStorage());
  const [attempts, setAttempts] = useState<AttemptsState>(() => readStorage<AttemptsState>(storageKeys.attempts, {}));
  const [diagnostic, setDiagnostic] = useState<DiagnosticAnswers>(() => readStorage<DiagnosticAnswers>(storageKeys.diagnostic, defaultDiagnostic));

  useEffect(() => {
    window.localStorage.setItem(storageKeys.progress, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.attempts, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.theme, JSON.stringify(compactMode));
  }, [compactMode]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.diagnostic, JSON.stringify(diagnostic));
  }, [diagnostic]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const currentLesson = selectedCourse.modules[currentModule] ?? selectedCourse.modules[0];
  const completedModules = progress[selectedCourse.id] ?? [];
  const currentAttemptKey = `${selectedCourse.id}-${currentLesson.id}`;

  const courseProgress = (course: Course) => {
    const completed = progress[course.id]?.length ?? 0;
    return clampPercent((completed / course.modules.length) * 100);
  };

  const stats = useMemo(() => {
    const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
    const completedCount = courses.reduce((total, course) => total + (progress[course.id]?.length ?? 0), 0);
    const totalMinutes = courses.reduce(
      (total, course) =>
        total + course.modules.filter((module) => progress[course.id]?.includes(module.id)).reduce((sum, module) => sum + module.time, 0),
      0,
    );
    const completedCourses = courses.filter((course) => courseProgress(course) === 100).length;
    const developedCompetencies = new Set(
      courses.flatMap((course) => (progress[course.id]?.length ? courseCompetencies[course.id] ?? [] : [])),
    ).size;

    return {
      overall: clampPercent((completedCount / totalModules) * 100),
      completedModules: completedCount,
      totalMinutes,
      studyHours: Math.max(1, Math.ceil(totalMinutes / 60)),
      activeCourses: courses.filter((course) => courseProgress(course) > 0 && courseProgress(course) < 100).length,
      completedCourses,
      developedCompetencies,
      estimatedHoursSaved: completedCount * 2 + completedCourses * 6,
    };
  }, [progress]);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setShowProfileMenu(false);
  };

  const startCourse = (courseId: number) => {
    const course = courses.find((item) => item.id === courseId) ?? courses[0];
    const completed = progress[course.id] ?? [];
    const nextIndex = Math.min(completed.length, course.modules.length - 1);
    setSelectedCourseId(course.id);
    setCurrentModule(nextIndex);
    setSelectedAnswer(null);
    setAnswered(false);
    navigate('lesson');
  };

  const resetQuizState = (moduleIndex: number) => {
    setCurrentModule(moduleIndex);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    setAttempts((current) => ({
      ...current,
      [currentAttemptKey]: (current[currentAttemptKey] ?? 0) + 1,
    }));

    if (selectedAnswer === currentLesson.correct) {
      setProgress((current) => {
        const completed = new Set(current[selectedCourse.id] ?? []);
        completed.add(currentLesson.id);
        return { ...current, [selectedCourse.id]: Array.from(completed).sort((a, b) => a - b) };
      });
    }
  };

  const retryQuestion = () => {
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const nextModule = () => {
    if (currentModule < selectedCourse.modules.length - 1) {
      resetQuizState(currentModule + 1);
      return;
    }

    setShowCompletion(true);
  };

  const resetProgress = () => {
    setProgress(demoProgress);
    setAttempts({});
    setDiagnostic(defaultDiagnostic);
    setSelectedCourseId(courses[0].id);
    resetQuizState(0);
    navigate('dashboard');
  };

  const downloadCertificate = (course: Course) => {
    const issueDate = new Date().toLocaleDateString('pt-BR');
    const competencies = courseCompetencies[course.id] ?? [];
    const certificate = [
      'CERTIFICADO CAPACITAGOV',
      '',
      'Certificamos que Ricardo Oliveira concluiu o curso:',
      course.title,
      '',
      `Carga horária: ${course.modules.reduce((sum, module) => sum + module.time, 0)} minutos`,
      `Nível: ${course.level}`,
      '',
      'Competências desenvolvidas:',
      ...competencies.map((competency) => `- ${competency}`),
      '',
      `Data de emissão: ${issueDate}`,
      `Código: CAP-${course.id}-100-${Date.now().toString().slice(-6)}`,
    ].join('\n');

    const blob = new Blob([certificate], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${course.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diagnostic', label: 'Diagnóstico', icon: Check },
    { id: 'trail', label: 'Minhas Trilhas', icon: Rocket },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'progress', label: 'Progresso', icon: BarChart3 },
    { id: 'certificates', label: 'Certificados', icon: Award },
  ];

  const completedCourseList = courses.filter((course) => courseProgress(course) === 100);
  const recommendedCourses = [...courses].sort((a, b) => {
    const scoreDifference = scoreCourseRecommendation(b.id, diagnostic) - scoreCourseRecommendation(a.id, diagnostic);
    return scoreDifference || a.id - b.id;
  });
  const scoredRecommendedCourses = recommendedCourses
    .filter((course) => scoreCourseRecommendation(course.id, diagnostic) > 0)
    .slice(0, recommendedTrailLimit);
  const recommendedTrailCourses = scoredRecommendedCourses.length > 0
    ? scoredRecommendedCourses
    : recommendedCourses.slice(0, recommendedTrailLimit);
  const continueCourses = courses.filter((course) => {
    const progress = courseProgress(course);
    return progress > 0 && progress < 100;
  }).slice(0, 4);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white via-[#f0f5ff] to-[#e8f0ff] flex flex-col ${compactMode ? 'text-sm' : ''}`}>
      <header className="bg-white border-b border-[#e8f0ff] shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button type="button" onClick={() => navigate('dashboard')} className="text-2xl font-bold bg-gradient-to-r from-[#1351b4] to-[#0d3d7f] bg-clip-text text-transparent">
              InnovaGov
            </button>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setShowProfileMenu((open) => !open)} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1351b4] to-[#0d3d7f] rounded-full flex items-center justify-center text-white font-bold">RO</div>
              <span className="text-gray-700 font-medium hidden sm:block">Ricardo Oliveira</span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-[#e8f0ff] overflow-hidden z-50">
                <button type="button" onClick={() => navigate('profile')} className="w-full text-left px-4 py-3 hover:bg-[#f0f5ff] flex items-center gap-2 text-gray-700 transition-colors">
                  <User size={18} /> Meu Perfil
                </button>
                <button type="button" onClick={() => navigate('settings')} className="w-full text-left px-4 py-3 hover:bg-[#f0f5ff] flex items-center gap-2 text-gray-700 transition-colors">
                  <Settings size={18} /> Configurações
                </button>
                <button type="button" onClick={resetProgress} className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors">
                  <LogOut size={18} /> Restaurar demonstração
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white text-gray-900 border-r border-[#e8f0ff] shadow-lg transition-all duration-300 overflow-hidden fixed left-0 top-20 h-[calc(100vh-80px)] overflow-y-auto z-30`}>
          <div className="p-6">
            <nav className="space-y-2 mb-12">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                      currentPage === item.id ? 'bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white shadow-lg' : 'text-gray-700 hover:bg-[#f0f5ff] hover:text-[#1351b4]'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="bg-gradient-to-br from-[#f0f5ff] to-[#e8f0ff] rounded-lg p-4 mb-8 border border-[#d6e5ff]">
              <p className="text-[#1351b4] text-xs font-semibold mb-3">SEU PROGRESSO</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">Geral</span>
                    <span className="font-bold text-[#1351b4]">{stats.overall}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1859c9] to-[#fbcc06]" style={{ width: `${stats.overall}%` }} />
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-center gap-2"><BookMarked size={16} /> {stats.completedCourses} certificados</p>
                  <p className="flex items-center gap-2"><Clock size={16} /> {stats.studyHours} horas</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#d6e5ff] pt-4">
              <button type="button" onClick={() => navigate('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f0f5ff] transition-all">
                <Settings size={18} />
                <span>Configurações</span>
              </button>
              <button type="button" onClick={() => navigate('help')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f0f5ff] transition-all">
                <HelpCircle size={18} />
                <span>Ajuda</span>
              </button>
            </div>
          </div>
        </aside>

        <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
          {currentPage === 'dashboard' && (
            <div className="relative p-5">
              <div className="relative mb-12">
                <h2 className="text-5xl font-bold text-gray-900 mb-2 flex items-center gap-3">Bem-vindo de volta! <Hand className="text-[#1351b4]" size={40} /></h2>
                <p className="text-xl text-gray-600">Continue sua jornada de aprendizado e conhecimento.</p>
                <div className="absolute right-0 top-0 z-20 hidden xl:block">
                  <MascotTip title="Comece por aqui!" compact className="max-w-xs">
                    Eu te guio pelo diagnóstico e ajudo a recomendar as trilhas mais correspondentes com seu perfil.
                  </MascotTip>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Progresso Geral', value: `${stats.overall}%`, icon: BarChart3, color: 'from-[#1859c9] to-[#1351b4]' },
                  { label: 'Horas de Estudo', value: `${stats.studyHours}h`, icon: Clock, color: 'from-[#fbcc06] to-[#e6b800]' },
                  { label: 'Cursos Ativos', value: String(stats.activeCourses), icon: Users, color: 'from-[#1351b4] to-[#1145a0]' },
                  { label: 'Certificados', value: String(stats.completedCourses), icon: Award, color: 'from-[#fbcc06] to-[#e6b800]' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] hover:border-[#c4d9ff] hover:shadow-xl transition-all duration-300 p-6">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4 text-white`}>
                        <Icon size={24} />
                      </div>
                      <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <DashboardDiagnostic
                  onStart={() => navigate('diagnostic')}
                />

                <Card className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] hover:border-[#c4d9ff] hover:shadow-xl transition-all duration-300 p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1351b4] to-[#1145a0] rounded-lg flex items-center justify-center mb-4 text-white">
                    <BarChart3 size={24} />
                  </div>
                  <p className="text-sm font-semibold text-[#1351b4] mb-1">IMPACTO MENSURÁVEL</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Resultado rápido</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.estimatedHoursSaved}h</p>
                  <p className="text-sm text-gray-600 mt-2">{stats.completedModules} checkpoints concluídos</p>
                  <div className="hidden">
                    <ImpactRow label="Checkpoints concluídos" value={String(stats.completedModules)} />
                    <ImpactRow label="Competências desenvolvidas" value={String(stats.developedCompetencies)} />
                    <ImpactRow label="Horas economizadas estimadas" value={`${stats.estimatedHoursSaved}h`} />
                  </div>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] hover:border-[#c4d9ff] hover:shadow-xl transition-all duration-300 p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#fbcc06] to-[#e6b800] rounded-lg flex items-center justify-center mb-4 text-white">
                    <Rocket size={24} />
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Trilha Recomendada</p>
                  <p className="text-xl font-bold text-gray-900 line-clamp-1">{recommendedCourses[0].title}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#1351b4]">{courseProgress(recommendedCourses[0])}% concluído</span>
                    <Button type="button" onClick={() => navigate('trail')} variant="outline" className="px-3 py-2">
                      Ver trilhas
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="hidden">
                <Card className="lg:col-span-3 bg-white/75 border border-[#e8f0ff] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-[#1351b4] mb-1">TRILHA RECOMENDADA</p>
                      <h3 className="text-2xl font-bold text-gray-900">Modernização Administrativa para Ricardo</h3>
                      <p className="text-gray-600 mt-2">Baseada no diagnóstico: {diagnostic.pain}</p>
                    </div>
                    <Button type="button" onClick={() => navigate('trail')} variant="outline">Ver trilhas</Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {recommendedCourses.slice(0, 3).map((course, index) => (
                      <button key={course.id} type="button" onClick={() => startCourse(course.id)} className="rounded-lg border border-[#d6e5ff] bg-[#f8fbff] p-4 text-left hover:border-[#1351b4] transition-colors">
                        <p className="text-xs font-bold text-[#1351b4] mb-2">Etapa {index + 1}</p>
                        <p className="font-bold text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600 mt-2">{courseProgress(course)}% concluído</p>
                      </button>
                    ))}
                  </div>
                </Card>                
              </div>

              {continueCourses.length > 0 && (
                <CourseGrid title="Continue de Onde Parou" courses={continueCourses} progressFor={courseProgress} onStart={startCourse} />
              )}
            </div>
          )}

          {currentPage === 'courses' && (
            <div className="p-8">
              <CourseGrid title="Todos os Cursos" courses={courses} progressFor={courseProgress} onStart={startCourse} largeTitle />
            </div>
          )}

          {currentPage === 'diagnostic' && (
            <DiagnosticPage
              diagnostic={diagnostic}
              onChange={setDiagnostic}
              onFinish={() => navigate('trail')}
            />
          )}

          {currentPage === 'trail' && (
            <TrailPage
              diagnostic={diagnostic}
              courses={recommendedTrailCourses}
              progressFor={courseProgress}
              onStart={startCourse}
              onRetake={() => navigate('diagnostic')}
            />
          )}

          {currentPage === 'lesson' && (
            <div className="relative p-5">
              <button type="button" onClick={() => navigate('courses')} className="mb-4 text-[#1351b4] hover:text-[#0d3d7f] font-medium flex items-center gap-2 transition-colors">
                ← Voltar aos Cursos
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <Card className="relative overflow-visible bg-white/85 backdrop-blur-sm border border-[#e8f0ff] p-5 mb-5">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Módulo {currentModule + 1}: {currentLesson.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-[#d6e5ff]">
                      <span className="flex items-center gap-2"><Clock className="text-[#1351b4]" size={16} /> {currentLesson.time} minutos</span>
                      <span className="flex items-center gap-2"><BarChart3 className="text-[#fbcc06]" size={16} /> Nível: {selectedCourse.level}</span>
                      <span className="flex items-center gap-2"><Check className="text-green-600" size={16} /> Com checkpoint</span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-700 leading-relaxed">
                      {currentLesson.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      <div className="grid sm:grid-cols-3 gap-2 pt-1">
                        {currentLesson.highlights.map((highlight) => (
                          <div key={highlight} className="rounded-lg border border-[#d6e5ff] bg-[#f8fbff] px-3 py-2 text-sm font-medium text-[#0d3d7f]">
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative overflow-visible bg-gradient-to-br from-[#f0f5ff] to-[#fef7e0] border-2 border-[#d6e5ff] rounded-lg p-4 mt-4">
                      <h3 className="text-base font-bold text-[#051a3c] mb-3 flex items-center gap-2">
                        <Check size={20} className="text-green-600" /> Checkpoint de Conhecimento
                      </h3>
                      <p className="font-semibold text-gray-900 mb-3">{currentLesson.question}</p>

                      <div className="space-y-2 mb-4">
                        {currentLesson.options.map((option, idx) => {
                          const isSelected = selectedAnswer === idx;
                          const isCorrect = idx === currentLesson.correct;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => !answered && setSelectedAnswer(idx)}
                              className={`w-full px-3 py-2.5 text-left rounded-lg border-2 transition-all font-medium flex items-center gap-3 ${
                                isSelected
                                  ? answered
                                    ? isCorrect
                                      ? 'border-green-500 bg-green-50 text-green-900'
                                      : 'border-red-500 bg-red-50 text-red-900'
                                    : 'border-[#1351b4] bg-[#f0f5ff] text-[#051a3c]'
                                  : answered && isCorrect
                                    ? 'border-green-500 bg-green-50 text-green-900'
                                    : 'border-gray-300 bg-white text-gray-900 hover:border-[#1859c9] hover:bg-[#f0f5ff]'
                              }`}
                              disabled={answered}
                            >
                              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? answered
                                    ? isCorrect
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-red-500 bg-red-500'
                                    : 'border-[#1351b4] bg-[#1351b4]'
                                  : answered && isCorrect
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-400'
                              }`}>
                                {(isSelected || (answered && isCorrect)) && <Check size={16} className="text-white" />}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div className={`p-3 rounded-lg mb-4 flex gap-3 text-sm ${
                          selectedAnswer === currentLesson.correct ? 'bg-green-100 border border-green-300 text-green-900' : 'bg-red-100 border border-red-300 text-red-900'
                        }`}>
                          <div className="flex-shrink-0 mt-1">{selectedAnswer === currentLesson.correct ? <Check size={20} /> : <X size={20} />}</div>
                          <div>
                            <p className="font-semibold mb-1">{selectedAnswer === currentLesson.correct ? 'Correto!' : 'Ainda não. Tente novamente para liberar o próximo módulo.'}</p>
                            <p>{currentLesson.explanation}</p>
                            <p className="text-xs mt-1">Tentativas neste checkpoint: {attempts[currentAttemptKey] ?? 0}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="button" onClick={() => navigate('courses')} variant="outline" className="flex-1">Cancelar</Button>
                        {!answered && (
                          <Button type="button" onClick={submitAnswer} disabled={selectedAnswer === null} className="flex-1 bg-gradient-to-r from-[#1351b4] to-[#1145a0] hover:from-[#1145a0] hover:to-[#0d3d7f] text-white">
                            Verificar Resposta
                          </Button>
                        )}
                        {answered && selectedAnswer !== currentLesson.correct && (
                          <Button type="button" onClick={retryQuestion} className="flex-1 bg-gradient-to-r from-[#1351b4] to-[#1145a0] hover:from-[#1145a0] hover:to-[#0d3d7f] text-white">
                            Tentar Novamente
                          </Button>
                        )}
                        {answered && selectedAnswer === currentLesson.correct && (
                          <Button type="button" onClick={nextModule} className="flex-1 bg-gradient-to-r from-[#1351b4] to-[#1145a0] hover:from-[#1145a0] hover:to-[#0d3d7f] text-white">
                            {currentModule < selectedCourse.modules.length - 1 ? 'Próximo Módulo →' : 'Concluir Curso'}
                          </Button>
                        )}
                      </div>
                    </div>

                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="bg-white/85 backdrop-blur-sm border border-[#e8f0ff] p-5 sticky top-24">
                    <MascotTip title="Antes do checkpoint" compact className="mb-4 max-w-none">
                      Leia os destaques e responda com calma. Se errar, eu mostro o caminho para tentar de novo.
                    </MascotTip>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><BookOpen size={22} className="text-[#1351b4]" /> Módulos</h4>
                    <div className="space-y-2">
                      {selectedCourse.modules.map((module, idx) => {
                        const isCompleted = completedModules.includes(module.id);
                        const isUnlocked = idx === 0 || completedModules.includes(selectedCourse.modules[idx - 1].id);
                        return (
                          <button
                            key={module.id}
                            type="button"
                            onClick={() => isUnlocked && resetQuizState(idx)}
                            className={`w-full text-left p-3 rounded-lg transition-all font-medium text-sm ${
                              currentModule === idx
                                ? 'bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white shadow-lg'
                                : isCompleted
                                  ? 'bg-green-50 text-green-900 border border-green-200 hover:bg-green-100'
                                  : isUnlocked
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-gray-50 text-gray-400'
                            }`}
                            disabled={!isUnlocked}
                          >
                            <span className="flex items-start gap-2">
                              <span className="mt-1">{isCompleted ? <Check size={18} /> : currentModule === idx ? <span className="inline-block w-2 h-2 bg-current rounded-full mt-1.5" /> : idx + 1}</span>
                              <span>{module.title}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'progress' && (
            <div className="p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-12">Seu Progresso</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                {[
                  { label: 'Horas Totais', value: `${stats.studyHours}h`, icon: Clock },
                  { label: 'Módulos Completos', value: String(stats.completedModules), icon: Check },
                  { label: 'Cursos Concluídos', value: String(stats.completedCourses), icon: Award },
                  { label: 'Checkpoints', value: String(stats.completedModules), icon: BookMarked },
                  { label: 'Competências', value: String(stats.developedCompetencies), icon: Sparkles },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1859c9] to-[#1351b4] rounded-lg flex items-center justify-center text-white"><Icon size={24} /></div>
                        <div>
                          <p className="text-gray-600 text-sm">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detalhamento por Curso</h3>
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="pb-6 border-b border-[#d6e5ff] last:border-b-0">
                      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                        <h4 className="font-bold text-gray-900">{course.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[#1351b4] font-bold">{courseProgress(course)}%</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => startCourse(course.id)}>
                            {courseProgress(course) === 0 ? 'Começar' : 'Continuar'}
                          </Button>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#1859c9] to-yellow-500 transition-all" style={{ width: `${courseProgress(course)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {currentPage === 'certificates' && (
            <div className="p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-12">Seus Certificados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourseList.length === 0 && (
                  <Card className="bg-white/70 border border-[#e8f0ff] p-8 text-center md:col-span-2 lg:col-span-3">
                    <Trophy size={56} className="text-[#fbcc06] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum certificado liberado ainda</h3>
                    <p className="text-gray-600 mb-6">Conclua todos os módulos de um curso para baixar seu certificado.</p>
                    <Button type="button" onClick={() => navigate('courses')} className="bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">Ver Cursos</Button>
                  </Card>
                )}
                {completedCourseList.map((course) => (
                    <Card key={course.id} className="bg-white/70 backdrop-blur-sm border-2 border-[#fbcc06] overflow-hidden">
                      <div className="bg-gradient-to-br from-[#fbcc06] to-[#e6b800] p-8 text-center">
                        <Trophy size={60} className="text-[#051a3c] mx-auto mb-3" />
                        <h4 className="font-bold text-lg text-[#051a3c]">{course.title}</h4>
                      </div>
                      <div className="p-6 text-center">
                        <p className="text-gray-600 mb-2">Status</p>
                        <p className="font-bold text-gray-900 mb-4">Concluído</p>
                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                          {(courseCompetencies[course.id] ?? []).map((competency) => (
                            <span key={competency} className="rounded-full bg-[#f0f5ff] px-3 py-1 text-xs font-semibold text-[#1351b4]">
                              {competency}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 font-mono mb-4">CAP-{course.id}-100</p>
                        <Button type="button" onClick={() => downloadCertificate(course)} className="w-full bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
                          <Download size={16} /> Baixar Certificado
                        </Button>
                      </div>
                    </Card>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'manager' && (
            <ManagerPage
              stats={stats}
              courses={courses}
              progressFor={courseProgress}
            />
          )}

          {currentPage === 'profile' && (
            <SimplePage
              title="Meu Perfil"
              icon={User}
              body="Perfil ativo para Ricardo Oliveira. Seus cursos, tentativas de quiz e certificados ficam salvos neste navegador."
              actionLabel="Ver progresso"
              onAction={() => navigate('progress')}
            />
          )}

          {currentPage === 'settings' && (
            <div className="p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Configurações</h2>
              <Card className="bg-white/70 border border-[#e8f0ff] p-8 max-w-2xl">
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Modo compacto</h3>
                    <p className="text-gray-600">Reduz levemente a escala dos textos para telas menores.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompactMode((value) => !value)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${compactMode ? 'bg-[#1351b4]' : 'bg-gray-300'}`}
                    aria-pressed={compactMode}
                  >
                    <span className={`block w-6 h-6 rounded-full bg-white transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={resetProgress}>Restaurar progresso de demonstração</Button>
              </Card>
            </div>
          )}

          {currentPage === 'help' && (
            <SimplePage
              title="Ajuda"
              icon={HelpCircle}
              body="Para avançar, leia o módulo, responda o checkpoint corretamente e use o botão de próximo módulo. Certificados aparecem automaticamente quando um curso chega a 100%."
              actionLabel="Ir para cursos"
              onAction={() => navigate('courses')}
            />
          )}
        </main>
      </div>

      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-md w-full p-8 text-center animate-in zoom-in-50 duration-300">
            <div className="mb-6 flex justify-center">
              <MascotAvatar size="lg" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Parabéns!</h3>
            <p className="text-gray-600 mb-8 text-lg">Você completou o curso {selectedCourse.title}. O certificado já está disponível.</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-green-700 font-medium">Progresso</p>
              </div>
              <div className="bg-gradient-to-br from-[#f0f5ff] to-[#e8f0ff] rounded-lg p-4">
                <p className="text-2xl font-bold text-[#1351b4]">{selectedCourse.modules.length}/{selectedCourse.modules.length}</p>
                <p className="text-xs text-[#0d3d7f] font-medium">Módulos</p>
              </div>
              <div className="bg-gradient-to-br from-[#fef7e0] to-[#fdf3d0] rounded-lg p-4 flex flex-col items-center">
                <Clock size={24} className="text-[#e6b800] mb-2" />
                <p className="text-2xl font-bold text-[#e6b800]">{selectedCourse.modules.reduce((sum, module) => sum + module.time, 0)}m</p>
                <p className="text-xs text-[#d4a500] font-medium">Tempo</p>
              </div>
            </div>
            <div className="grid gap-3">
              <Button type="button" onClick={() => downloadCertificate(selectedCourse)} className="w-full bg-gradient-to-r from-[#1351b4] to-[#1145a0] hover:from-[#1145a0] hover:to-[#0d3d7f] text-white font-bold py-3">
                <Download size={16} /> Baixar Certificado
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowCompletion(false); navigate('courses'); }} className="w-full">
                Voltar aos Cursos
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e8f0ff] pb-3 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-xl font-bold text-[#1351b4]">{value}</span>
    </div>
  );
}

function MascotAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <img
      src="/innovagov-mascot.png"
      alt=""
      aria-hidden="true"
      className={`${dimensions[size]} shrink-0 object-contain drop-shadow-md`}
    />
  );
}

function MascotTip({
  title,
  children,
  compact = false,
  className = '',
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`pointer-events-auto relative flex items-center gap-4 rounded-lg border border-[#d6e5ff] bg-white/95 shadow-xl backdrop-blur ${compact ? 'p-3 pr-9' : 'p-4 pr-10'} ${className}`}>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Fechar dica"
      >
        <X size={14} />
      </button>
      <MascotAvatar size={compact ? 'sm' : 'md'} />
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </div>
  );
}

function DashboardDiagnostic({ onStart }: { onStart: () => void }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] hover:border-[#c4d9ff] hover:shadow-xl transition-all duration-300 p-6">
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#1859c9] to-[#1351b4] rounded-lg flex items-center justify-center mb-4 text-white">
            <Check size={24} />
          </div>
          <p className="text-sm font-semibold text-[#1351b4] mb-1">DIAGNÓSTICO</p>
          <h3 className="text-xl font-bold text-gray-900">Descubra a trilha ideal</h3>
          <p className="hidden">
            Acesse o diagnóstico inicial, responda quatro pontos sobre sua rotina e veja as trilhas recomendadas para o seu perfil.
          </p>
        </div>
        <div className="hidden">
          <div className="rounded-lg border border-[#d6e5ff] bg-[#f8fbff] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1351b4] text-white">
                <Check size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Diagnóstico completo</p>
                <p className="text-sm text-gray-600">Base para ordenar as trilhas recomendadas.</p>
              </div>
            </div>
          </div>
          <Button type="button" onClick={onStart} className="bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
            Fazer diagnóstico
            <ChevronRight size={16} />
          </Button>
        </div>
        <Button type="button" onClick={onStart} className="w-full bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
          Fazer diagnóstico
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

function DiagnosticPage({
  diagnostic,
  onChange,
  onFinish,
}: {
  diagnostic: DiagnosticAnswers;
  onChange: (answers: DiagnosticAnswers) => void;
  onFinish: () => void;
}) {
  const questions: { key: keyof DiagnosticAnswers; title: string; options: string[] }[] = [
    {
      key: 'pain',
      title: 'Qual é sua maior dificuldade hoje?',
      options: [
        'Tenho pouco tempo e preciso de aulas objetivas.',
        'Os cursos são teóricos e pouco aplicáveis.',
        'Tenho insegurança com ferramentas digitais.',
        'Tenho dificuldade para transformar dados em decisões.',
        'Quero melhorar o atendimento e a comunicação com o cidadão.',
      ],
    },
    {
      key: 'time',
      title: 'Quanto tempo você consegue estudar?',
      options: ['1 hora por semana', '2 horas por semana', '4 horas por semana'],
    },
    {
      key: 'area',
      title: 'Qual área você quer desenvolver primeiro?',
      options: ['Modernização administrativa', 'Atendimento ao cidadão', 'Transformação Digital', 'Dados e indicadores', 'Projetos e entregas públicas'],
    },
    {
      key: 'format',
      title: 'Qual formato funciona melhor para você?',
      options: ['Conteúdo curto com prática guiada', 'Trilhas com certificação', 'Material objetivo para consulta rápida'],
    },
  ];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<keyof DiagnosticAnswers>>(() => new Set());
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = diagnostic[currentQuestion.key];
  const currentQuestionAnswered = answeredQuestions.has(currentQuestion.key);
  const progress = clampPercent(((currentQuestionIndex + 1) / questions.length) * 100);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }

    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="relative p-8">
        <div className="mx-auto max-w-3xl">
          <Card className="bg-white/80 border border-[#e8f0ff] p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <Check size={34} />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#1351b4]">Diagnóstico completo</p>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">Sua trilha personalizada está pronta</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Organizamos os cursos de acordo com suas respostas. Agora o servidor pode seguir direto para as trilhas recomendadas.
            </p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              {questions.map((question) => (
                <div key={question.key} className="rounded-lg border border-[#d6e5ff] bg-[#f8fbff] p-3">
                  <p className="text-xs font-bold uppercase text-[#1351b4]">{question.title}</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{diagnostic[question.key]}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button type="button" onClick={() => { setCurrentQuestionIndex(0); setCompleted(false); }} variant="outline">
                Revisar respostas
              </Button>
              <Button type="button" onClick={onFinish} className="bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
                Ir para trilhas recomendadas
                <ChevronRight size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Diagnóstico Inicial</h2>
        <p className="text-lg text-gray-600">Responda uma pergunta por vez para gerar uma trilha personalizada para o servidor.</p>
      </div>

      <div className="mx-auto mb-5 hidden max-w-3xl xl:flex">
        <MascotTip title="Dica do Innova">
          Responda pensando na sua rotina atual. Você pode refazer o diagnóstico depois e atualizar as trilhas recomendadas.
        </MascotTip>
      </div>

      <Card className="mx-auto max-w-3xl bg-white/75 border border-[#e8f0ff] p-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-4 text-sm font-semibold">
            <span className="text-[#1351b4]">Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gradient-to-r from-[#1859c9] to-[#fbcc06] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-5">{currentQuestion.title}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const selected = currentQuestionAnswered && selectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange({ ...diagnostic, [currentQuestion.key]: option });
                  setAnsweredQuestions((current) => new Set(current).add(currentQuestion.key));
                }}
                className={`w-full rounded-lg border-2 p-4 text-left font-medium transition-colors ${
                  selected ? 'border-[#1351b4] bg-[#f0f5ff] text-[#051a3c]' : 'border-gray-200 bg-white text-gray-700 hover:border-[#1351b4]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-[#1351b4] bg-[#1351b4]' : 'border-gray-300'}`}>
                    {selected && <Check size={14} className="text-white" />}
                  </span>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Pergunta anterior
          </Button>
          <Button type="button" onClick={goToNextQuestion} disabled={!currentQuestionAnswered} className="bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
            {currentQuestionIndex < questions.length - 1 ? 'Próxima pergunta' : 'Finalizar diagnóstico'}
            <ChevronRight size={16} />
          </Button>
        </div>
      </Card>

      <div className="mx-auto mt-5 grid max-w-3xl grid-cols-4 gap-2">
        {questions.map((question, index) => (
          <button
            key={question.key}
            type="button"
            onClick={() => setCurrentQuestionIndex(index)}
            className={`h-2 rounded-full transition-colors ${
              index === currentQuestionIndex || answeredQuestions.has(question.key) ? 'bg-[#1351b4]' : 'bg-gray-200'
            }`}
            aria-label={`Ir para pergunta ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TrailPage({
  diagnostic,
  courses,
  progressFor,
  onStart,
  onRetake,
}: {
  diagnostic: DiagnosticAnswers;
  courses: Course[];
  progressFor: (course: Course) => number;
  onStart: (courseId: number) => void;
  onRetake: () => void;
}) {
  return (
    <div className="relative p-8">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Minhas Trilhas</h2>
          <p className="text-lg text-gray-600">Percurso sugerido para estudar no ritmo do servidor e aplicar no trabalho.</p>
        </div>       
      </div>


      <div className="absolute right-8 top-4 z-20 hidden max-w-md xl:flex">
        <MascotTip title="Por que essa ordem?">
          O Innova usa suas respostas do diagnóstico para priorizar os temas mais adequados ao seu perfil. Caso queira mudar a recomendação, refaça o diagnóstico!
        </MascotTip>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => {
          const Icon = course.icon;
          const progress = progressFor(course);
          return (
            <Card key={course.id} className="bg-white/75 border border-[#e8f0ff] p-6">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1351b4] to-[#0d3d7f] text-white flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1351b4]">Etapa {index + 1}</p>
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                </div>
                <div className="min-w-48">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Progresso</span>
                    <span className="text-[#1351b4]">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-[#1859c9] to-[#fbcc06]" style={{ width: `${progress}%` }} />
                  </div>
                  <Button type="button" onClick={() => onStart(course.id)} className="w-full bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
                    {progress > 0 ? 'Continuar etapa' : 'Iniciar etapa'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ManagerPage({
  stats,
  courses,
  progressFor,
}: {
  stats: DashboardStats;
  courses: Course[];
  progressFor: (course: Course) => number;
}) {
  const averageProgress = clampPercent(courses.reduce((sum, course) => sum + progressFor(course), 0) / courses.length);

  return (
    <div className="p-8">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Dashboard do Gestor</h2>
        <p className="text-lg text-gray-600">Visão institucional para acompanhar engajamento, desempenho e impacto da capacitação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Servidores em capacitação', value: '128', icon: Users },
          { label: 'Progresso médio', value: `${averageProgress}%`, icon: BarChart3 },
          { label: 'Taxa de conclusão', value: `${stats.completedCourses}/${courses.length}`, icon: Award },
          { label: 'Checkpoints concluídos', value: String(stats.completedModules), icon: BookMarked },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="bg-white/75 border border-[#e8f0ff] p-6">
              <Icon size={28} className="text-[#1351b4] mb-4" />
              <p className="text-sm text-gray-600 mb-2">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/75 border border-[#e8f0ff] p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Cursos mais relevantes</h3>
          <div className="space-y-5">
            {courses.map((course) => (
              <div key={course.id}>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>{course.title}</span>
                  <span className="text-[#1351b4]">{progressFor(course)}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1859c9] to-[#fbcc06]" style={{ width: `${progressFor(course)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/75 border border-[#e8f0ff] p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Competências em desenvolvimento</h3>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(courses.flatMap((course) => courseCompetencies[course.id] ?? []))).map((competency) => (
              <span key={competency} className="rounded-full border border-[#d6e5ff] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#0d3d7f]">
                {competency}
              </span>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">Impacto estimado</p>
              <p className="text-2xl font-bold text-green-700">{stats.estimatedHoursSaved}h economizadas</p>
            </div>
            <div className="rounded-lg bg-[#f0f5ff] p-4">
              <p className="text-sm text-[#0d3d7f]">Módulos concluídos</p>
              <p className="text-2xl font-bold text-[#1351b4]">{stats.completedModules}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CourseGrid({
  title,
  courses,
  progressFor,
  onStart,
  largeTitle = false,
}: {
  title: string;
  courses: Course[];
  progressFor: (course: Course) => number;
  onStart: (courseId: number) => void;
  largeTitle?: boolean;
}) {
  return (
    <div>
      <h3 className={`${largeTitle ? 'text-4xl mb-12' : 'text-2xl mb-8'} font-bold text-gray-900 flex items-center gap-3`}>
        <span className="w-1 h-9 bg-gradient-to-b from-[#1351b4] to-[#fbcc06] rounded-full" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => {
          const CourseIcon = course.icon;
          const progress = progressFor(course);
          return (
            <Card key={course.id} className="bg-white/70 backdrop-blur-sm border border-[#e8f0ff] hover:border-[#1859c9] hover:shadow-2xl transition-all duration-300 overflow-hidden group">
              <button type="button" onClick={() => onStart(course.id)} className="w-full text-left">
                <div className="bg-gradient-to-br from-[#1351b4] to-[#0d3d7f] p-6 text-white">
                  <CourseIcon size={40} className="text-white mb-2" />
                  <h4 className="font-bold text-lg">{course.title}</h4>
                  <p className="text-[#c4d9ff] text-sm">{course.level}</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 min-h-12">{course.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-600">{course.modules.length} módulos</span>
                      <span className="text-xs font-bold text-[#1351b4]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1859c9] to-[#fbcc06] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-[#1351b4] to-[#1145a0] px-4 py-2 text-sm font-medium text-white group-hover:shadow-lg transition-all">
                    {progress > 0 ? 'Continuar' : 'Começar'}
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SimplePage({
  title,
  icon: Icon,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  icon: LucideIcon;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="p-8">
      <Card className="bg-white/70 border border-[#e8f0ff] p-8 max-w-2xl">
        <Icon size={48} className="text-[#1351b4] mb-4" />
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 text-lg mb-8">{body}</p>
        <Button type="button" onClick={onAction} className="bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
          {actionLabel}
        </Button>
      </Card>
    </div>
  );
}
