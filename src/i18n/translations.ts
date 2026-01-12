import type { CountryCode } from '@/types/helplix';

export interface Translations {
  // Navigation
  nav: {
    talk: string;
    log: string;
    report: string;
    settings: string;
    history: string;
  };
  
  // Auth / Landing
  auth: {
    tagline: string;
    description: string;
    feature1: string;
    feature2: string;
    feature3: string;
    getStarted: string;
    selectCountry: string;
    alreadyHaveAccount: string;
    noAccount: string;
    login: string;
    signUp: string;
    email: string;
    password: string;
    createAccount: string;
    back: string;
    invalidEmail: string;
    passwordMinLength: string;
    wrongCredentials: string;
    emailAlreadyRegistered: string;
    accountCreated: string;
    youAreLoggedIn: string;
    errorOccurred: string;
    selectCountryError: string;
  };
  
  // PIN Screen
  pin: {
    title: {
      create: string;
      confirm: string;
      login: string;
    };
    subtitle: {
      create: string;
      confirm: string;
      login: string;
    };
    back: string;
    clear: string;
  };
  
  // Onboarding
  onboarding: {
    appName: string;
    selectJurisdiction: string;
  };
  
  // Log Screen
  log: {
    title: string;
    entries: string;
    noConversation: string;
    cooper: string;
    you: string;
  };
  
  // Report Screen
  report: {
    title: string;
    entries: string;
    newEntries: string;
    update: string;
    generating: string;
    regenerate: string;
    generate: string;
    saving: string;
    loading: string;
    noReport: string;
    listen: string;
    stop: string;
    pdf: string;
    share: string;
    
    timeline: {
      title: string;
      generating: string;
      placeholder: string;
    };
    
    legal: {
      title: string;
      generating: string;
      placeholder: string;
    };
    
    interpretation: {
      title: string;
      generating: string;
      placeholder: string;
      disclaimer: string;
    };
    
    toast: {
      generated: string;
      generateFirst: string;
      copied: string;
      copyFailed: string;
    };
  };
  
  // Settings Screen
  settings: {
    title: string;
    country: {
      title: string;
      select: string;
      startNew: string;
    };
    caseManagement: {
      title: string;
      noActiveCase: string;
    };
    questionIntensity: {
      title: string;
      fewer: string;
      more: string;
      low: string;
      medium: string;
      high: string;
    };
    textSize: {
      title: string;
      small: string;
      medium: string;
      large: string;
    };
    buttonSize: {
      title: string;
      small: string;
      large: string;
    };
    tts: {
      title: string;
      description: string;
    };
    stt: {
      title: string;
      description: string;
    };
    realtimeTranscription: {
      title: string;
      description: string;
    };
    autoplay: {
      title: string;
      description: string;
    };
    systemPrompt: {
      title: string;
      description: string;
    };
    changeJurisdiction: string;
    logout: string;
    reset: string;
    save: string;
    completeCase: {
      button: string;
      title: string;
      description: string;
      cancel: string;
      confirm: string;
    };
    deleteConversation: {
      button: string;
      title: string;
      description: string;
      cancel: string;
      confirm: string;
    };
    
    toast: {
      saved: string;
      reset: string;
      newSession: string;
      returning: string;
      conversationDeleted: string;
      caseCompleted: string;
    };
  };
  
  // Dictaphone Screen
  dictaphone: {
    cooper: string;
    replay: string;
    type: string;
    newCase: string;
    tapToSpeak: string;
    tapToSend: string;
    processing: string;
    thinking: string;
    speaking: string;
  };
  
  // Text Input Dialog
  textInput: {
    title: string;
    placeholder: string;
    send: string;
    showQuestion: string;
    hideQuestion: string;
  };
  
  // Error Messages
  errors: {
    sessionCreate: string;
    microphone: string;
    noSpeech: string;
    recordingFailed: string;
    pinMismatch: string;
    accountCreate: string;
    reportSave: string;
    ttsDisabled: string;
    sttDisabled: string;
  };
  
  // Success Messages
  success: {
    newSession: string;
  };
  
  // Common
  common: {
    cancel: string;
  };
  
  // Session History
  history: {
    title: string;
    noSessions: string;
    resume: string;
    archive: string;
    delete: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    status: {
      active: string;
      completed: string;
      archived: string;
    };
    caseTypes: {
      general: string;
      travel_damage: string;
      consumer: string;
      insurance: string;
      housing: string;
      employment: string;
      personal_injury: string;
    };
  };
  
  // Install Screen
  install: {
    title: string;
    tagline: string;
    installed: string;
    installedDescription: string;
    installButton: string;
    settingsButton: string;
    backButton: string;
    ios: {
      title: string;
      step1: string;
      step2: string;
      step3: string;
    };
    android: {
      title: string;
      step1: string;
      step2: string;
      step3: string;
    };
    desktop: {
      title: string;
      step1: string;
      step2: string;
    };
    benefits: {
      title: string;
      homescreen: string;
      offline: string;
      fullscreen: string;
      updates: string;
    };
  };
}

export const translations: Record<CountryCode, Translations> = {
  BR: {
    nav: {
      talk: 'Falar',
      log: 'Registro',
      report: 'Relatório',
      settings: 'Configurações',
      history: 'Casos',
    },
    auth: {
      tagline: 'Seu assistente de documentação jurídica',
      description: 'O Helplix ajuda você a documentar sua situação jurídica fazendo perguntas estruturadas e criando uma visão geral abrangente.',
      feature1: 'Responda perguntas sobre sua situação',
      feature2: 'Obtenha uma linha do tempo e resumo jurídico',
      feature3: 'Prepare-se para processos legais',
      getStarted: 'Começar',
      selectCountry: 'Selecione seu país',
      alreadyHaveAccount: 'Já tem uma conta?',
      noAccount: 'Não tem uma conta?',
      login: 'Entrar',
      signUp: 'Cadastrar',
      email: 'E-mail',
      password: 'Senha',
      createAccount: 'Criar conta',
      back: 'Voltar',
      invalidEmail: 'Endereço de e-mail inválido',
      passwordMinLength: 'A senha deve ter pelo menos 6 caracteres',
      wrongCredentials: 'E-mail ou senha incorretos',
      emailAlreadyRegistered: 'Este e-mail já está cadastrado',
      accountCreated: 'Conta criada',
      youAreLoggedIn: 'Você está conectado!',
      errorOccurred: 'Ocorreu um erro',
      selectCountryError: 'Selecione um país',
    },
    pin: {
      title: {
        create: 'Criar código PIN',
        confirm: 'Confirmar código PIN',
        login: 'Digite o código PIN',
      },
      subtitle: {
        create: 'Escolha um código de 6 dígitos para fazer login',
        confirm: 'Digite o mesmo código novamente para confirmar',
        login: 'Faça login com seu código PIN',
      },
      back: 'Voltar',
      clear: 'Limpar',
    },
    onboarding: {
      appName: 'Helplix Assist',
      selectJurisdiction: 'Selecione sua jurisdição',
    },
    log: {
      title: 'Registro',
      entries: 'entradas',
      noConversation: 'Ainda não há conversa',
      cooper: 'Helplix',
      you: 'Você',
    },
    report: {
      title: 'Relatório',
      entries: 'entradas',
      newEntries: 'novas entradas',
      update: 'Atualizar',
      generating: 'Gerando...',
      regenerate: 'Regenerar relatório',
      generate: 'Gerar relatório',
      saving: 'Salvando...',
      loading: 'Carregando relatório...',
      noReport: 'Ainda não há relatório',
      listen: 'Ouvir',
      stop: 'Parar',
      pdf: 'PDF',
      share: 'Compartilhar',
      timeline: {
        title: 'Linha do Tempo',
        generating: 'Gerando linha do tempo...',
        placeholder: 'Clique em "Gerar relatório" para criar um resumo cronológico.',
      },
      legal: {
        title: 'Visão Geral Jurídica',
        generating: 'Gerando visão geral jurídica...',
        placeholder: 'Clique em "Gerar relatório" para identificar possíveis questões legais.',
      },
      interpretation: {
        title: 'Interpretação Jurídica',
        generating: 'Gerando interpretação jurídica...',
        placeholder: 'Clique em "Gerar relatório" para obter uma interpretação jurídica gerada por IA do caso.',
        disclaimer: 'AVISO LEGAL: Esta é uma análise gerada por IA apenas para fins educacionais e informativos. O conteúdo NÃO constitui aconselhamento jurídico e pode conter imprecisões. Sempre consulte um advogado licenciado.',
      },
      toast: {
        generated: 'Relatório gerado e salvo',
        generateFirst: 'Gere um relatório primeiro',
        copied: 'Relatório copiado para a área de transferência',
        copyFailed: 'Não foi possível copiar para a área de transferência',
      },
    },
    settings: {
      title: 'Configurações',
      country: {
        title: 'País / Sistema Jurídico',
        select: 'Selecione um país',
        startNew: 'Iniciar nova sessão com',
      },
      caseManagement: {
        title: 'Gerenciamento de Caso',
        noActiveCase: 'Nenhum caso ativo',
      },
      questionIntensity: {
        title: 'Intensidade das Perguntas',
        fewer: 'Menos',
        more: 'Mais',
        low: 'Poucas perguntas (geral)',
        medium: 'Perguntas moderadas',
        high: 'Muitas perguntas (detalhado)',
      },
      textSize: {
        title: 'Tamanho do Texto',
        small: 'Pequeno',
        medium: 'Médio',
        large: 'Grande',
      },
      buttonSize: {
        title: 'Tamanho do Botão de Fala',
        small: 'Pequeno',
        large: 'Grande',
      },
      tts: {
        title: 'Texto para Fala',
        description: 'Ativar texto para fala nas respostas do Helplix',
      },
      stt: {
        title: 'Fala para Texto',
        description: 'Ativar entrada de voz para suas respostas',
      },
      realtimeTranscription: {
        title: 'Transcrição em Tempo Real',
        description: 'Mostrar sua fala como texto em tempo real durante a gravação',
      },
      autoplay: {
        title: 'Reprodução Automática',
        description: 'Ler automaticamente as perguntas do Helplix em voz alta',
      },
      systemPrompt: {
        title: 'Prompt do Sistema',
        description: 'Avançado: Personalize o comportamento do Helplix',
      },
      changeJurisdiction: 'Mudar jurisdição',
      logout: 'Sair',
      reset: 'Redefinir',
      save: 'Salvar',
      completeCase: {
        button: 'Concluir caso e iniciar novo',
        title: 'Concluir caso atual?',
        description: 'O caso atual será salvo como concluído e você poderá acessá-lo no histórico. Uma nova sessão será iniciada.',
        cancel: 'Cancelar',
        confirm: 'Concluir',
      },
      deleteConversation: {
        button: 'Excluir caso atual',
        title: 'Excluir caso atual?',
        description: 'Isso excluirá permanentemente o caso ativo atual e todos os dados do registro. Uma nova sessão será iniciada automaticamente. Esta ação não pode ser desfeita.',
        cancel: 'Cancelar',
        confirm: 'Excluir',
      },
      toast: {
        saved: 'Configurações salvas',
        reset: 'Configurações redefinidas para padrão',
        newSession: 'Nova sessão iniciada com nova jurisdição',
        returning: 'Retornando à seleção de país...',
        conversationDeleted: 'Conversa excluída',
        caseCompleted: 'Caso concluído e salvo',
      },
    },
    dictaphone: {
      cooper: 'Helplix',
      replay: 'Repetir',
      type: 'Digitar',
      newCase: 'Novo caso',
      tapToSpeak: 'Toque para falar',
      tapToSend: 'Toque para enviar',
      processing: 'Processando...',
      thinking: 'Pensando...',
      speaking: 'Helplix está falando',
    },
    textInput: {
      title: 'Digite a resposta',
      placeholder: 'Escreva sua resposta...',
      send: 'Enviar',
      showQuestion: 'Mostrar pergunta',
      hideQuestion: 'Ocultar pergunta',
    },
    errors: {
      sessionCreate: 'Não foi possível criar sessão. Por favor, tente fazer login novamente.',
      microphone: 'Não foi possível acessar o microfone',
      noSpeech: 'Nenhuma fala detectada',
      recordingFailed: 'Falha ao processar gravação',
      pinMismatch: 'Os códigos PIN não correspondem. Por favor, tente novamente.',
      accountCreate: 'Não foi possível criar conta',
      reportSave: 'Não foi possível salvar relatório',
      ttsDisabled: 'Texto para fala está desativado',
      sttDisabled: 'Fala para texto está desativado',
    },
    success: {
      newSession: 'Nova sessão iniciada',
    },
    common: {
      cancel: 'Cancelar',
    },
    history: {
      title: 'Meus Casos',
      noSessions: 'Nenhum caso anterior',
      resume: 'Retomar',
      archive: 'Arquivar',
      delete: 'Excluir',
      deleteConfirmTitle: 'Excluir caso?',
      deleteConfirmDescription: 'Esta ação não pode ser desfeita. Todos os dados deste caso serão excluídos permanentemente.',
      status: {
        active: 'Ativo',
        completed: 'Concluído',
        archived: 'Arquivado',
      },
      caseTypes: {
        general: 'Geral',
        travel_damage: 'Dano de viagem',
        consumer: 'Consumidor',
        insurance: 'Seguro',
        housing: 'Moradia',
        employment: 'Trabalho',
        personal_injury: 'Lesão pessoal',
      },
    },
    install: {
      title: 'Instalar Helplix',
      tagline: 'Get Informed',
      installed: 'App instalado!',
      installedDescription: 'Você encontra o Helplix na sua tela inicial',
      installButton: 'Instalar app',
      settingsButton: 'Instalar app',
      backButton: 'Voltar para o app',
      ios: {
        title: 'Instalar no iPhone/iPad',
        step1: 'Toque no botão Compartilhar no Safari',
        step2: 'Role para baixo e selecione "Adicionar à Tela de Início"',
        step3: 'Toque em "Adicionar" no canto superior direito',
      },
      android: {
        title: 'Instalar no Android',
        step1: 'Abra o menu (⋮) no Chrome',
        step2: 'Selecione "Instalar app" ou "Adicionar à tela inicial"',
        step3: 'Confirme a instalação',
      },
      desktop: {
        title: 'Instalar no computador',
        step1: 'Clique no ícone de instalação na barra de endereço (se disponível)',
        step2: 'Ou abra o menu e selecione "Instalar Helplix"',
      },
      benefits: {
        title: 'Benefícios',
        homescreen: 'Acesso rápido da tela inicial',
        offline: 'Funciona offline',
        fullscreen: 'Modo tela cheia sem navegador',
        updates: 'Atualizações automáticas',
      },
    },
  },
  
  MX: {
    nav: {
      talk: 'Hablar',
      log: 'Registro',
      report: 'Informe',
      settings: 'Configuración',
      history: 'Casos',
    },
    auth: {
      tagline: 'Tu asistente de documentación legal',
      description: 'Helplix te ayuda a documentar tu situación legal haciendo preguntas estructuradas y creando un resumen completo.',
      feature1: 'Responde preguntas sobre tu situación',
      feature2: 'Obtén una línea de tiempo y resumen legal',
      feature3: 'Prepárate para procedimientos legales',
      getStarted: 'Comenzar',
      selectCountry: 'Selecciona tu país',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      noAccount: '¿No tienes una cuenta?',
      login: 'Iniciar sesión',
      signUp: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      createAccount: 'Crear cuenta',
      back: 'Atrás',
      invalidEmail: 'Dirección de correo inválida',
      passwordMinLength: 'La contraseña debe tener al menos 6 caracteres',
      wrongCredentials: 'Correo o contraseña incorrectos',
      emailAlreadyRegistered: 'Este correo ya está registrado',
      accountCreated: 'Cuenta creada',
      youAreLoggedIn: '¡Has iniciado sesión!',
      errorOccurred: 'Ocurrió un error',
      selectCountryError: 'Selecciona un país',
    },
    pin: {
      title: {
        create: 'Crear código PIN',
        confirm: 'Confirmar código PIN',
        login: 'Ingrese el código PIN',
      },
      subtitle: {
        create: 'Elija un código de 6 dígitos para iniciar sesión',
        confirm: 'Ingrese el mismo código nuevamente para confirmar',
        login: 'Inicie sesión con su código PIN',
      },
      back: 'Atrás',
      clear: 'Borrar',
    },
    onboarding: {
      appName: 'Helplix Assist',
      selectJurisdiction: 'Seleccione su jurisdicción',
    },
    log: {
      title: 'Registro',
      entries: 'entradas',
      noConversation: 'Aún no hay conversación',
      cooper: 'Helplix',
      you: 'Usted',
    },
    report: {
      title: 'Informe',
      entries: 'entradas',
      newEntries: 'nuevas entradas',
      update: 'Actualizar',
      generating: 'Generando...',
      regenerate: 'Regenerar informe',
      generate: 'Generar informe',
      saving: 'Guardando...',
      loading: 'Cargando informe...',
      noReport: 'Aún no hay informe',
      listen: 'Escuchar',
      stop: 'Detener',
      pdf: 'PDF',
      share: 'Compartir',
      timeline: {
        title: 'Línea de Tiempo',
        generating: 'Generando línea de tiempo...',
        placeholder: 'Haga clic en "Generar informe" para crear un resumen cronológico.',
      },
      legal: {
        title: 'Resumen Legal',
        generating: 'Generando resumen legal...',
        placeholder: 'Haga clic en "Generar informe" para identificar posibles problemas legales.',
      },
      interpretation: {
        title: 'Interpretación Legal',
        generating: 'Generando interpretación legal...',
        placeholder: 'Haga clic en "Generar informe" para obtener una interpretación legal generada por IA del caso.',
        disclaimer: 'DESCARGO DE RESPONSABILIDAD: Este es un análisis generado por IA solo con fines educativos e informativos. El contenido NO constituye asesoramiento legal y puede contener inexactitudes. Siempre consulte con un abogado licenciado.',
      },
      toast: {
        generated: 'Informe generado y guardado',
        generateFirst: 'Genere un informe primero',
        copied: 'Informe copiado al portapapeles',
        copyFailed: 'No se pudo copiar al portapapeles',
      },
    },
    settings: {
      title: 'Configuración',
      country: {
        title: 'País / Sistema Legal',
        select: 'Seleccione un país',
        startNew: 'Iniciar nueva sesión con',
      },
      caseManagement: {
        title: 'Gestión de Caso',
        noActiveCase: 'Sin caso activo',
      },
      questionIntensity: {
        title: 'Intensidad de Preguntas',
        fewer: 'Menos',
        more: 'Más',
        low: 'Pocas preguntas (general)',
        medium: 'Preguntas moderadas',
        high: 'Muchas preguntas (detallado)',
      },
      textSize: {
        title: 'Tamaño de Texto',
        small: 'Pequeño',
        medium: 'Mediano',
        large: 'Grande',
      },
      buttonSize: {
        title: 'Tamaño del Botón de Voz',
        small: 'Pequeño',
        large: 'Grande',
      },
      tts: {
        title: 'Texto a Voz',
        description: 'Activar texto a voz para las respuestas de Helplix',
      },
      stt: {
        title: 'Voz a Texto',
        description: 'Activar entrada de voz para sus respuestas',
      },
      realtimeTranscription: {
        title: 'Transcripción en Tiempo Real',
        description: 'Mostrar su voz como texto en tiempo real durante la grabación',
      },
      autoplay: {
        title: 'Reproducción Automática',
        description: 'Leer automáticamente las preguntas de Helplix en voz alta',
      },
      systemPrompt: {
        title: 'Prompt del Sistema',
        description: 'Avanzado: Personalice el comportamiento de Helplix',
      },
      changeJurisdiction: 'Cambiar jurisdicción',
      logout: 'Cerrar sesión',
      reset: 'Restablecer',
      save: 'Guardar',
      completeCase: {
        button: 'Completar caso e iniciar nuevo',
        title: '¿Completar caso actual?',
        description: 'El caso actual se guardará como completado y podrás acceder a él en el historial. Se iniciará una nueva sesión.',
        cancel: 'Cancelar',
        confirm: 'Completar',
      },
      deleteConversation: {
        button: 'Eliminar conversación',
        title: '¿Eliminar conversación?',
        description: 'Esto eliminará permanentemente toda la conversación y los datos del registro. Esta acción no se puede deshacer.',
        cancel: 'Cancelar',
        confirm: 'Eliminar',
      },
      toast: {
        saved: 'Configuración guardada',
        reset: 'Configuración restablecida a valores predeterminados',
        newSession: 'Nueva sesión iniciada con nueva jurisdicción',
        returning: 'Regresando a la selección de país...',
        conversationDeleted: 'Conversación eliminada',
        caseCompleted: 'Caso completado y guardado',
      },
    },
    dictaphone: {
      cooper: 'Helplix',
      replay: 'Repetir',
      type: 'Escribir',
      newCase: 'Nuevo caso',
      tapToSpeak: 'Toque para hablar',
      tapToSend: 'Toque para enviar',
      processing: 'Procesando...',
      thinking: 'Pensando...',
      speaking: 'Helplix está hablando',
    },
    textInput: {
      title: 'Escribir respuesta',
      placeholder: 'Escriba su respuesta...',
      send: 'Enviar',
      showQuestion: 'Mostrar pregunta',
      hideQuestion: 'Ocultar pregunta',
    },
    errors: {
      sessionCreate: 'No se pudo crear la sesión. Por favor, intente iniciar sesión nuevamente.',
      microphone: 'No se pudo acceder al micrófono',
      noSpeech: 'No se detectó voz',
      recordingFailed: 'Error al procesar la grabación',
      pinMismatch: 'Los códigos PIN no coinciden. Por favor, intente nuevamente.',
      accountCreate: 'No se pudo crear la cuenta',
      reportSave: 'No se pudo guardar el informe',
      ttsDisabled: 'Texto a voz está desactivado',
      sttDisabled: 'Voz a texto está desactivado',
    },
    success: {
      newSession: 'Nueva sesión iniciada',
    },
    common: {
      cancel: 'Cancelar',
    },
    history: {
      title: 'Mis Casos',
      noSessions: 'Sin casos anteriores',
      resume: 'Reanudar',
      archive: 'Archivar',
      delete: 'Eliminar',
      deleteConfirmTitle: '¿Eliminar caso?',
      deleteConfirmDescription: 'Esta acción no se puede deshacer. Todos los datos de este caso serán eliminados permanentemente.',
      status: {
        active: 'Activo',
        completed: 'Completado',
        archived: 'Archivado',
      },
      caseTypes: {
        general: 'General',
        travel_damage: 'Daño de viaje',
        consumer: 'Consumidor',
        insurance: 'Seguro',
        housing: 'Vivienda',
        employment: 'Empleo',
        personal_injury: 'Lesión personal',
      },
    },
    install: {
      title: 'Instalar Helplix',
      tagline: 'Get Informed',
      installed: '¡App instalada!',
      installedDescription: 'Encuentra Helplix en tu pantalla de inicio',
      installButton: 'Instalar app',
      settingsButton: 'Instalar app',
      backButton: 'Volver a la app',
      ios: {
        title: 'Instalar en iPhone/iPad',
        step1: 'Toca el botón Compartir en Safari',
        step2: 'Desplázate y selecciona "Agregar a pantalla de inicio"',
        step3: 'Toca "Agregar" en la esquina superior derecha',
      },
      android: {
        title: 'Instalar en Android',
        step1: 'Abre el menú (⋮) en Chrome',
        step2: 'Selecciona "Instalar app" o "Agregar a pantalla de inicio"',
        step3: 'Confirma la instalación',
      },
      desktop: {
        title: 'Instalar en computadora',
        step1: 'Haz clic en el ícono de instalación en la barra de direcciones (si está disponible)',
        step2: 'O abre el menú y selecciona "Instalar Helplix"',
      },
      benefits: {
        title: 'Beneficios',
        homescreen: 'Acceso rápido desde la pantalla de inicio',
        offline: 'Funciona sin conexión',
        fullscreen: 'Modo de pantalla completa sin navegador',
        updates: 'Actualizaciones automáticas',
      },
    },
  },
  
  DO: {
    nav: {
      talk: 'Hablar',
      log: 'Registro',
      report: 'Informe',
      settings: 'Configuración',
      history: 'Casos',
    },
    auth: {
      tagline: 'Tu asistente de documentación legal',
      description: 'Helplix te ayuda a documentar tu situación legal haciendo preguntas estructuradas y creando un resumen completo.',
      feature1: 'Responde preguntas sobre tu situación',
      feature2: 'Obtén una línea de tiempo y resumen legal',
      feature3: 'Prepárate para procedimientos legales',
      getStarted: 'Comenzar',
      selectCountry: 'Selecciona tu país',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      noAccount: '¿No tienes una cuenta?',
      login: 'Iniciar sesión',
      signUp: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      createAccount: 'Crear cuenta',
      back: 'Atrás',
      invalidEmail: 'Dirección de correo inválida',
      passwordMinLength: 'La contraseña debe tener al menos 6 caracteres',
      wrongCredentials: 'Correo o contraseña incorrectos',
      emailAlreadyRegistered: 'Este correo ya está registrado',
      accountCreated: 'Cuenta creada',
      youAreLoggedIn: '¡Has iniciado sesión!',
      errorOccurred: 'Ocurrió un error',
      selectCountryError: 'Selecciona un país',
    },
    pin: {
      title: {
        create: 'Crear código PIN',
        confirm: 'Confirmar código PIN',
        login: 'Ingrese el código PIN',
      },
      subtitle: {
        create: 'Elija un código de 6 dígitos para iniciar sesión',
        confirm: 'Ingrese el mismo código nuevamente para confirmar',
        login: 'Inicie sesión con su código PIN',
      },
      back: 'Atrás',
      clear: 'Borrar',
    },
    onboarding: {
      appName: 'Helplix Assist',
      selectJurisdiction: 'Seleccione su jurisdicción',
    },
    log: {
      title: 'Registro',
      entries: 'entradas',
      noConversation: 'Aún no hay conversación',
      cooper: 'Helplix',
      you: 'Usted',
    },
    report: {
      title: 'Informe',
      entries: 'entradas',
      newEntries: 'nuevas entradas',
      update: 'Actualizar',
      generating: 'Generando...',
      regenerate: 'Regenerar informe',
      generate: 'Generar informe',
      saving: 'Guardando...',
      loading: 'Cargando informe...',
      noReport: 'Aún no hay informe',
      listen: 'Escuchar',
      stop: 'Detener',
      pdf: 'PDF',
      share: 'Compartir',
      timeline: {
        title: 'Línea de Tiempo',
        generating: 'Generando línea de tiempo...',
        placeholder: 'Haga clic en "Generar informe" para crear un resumen cronológico.',
      },
      legal: {
        title: 'Resumen Legal',
        generating: 'Generando resumen legal...',
        placeholder: 'Haga clic en "Generar informe" para identificar posibles problemas legales.',
      },
      interpretation: {
        title: 'Interpretación Legal',
        generating: 'Generando interpretación legal...',
        placeholder: 'Haga clic en "Generar informe" para obtener una interpretación legal generada por IA del caso.',
        disclaimer: 'DESCARGO DE RESPONSABILIDAD: Este es un análisis generado por IA solo con fines educativos e informativos. El contenido NO constituye asesoramiento legal y puede contener inexactitudes. Siempre consulte con un abogado licenciado.',
      },
      toast: {
        generated: 'Informe generado y guardado',
        generateFirst: 'Genere un informe primero',
        copied: 'Informe copiado al portapapeles',
        copyFailed: 'No se pudo copiar al portapapeles',
      },
    },
    settings: {
      title: 'Configuración',
      country: {
        title: 'País / Sistema Legal',
        select: 'Seleccione un país',
        startNew: 'Iniciar nueva sesión con',
      },
      caseManagement: {
        title: 'Gestión de Caso',
        noActiveCase: 'Sin caso activo',
      },
      questionIntensity: {
        title: 'Intensidad de Preguntas',
        fewer: 'Menos',
        more: 'Más',
        low: 'Pocas preguntas (general)',
        medium: 'Preguntas moderadas',
        high: 'Muchas preguntas (detallado)',
      },
      textSize: {
        title: 'Tamaño de Texto',
        small: 'Pequeño',
        medium: 'Mediano',
        large: 'Grande',
      },
      buttonSize: {
        title: 'Tamaño del Botón de Voz',
        small: 'Pequeño',
        large: 'Grande',
      },
      tts: {
        title: 'Texto a Voz',
        description: 'Activar texto a voz para las respuestas de Helplix',
      },
      stt: {
        title: 'Voz a Texto',
        description: 'Activar entrada de voz para sus respuestas',
      },
      realtimeTranscription: {
        title: 'Transcripción en Tiempo Real',
        description: 'Mostrar su voz como texto en tiempo real durante la grabación',
      },
      autoplay: {
        title: 'Reproducción Automática',
        description: 'Leer automáticamente las preguntas de Helplix en voz alta',
      },
      systemPrompt: {
        title: 'Prompt del Sistema',
        description: 'Avanzado: Personalice el comportamiento de Helplix',
      },
      changeJurisdiction: 'Cambiar jurisdicción',
      logout: 'Cerrar sesión',
      reset: 'Restablecer',
      save: 'Guardar',
      completeCase: {
        button: 'Completar caso e iniciar nuevo',
        title: '¿Completar caso actual?',
        description: 'El caso actual se guardará como completado y podrás acceder a él en el historial. Se iniciará una nueva sesión.',
        cancel: 'Cancelar',
        confirm: 'Completar',
      },
      deleteConversation: {
        button: 'Eliminar caso actual',
        title: '¿Eliminar caso actual?',
        description: 'Esto eliminará permanentemente el caso activo actual y todos los datos del registro. Se iniciará una nueva sesión automáticamente. Esta acción no se puede deshacer.',
        cancel: 'Cancelar',
        confirm: 'Eliminar',
      },
      toast: {
        saved: 'Configuración guardada',
        reset: 'Configuración restablecida a valores predeterminados',
        newSession: 'Nueva sesión iniciada con nueva jurisdicción',
        returning: 'Regresando a la selección de país...',
        conversationDeleted: 'Conversación eliminada',
        caseCompleted: 'Caso completado y guardado',
      },
    },
    dictaphone: {
      cooper: 'Helplix',
      replay: 'Repetir',
      type: 'Escribir',
      newCase: 'Nuevo caso',
      tapToSpeak: 'Toque para hablar',
      tapToSend: 'Toque para enviar',
      processing: 'Procesando...',
      thinking: 'Pensando...',
      speaking: 'Helplix está hablando',
    },
    textInput: {
      title: 'Escribir respuesta',
      placeholder: 'Escriba su respuesta...',
      send: 'Enviar',
      showQuestion: 'Mostrar pregunta',
      hideQuestion: 'Ocultar pregunta',
    },
    errors: {
      sessionCreate: 'No se pudo crear la sesión. Por favor, intente iniciar sesión nuevamente.',
      microphone: 'No se pudo acceder al micrófono',
      noSpeech: 'No se detectó voz',
      recordingFailed: 'Error al procesar la grabación',
      pinMismatch: 'Los códigos PIN no coinciden. Por favor, intente nuevamente.',
      accountCreate: 'No se pudo crear la cuenta',
      reportSave: 'No se pudo guardar el informe',
      ttsDisabled: 'Texto a voz está desactivado',
      sttDisabled: 'Voz a texto está desactivado',
    },
    success: {
      newSession: 'Nueva sesión iniciada',
    },
    common: {
      cancel: 'Cancelar',
    },
    history: {
      title: 'Mis Casos',
      noSessions: 'Sin casos anteriores',
      resume: 'Reanudar',
      archive: 'Archivar',
      delete: 'Eliminar',
      deleteConfirmTitle: '¿Eliminar caso?',
      deleteConfirmDescription: 'Esta acción no se puede deshacer. Todos los datos de este caso serán eliminados permanentemente.',
      status: {
        active: 'Activo',
        completed: 'Completado',
        archived: 'Archivado',
      },
      caseTypes: {
        general: 'General',
        travel_damage: 'Daño de viaje',
        consumer: 'Consumidor',
        insurance: 'Seguro',
        housing: 'Vivienda',
        employment: 'Empleo',
        personal_injury: 'Lesión personal',
      },
    },
    install: {
      title: 'Instalar Helplix',
      tagline: 'Get Informed',
      installed: '¡App instalada!',
      installedDescription: 'Encuentra Helplix en tu pantalla de inicio',
      installButton: 'Instalar app',
      settingsButton: 'Instalar app',
      backButton: 'Volver a la app',
      ios: {
        title: 'Instalar en iPhone/iPad',
        step1: 'Toca el botón Compartir en Safari',
        step2: 'Desplázate y selecciona "Agregar a pantalla de inicio"',
        step3: 'Toca "Agregar" en la esquina superior derecha',
      },
      android: {
        title: 'Instalar en Android',
        step1: 'Abre el menú (⋮) en Chrome',
        step2: 'Selecciona "Instalar app" o "Agregar a pantalla de inicio"',
        step3: 'Confirma la instalación',
      },
      desktop: {
        title: 'Instalar en computadora',
        step1: 'Haz clic en el ícono de instalación en la barra de direcciones (si está disponible)',
        step2: 'O abre el menú y selecciona "Instalar Helplix"',
      },
      benefits: {
        title: 'Beneficios',
        homescreen: 'Acceso rápido desde la pantalla de inicio',
        offline: 'Funciona sin conexión',
        fullscreen: 'Modo de pantalla completa sin navegador',
        updates: 'Actualizaciones automáticas',
      },
    },
  },
  
  SE: {
    nav: {
      talk: 'Prata',
      log: 'Logg',
      report: 'Rapport',
      settings: 'Inställningar',
      history: 'Ärenden',
    },
    auth: {
      tagline: 'Din juridiska dokumentationsassistent',
      description: 'Helplix hjälper dig dokumentera din juridiska situation genom strukturerade frågor och skapar en omfattande översikt.',
      feature1: 'Besvara frågor om din situation',
      feature2: 'Få en tidslinje och juridisk sammanfattning',
      feature3: 'Förbered dig för rättsliga förfaranden',
      getStarted: 'Kom igång',
      selectCountry: 'Välj ditt land',
      alreadyHaveAccount: 'Har du redan ett konto?',
      noAccount: 'Har du inget konto?',
      login: 'Logga in',
      signUp: 'Registrera dig',
      email: 'E-post',
      password: 'Lösenord',
      createAccount: 'Skapa konto',
      back: 'Tillbaka',
      invalidEmail: 'Ogiltig e-postadress',
      passwordMinLength: 'Lösenordet måste vara minst 6 tecken',
      wrongCredentials: 'Felaktig e-post eller lösenord',
      emailAlreadyRegistered: 'Denna e-post är redan registrerad',
      accountCreated: 'Konto skapat',
      youAreLoggedIn: 'Du är nu inloggad!',
      errorOccurred: 'Ett fel uppstod',
      selectCountryError: 'Välj ett land',
    },
    pin: {
      title: {
        create: 'Skapa PIN-kod',
        confirm: 'Bekräfta PIN-kod',
        login: 'Ange PIN-kod',
      },
      subtitle: {
        create: 'Välj en 6-siffrig kod för att logga in',
        confirm: 'Ange samma kod igen för att bekräfta',
        login: 'Logga in med din PIN-kod',
      },
      back: 'Tillbaka',
      clear: 'Rensa',
    },
    onboarding: {
      appName: 'Helplix Assist',
      selectJurisdiction: 'Välj din jurisdiktion',
    },
    log: {
      title: 'Logg',
      entries: 'poster',
      noConversation: 'Ingen konversation ännu',
      cooper: 'Helplix',
      you: 'Du',
    },
    report: {
      title: 'Rapport',
      entries: 'poster',
      newEntries: 'nya poster',
      update: 'Uppdatera',
      generating: 'Genererar...',
      regenerate: 'Regenerera rapport',
      generate: 'Generera rapport',
      saving: 'Sparar...',
      loading: 'Laddar rapport...',
      noReport: 'Ingen rapport ännu',
      listen: 'Lyssna',
      stop: 'Stoppa',
      pdf: 'PDF',
      share: 'Dela',
      timeline: {
        title: 'Tidslinje',
        generating: 'Genererar tidslinje...',
        placeholder: 'Klicka "Generera rapport" för att skapa en kronologisk sammanfattning.',
      },
      legal: {
        title: 'Juridisk Översikt',
        generating: 'Genererar juridisk översikt...',
        placeholder: 'Klicka "Generera rapport" för att identifiera potentiella juridiska frågor.',
      },
      interpretation: {
        title: 'Juridisk Tolkning',
        generating: 'Genererar juridisk tolkning...',
        placeholder: 'Klicka "Generera rapport" för att få en AI-genererad juridisk tolkning av ärendet.',
        disclaimer: 'DISCLAIMER: Detta är en AI-genererad analys endast för utbildnings- och informationssyfte. Innehållet utgör INTE juridisk rådgivning och kan innehålla felaktigheter. Konsultera alltid en legitimerad jurist.',
      },
      toast: {
        generated: 'Rapport genererad och sparad',
        generateFirst: 'Generera en rapport först',
        copied: 'Rapport kopierad till urklipp',
        copyFailed: 'Kunde inte kopiera till urklipp',
      },
    },
    settings: {
      title: 'Inställningar',
      country: {
        title: 'Land / Rättssystem',
        select: 'Välj ett land',
        startNew: 'Starta ny session med',
      },
      caseManagement: {
        title: 'Ärendehantering',
        noActiveCase: 'Inget pågående ärende',
      },
      questionIntensity: {
        title: 'Frågeintensitet',
        fewer: 'Färre',
        more: 'Fler',
        low: 'Få frågor (allmänt)',
        medium: 'Måttliga frågor',
        high: 'Många frågor (detaljerat)',
      },
      textSize: {
        title: 'Textstorlek',
        small: 'Liten',
        medium: 'Medel',
        large: 'Stor',
      },
      buttonSize: {
        title: 'Talknappstorlek',
        small: 'Liten',
        large: 'Stor',
      },
      tts: {
        title: 'Text-till-tal',
        description: 'Aktivera text-till-tal för Helplix svar',
      },
      stt: {
        title: 'Tal-till-text',
        description: 'Aktivera röstinmatning för dina svar',
      },
      realtimeTranscription: {
        title: 'Realtidstranskribering',
        description: 'Visa ditt tal som text i realtid under inspelning',
      },
      autoplay: {
        title: 'Automatisk uppspelning',
        description: 'Läs automatiskt upp Helplix frågor högt',
      },
      systemPrompt: {
        title: 'Systemprompt',
        description: 'Avancerat: Anpassa Helplix beteende',
      },
      changeJurisdiction: 'Byt jurisdiktion',
      logout: 'Logga ut',
      reset: 'Återställ inställningar',
      save: 'Spara',
      completeCase: {
        button: 'Avsluta ärende och starta nytt',
        title: 'Avsluta pågående ärende?',
        description: 'Det aktuella ärendet sparas som avslutat och du kan komma åt det i historiken. En ny session startas.',
        cancel: 'Avbryt',
        confirm: 'Avsluta',
      },
      deleteConversation: {
        button: 'Radera aktivt ärende',
        title: 'Radera aktivt ärende?',
        description: 'Detta raderar permanent det pågående ärendet och all tillhörande data. En ny session startas automatiskt. Åtgärden kan inte ångras.',
        cancel: 'Avbryt',
        confirm: 'Radera',
      },
      toast: {
        saved: 'Inställningar sparade',
        reset: 'Inställningar återställda till standard',
        newSession: 'Ny session startad med ny jurisdiktion',
        returning: 'Återgår till landsval...',
        conversationDeleted: 'Ärende raderat',
        caseCompleted: 'Ärende avslutat och sparat',
      },
    },
    dictaphone: {
      cooper: 'Helplix',
      replay: 'Spela upp',
      type: 'Skriv',
      newCase: 'Nytt ärende',
      tapToSpeak: 'Tryck för att tala',
      tapToSend: 'Tryck för att skicka',
      processing: 'Bearbetar...',
      thinking: 'Tänker...',
      speaking: 'Helplix talar',
    },
    textInput: {
      title: 'Skriv svar',
      placeholder: 'Skriv ditt svar...',
      send: 'Skicka',
      showQuestion: 'Visa fråga',
      hideQuestion: 'Dölj fråga',
    },
    errors: {
      sessionCreate: 'Kunde inte skapa session. Försök logga in igen.',
      microphone: 'Kunde inte komma åt mikrofonen',
      noSpeech: 'Inget tal upptäckt',
      recordingFailed: 'Misslyckades med att bearbeta inspelning',
      pinMismatch: 'PIN-koderna matchar inte. Försök igen.',
      accountCreate: 'Kunde inte skapa konto',
      reportSave: 'Kunde inte spara rapport',
      ttsDisabled: 'Text-till-tal är inaktiverat',
      sttDisabled: 'Tal-till-text är inaktiverat',
    },
    success: {
      newSession: 'Ny session startad',
    },
    common: {
      cancel: 'Avbryt',
    },
    history: {
      title: 'Mina ärenden',
      noSessions: 'Inga tidigare ärenden',
      resume: 'Återuppta',
      archive: 'Arkivera',
      delete: 'Radera',
      deleteConfirmTitle: 'Radera ärende?',
      deleteConfirmDescription: 'Denna åtgärd kan inte ångras. All data för detta ärende kommer att raderas permanent.',
      status: {
        active: 'Pågående',
        completed: 'Avslutad',
        archived: 'Arkiverad',
      },
      caseTypes: {
        general: 'Allmänt',
        travel_damage: 'Reseskada',
        consumer: 'Konsument',
        insurance: 'Försäkring',
        housing: 'Bostad',
        employment: 'Arbetsrätt',
        personal_injury: 'Personskada',
      },
    },
    install: {
      title: 'Installera Helplix',
      tagline: 'Get Informed',
      installed: 'Appen är installerad!',
      installedDescription: 'Du hittar Helplix på din hemskärm',
      installButton: 'Installera appen',
      settingsButton: 'Installera appen',
      backButton: 'Tillbaka till appen',
      ios: {
        title: 'Installera på iPhone/iPad',
        step1: 'Tryck på Dela-knappen i Safari',
        step2: 'Scrolla ner och välj "Lägg till på hemskärmen"',
        step3: 'Tryck "Lägg till" uppe till höger',
      },
      android: {
        title: 'Installera på Android',
        step1: 'Öppna menyn (⋮) i Chrome',
        step2: 'Välj "Installera app" eller "Lägg till på startskärmen"',
        step3: 'Bekräfta installationen',
      },
      desktop: {
        title: 'Installera på dator',
        step1: 'Klicka på installera-ikonen i adressfältet (om tillgänglig)',
        step2: 'Eller öppna menyn och välj "Installera Helplix"',
      },
      benefits: {
        title: 'Fördelar',
        homescreen: 'Snabb åtkomst från hemskärmen',
        offline: 'Fungerar offline',
        fullscreen: 'Helskärmsläge utan webbläsare',
        updates: 'Automatiska uppdateringar',
      },
    },
  },
  
  US: {
    nav: {
      talk: 'Talk',
      log: 'Log',
      report: 'Report',
      settings: 'Settings',
      history: 'Cases',
    },
    auth: {
      tagline: 'Your legal documentation assistant',
      description: 'Helplix helps you document your legal situation by asking structured questions and creating a comprehensive overview.',
      feature1: 'Answer questions about your situation',
      feature2: 'Get a timeline and legal summary',
      feature3: 'Prepare for legal proceedings',
      getStarted: 'Get Started',
      selectCountry: 'Select your country',
      alreadyHaveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      login: 'Log in',
      signUp: 'Sign up',
      email: 'Email',
      password: 'Password',
      createAccount: 'Create account',
      back: 'Back',
      invalidEmail: 'Invalid email address',
      passwordMinLength: 'Password must be at least 6 characters',
      wrongCredentials: 'Wrong email or password',
      emailAlreadyRegistered: 'This email is already registered',
      accountCreated: 'Account created',
      youAreLoggedIn: 'You are now logged in!',
      errorOccurred: 'An error occurred',
      selectCountryError: 'Select a country',
    },
    pin: {
      title: {
        create: 'Create PIN code',
        confirm: 'Confirm PIN code',
        login: 'Enter PIN code',
      },
      subtitle: {
        create: 'Choose a 6-digit code to log in',
        confirm: 'Enter the same code again to confirm',
        login: 'Log in with your PIN code',
      },
      back: 'Back',
      clear: 'Clear',
    },
    onboarding: {
      appName: 'Helplix Assist',
      selectJurisdiction: 'Select your jurisdiction',
    },
    log: {
      title: 'Log',
      entries: 'entries',
      noConversation: 'No conversation yet',
      cooper: 'Helplix',
      you: 'You',
    },
    report: {
      title: 'Report',
      entries: 'entries',
      newEntries: 'new entries',
      update: 'Update',
      generating: 'Generating...',
      regenerate: 'Regenerate report',
      generate: 'Generate report',
      saving: 'Saving...',
      loading: 'Loading report...',
      noReport: 'No report yet',
      listen: 'Listen',
      stop: 'Stop',
      pdf: 'PDF',
      share: 'Share',
      timeline: {
        title: 'Timeline',
        generating: 'Generating timeline...',
        placeholder: 'Click "Generate report" to create a chronological summary.',
      },
      legal: {
        title: 'Legal Overview',
        generating: 'Generating legal overview...',
        placeholder: 'Click "Generate report" to identify potential legal issues.',
      },
      interpretation: {
        title: 'Legal Interpretation',
        generating: 'Generating legal interpretation...',
        placeholder: 'Click "Generate report" to get an AI-generated legal interpretation of the case.',
        disclaimer: 'DISCLAIMER: This is an AI-generated analysis for educational and informational purposes only. The content does NOT constitute legal advice and may contain inaccuracies. Always consult with a licensed attorney.',
      },
      toast: {
        generated: 'Report generated and saved',
        generateFirst: 'Generate a report first',
        copied: 'Report copied to clipboard',
        copyFailed: 'Could not copy to clipboard',
      },
    },
    settings: {
      title: 'Settings',
      country: {
        title: 'Country / Legal System',
        select: 'Select a country',
        startNew: 'Start new session with',
      },
      caseManagement: {
        title: 'Case Management',
        noActiveCase: 'No active case',
      },
      questionIntensity: {
        title: 'Question Intensity',
        fewer: 'Fewer',
        more: 'More',
        low: 'Few questions (general)',
        medium: 'Moderate questions',
        high: 'Many questions (detailed)',
      },
      textSize: {
        title: 'Text Size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
      },
      buttonSize: {
        title: 'Speak Button Size',
        small: 'Small',
        large: 'Large',
      },
      tts: {
        title: 'Text-to-Speech',
        description: 'Enable text-to-speech for Helplix\'s responses',
      },
      stt: {
        title: 'Speech-to-Text',
        description: 'Enable voice input for your responses',
      },
      realtimeTranscription: {
        title: 'Real-time Transcription',
        description: 'Display your speech as text in real-time while recording',
      },
      autoplay: {
        title: 'Autoplay Responses',
        description: 'Automatically read Helplix\'s questions aloud',
      },
      systemPrompt: {
        title: 'System Prompt',
        description: 'Advanced: Customize Helplix\'s behavior',
      },
      changeJurisdiction: 'Change jurisdiction',
      logout: 'Log out',
      reset: 'Reset',
      save: 'Save',
      completeCase: {
        button: 'Complete case and start new',
        title: 'Complete current case?',
        description: 'The current case will be saved as completed and you can access it in the history. A new session will start.',
        cancel: 'Cancel',
        confirm: 'Complete',
      },
      deleteConversation: {
        button: 'Delete current case',
        title: 'Delete current case?',
        description: 'This will permanently delete the active case and all its data. A new session will start automatically. This action cannot be undone.',
        cancel: 'Cancel',
        confirm: 'Delete',
      },
      toast: {
        saved: 'Settings saved',
        reset: 'Settings reset to defaults',
        newSession: 'New session started with new jurisdiction',
        returning: 'Returning to country selection...',
        conversationDeleted: 'Conversation deleted',
        caseCompleted: 'Case completed and saved',
      },
    },
    dictaphone: {
      cooper: 'Helplix',
      replay: 'Replay',
      type: 'Type',
      newCase: 'New case',
      tapToSpeak: 'Tap to speak',
      tapToSend: 'Tap to send',
      processing: 'Processing...',
      thinking: 'Thinking...',
      speaking: 'Helplix is speaking',
    },
    textInput: {
      title: 'Type response',
      placeholder: 'Write your answer...',
      send: 'Send',
      showQuestion: 'Show question',
      hideQuestion: 'Hide question',
    },
    errors: {
      sessionCreate: 'Could not create session. Please try logging in again.',
      microphone: 'Could not access microphone',
      noSpeech: 'No speech detected',
      recordingFailed: 'Failed to process recording',
      pinMismatch: 'PIN codes do not match. Please try again.',
      accountCreate: 'Could not create account',
      reportSave: 'Could not save report',
      ttsDisabled: 'Text-to-speech is disabled',
      sttDisabled: 'Speech-to-text is disabled',
    },
    success: {
      newSession: 'New session started',
    },
    common: {
      cancel: 'Cancel',
    },
    history: {
      title: 'My Cases',
      noSessions: 'No previous cases',
      resume: 'Resume',
      archive: 'Archive',
      delete: 'Delete',
      deleteConfirmTitle: 'Delete case?',
      deleteConfirmDescription: 'This action cannot be undone. All data for this case will be permanently deleted.',
      status: {
        active: 'Active',
        completed: 'Completed',
        archived: 'Archived',
      },
      caseTypes: {
        general: 'General',
        travel_damage: 'Travel damage',
        consumer: 'Consumer',
        insurance: 'Insurance',
        housing: 'Housing',
        employment: 'Employment',
        personal_injury: 'Personal injury',
      },
    },
    install: {
      title: 'Install Helplix',
      tagline: 'Get Informed',
      installed: 'App installed!',
      installedDescription: 'You can find Helplix on your home screen',
      installButton: 'Install app',
      settingsButton: 'Install app',
      backButton: 'Back to app',
      ios: {
        title: 'Install on iPhone/iPad',
        step1: 'Tap the Share button in Safari',
        step2: 'Scroll down and select "Add to Home Screen"',
        step3: 'Tap "Add" in the top right corner',
      },
      android: {
        title: 'Install on Android',
        step1: 'Open the menu (⋮) in Chrome',
        step2: 'Select "Install app" or "Add to Home screen"',
        step3: 'Confirm the installation',
      },
      desktop: {
        title: 'Install on computer',
        step1: 'Click the install icon in the address bar (if available)',
        step2: 'Or open the menu and select "Install Helplix"',
      },
      benefits: {
        title: 'Benefits',
        homescreen: 'Quick access from home screen',
        offline: 'Works offline',
        fullscreen: 'Full screen mode without browser',
        updates: 'Automatic updates',
      },
    },
  },
  
  NL: {
    nav: {
      talk: 'Praten',
      log: 'Logboek',
      report: 'Rapport',
      settings: 'Instellingen',
      history: 'Zaken',
    },
    auth: {
      tagline: 'Uw juridische documentatie-assistent',
      description: 'Helplix helpt u uw juridische situatie te documenteren door gestructureerde vragen te stellen en een uitgebreid overzicht te maken.',
      feature1: 'Beantwoord vragen over uw situatie',
      feature2: 'Krijg een tijdlijn en juridische samenvatting',
      feature3: 'Bereid u voor op juridische procedures',
      getStarted: 'Aan de slag',
      selectCountry: 'Selecteer uw land',
      alreadyHaveAccount: 'Heeft u al een account?',
      noAccount: 'Heeft u geen account?',
      login: 'Inloggen',
      signUp: 'Registreren',
      email: 'E-mail',
      password: 'Wachtwoord',
      createAccount: 'Account aanmaken',
      back: 'Terug',
      invalidEmail: 'Ongeldig e-mailadres',
      passwordMinLength: 'Wachtwoord moet minimaal 6 tekens bevatten',
      wrongCredentials: 'Verkeerde e-mail of wachtwoord',
      emailAlreadyRegistered: 'Dit e-mailadres is al geregistreerd',
      accountCreated: 'Account aangemaakt',
      youAreLoggedIn: 'U bent nu ingelogd!',
      errorOccurred: 'Er is een fout opgetreden',
      selectCountryError: 'Selecteer een land',
    },
    pin: {
      title: {
        create: 'PIN-code aanmaken',
        confirm: 'PIN-code bevestigen',
        login: 'Voer PIN-code in',
      },
      subtitle: {
        create: 'Kies een 6-cijferige code om in te loggen',
        confirm: 'Voer dezelfde code opnieuw in ter bevestiging',
        login: 'Log in met uw PIN-code',
      },
      back: 'Terug',
      clear: 'Wissen',
    },
    onboarding: {
      appName: 'Helplix Assist',
      selectJurisdiction: 'Selecteer uw jurisdictie',
    },
    log: {
      title: 'Logboek',
      entries: 'items',
      noConversation: 'Nog geen gesprek',
      cooper: 'Helplix',
      you: 'U',
    },
    report: {
      title: 'Rapport',
      entries: 'items',
      newEntries: 'nieuwe items',
      update: 'Bijwerken',
      generating: 'Genereren...',
      regenerate: 'Rapport opnieuw genereren',
      generate: 'Rapport genereren',
      saving: 'Opslaan...',
      loading: 'Rapport laden...',
      noReport: 'Nog geen rapport',
      listen: 'Luisteren',
      stop: 'Stop',
      pdf: 'PDF',
      share: 'Delen',
      timeline: {
        title: 'Tijdlijn',
        generating: 'Tijdlijn genereren...',
        placeholder: 'Klik op "Rapport genereren" om een chronologische samenvatting te maken.',
      },
      legal: {
        title: 'Juridisch Overzicht',
        generating: 'Juridisch overzicht genereren...',
        placeholder: 'Klik op "Rapport genereren" om mogelijke juridische problemen te identificeren.',
      },
      interpretation: {
        title: 'Juridische Interpretatie',
        generating: 'Juridische interpretatie genereren...',
        placeholder: 'Klik op "Rapport genereren" om een door AI gegenereerde juridische interpretatie van de zaak te krijgen.',
        disclaimer: 'DISCLAIMER: Dit is een door AI gegenereerde analyse alleen voor educatieve en informatieve doeleinden. De inhoud vormt GEEN juridisch advies en kan onjuistheden bevatten. Raadpleeg altijd een erkende advocaat.',
      },
      toast: {
        generated: 'Rapport gegenereerd en opgeslagen',
        generateFirst: 'Genereer eerst een rapport',
        copied: 'Rapport gekopieerd naar klembord',
        copyFailed: 'Kon niet kopiëren naar klembord',
      },
    },
    settings: {
      title: 'Instellingen',
      country: {
        title: 'Land / Rechtssysteem',
        select: 'Selecteer een land',
        startNew: 'Start nieuwe sessie met',
      },
      caseManagement: {
        title: 'Zaakbeheer',
        noActiveCase: 'Geen actieve zaak',
      },
      questionIntensity: {
        title: 'Vraagintensiteit',
        fewer: 'Minder',
        more: 'Meer',
        low: 'Weinig vragen (algemeen)',
        medium: 'Gematigde vragen',
        high: 'Veel vragen (gedetailleerd)',
      },
      textSize: {
        title: 'Tekstgrootte',
        small: 'Klein',
        medium: 'Gemiddeld',
        large: 'Groot',
      },
      buttonSize: {
        title: 'Spraakknopgrootte',
        small: 'Klein',
        large: 'Groot',
      },
      tts: {
        title: 'Tekst-naar-spraak',
        description: 'Schakel tekst-naar-spraak in voor Helplix\'s antwoorden',
      },
      stt: {
        title: 'Spraak-naar-tekst',
        description: 'Schakel spraakinvoer in voor uw antwoorden',
      },
      realtimeTranscription: {
        title: 'Realtime Transcriptie',
        description: 'Toon uw spraak als tekst in realtime tijdens opname',
      },
      autoplay: {
        title: 'Automatisch afspelen',
        description: 'Lees Helplix\'s vragen automatisch hardop voor',
      },
      systemPrompt: {
        title: 'Systeemprompt',
        description: 'Geavanceerd: Pas Helplix\'s gedrag aan',
      },
      changeJurisdiction: 'Wijzig jurisdictie',
      logout: 'Uitloggen',
      reset: 'Resetten',
      save: 'Opslaan',
      completeCase: {
        button: 'Zaak afronden en nieuwe starten',
        title: 'Huidige zaak afronden?',
        description: 'De huidige zaak wordt opgeslagen als afgerond en is toegankelijk in de geschiedenis. Een nieuwe sessie wordt gestart.',
        cancel: 'Annuleren',
        confirm: 'Afronden',
      },
      deleteConversation: {
        button: 'Huidige zaak verwijderen',
        title: 'Huidige zaak verwijderen?',
        description: 'Dit verwijdert permanent de actieve zaak en alle bijbehorende gegevens. Een nieuwe sessie wordt automatisch gestart. Deze actie kan niet ongedaan worden gemaakt.',
        cancel: 'Annuleren',
        confirm: 'Verwijderen',
      },
      toast: {
        saved: 'Instellingen opgeslagen',
        reset: 'Instellingen gereset naar standaard',
        newSession: 'Nieuwe sessie gestart met nieuwe jurisdictie',
        returning: 'Terug naar landselectie...',
        conversationDeleted: 'Gesprek verwijderd',
        caseCompleted: 'Zaak afgerond en opgeslagen',
      },
    },
    dictaphone: {
      cooper: 'Helplix',
      replay: 'Herhalen',
      type: 'Typen',
      newCase: 'Nieuwe zaak',
      tapToSpeak: 'Tik om te spreken',
      tapToSend: 'Tik om te verzenden',
      processing: 'Verwerken...',
      thinking: 'Denken...',
      speaking: 'Helplix is aan het spreken',
    },
    textInput: {
      title: 'Antwoord typen',
      placeholder: 'Schrijf uw antwoord...',
      send: 'Verzenden',
      showQuestion: 'Vraag tonen',
      hideQuestion: 'Vraag verbergen',
    },
    errors: {
      sessionCreate: 'Kon sessie niet aanmaken. Probeer opnieuw in te loggen.',
      microphone: 'Kon geen toegang krijgen tot microfoon',
      noSpeech: 'Geen spraak gedetecteerd',
      recordingFailed: 'Opname verwerken mislukt',
      pinMismatch: 'PIN-codes komen niet overeen. Probeer het opnieuw.',
      accountCreate: 'Kon account niet aanmaken',
      reportSave: 'Kon rapport niet opslaan',
      ttsDisabled: 'Tekst-naar-spraak is uitgeschakeld',
      sttDisabled: 'Spraak-naar-tekst is uitgeschakeld',
    },
    success: {
      newSession: 'Nieuwe sessie gestart',
    },
    common: {
      cancel: 'Annuleren',
    },
    history: {
      title: 'Mijn Zaken',
      noSessions: 'Geen eerdere zaken',
      resume: 'Hervatten',
      archive: 'Archiveren',
      delete: 'Verwijderen',
      deleteConfirmTitle: 'Zaak verwijderen?',
      deleteConfirmDescription: 'Deze actie kan niet ongedaan worden gemaakt. Alle gegevens voor deze zaak worden permanent verwijderd.',
      status: {
        active: 'Actief',
        completed: 'Voltooid',
        archived: 'Gearchiveerd',
      },
      caseTypes: {
        general: 'Algemeen',
        travel_damage: 'Reisschade',
        consumer: 'Consument',
        insurance: 'Verzekering',
        housing: 'Huisvesting',
        employment: 'Arbeidsrecht',
        personal_injury: 'Letselschade',
      },
    },
    install: {
      title: 'Installeer Helplix',
      tagline: 'Get Informed',
      installed: 'App geïnstalleerd!',
      installedDescription: 'U vindt Helplix op uw startscherm',
      installButton: 'App installeren',
      settingsButton: 'App installeren',
      backButton: 'Terug naar app',
      ios: {
        title: 'Installeren op iPhone/iPad',
        step1: 'Tik op de Deel-knop in Safari',
        step2: 'Scroll naar beneden en selecteer "Zet op beginscherm"',
        step3: 'Tik op "Voeg toe" rechtsboven',
      },
      android: {
        title: 'Installeren op Android',
        step1: 'Open het menu (⋮) in Chrome',
        step2: 'Selecteer "App installeren" of "Toevoegen aan startscherm"',
        step3: 'Bevestig de installatie',
      },
      desktop: {
        title: 'Installeren op computer',
        step1: 'Klik op het installatie-icoon in de adresbalk (indien beschikbaar)',
        step2: 'Of open het menu en selecteer "Helplix installeren"',
      },
      benefits: {
        title: 'Voordelen',
        homescreen: 'Snelle toegang vanaf startscherm',
        offline: 'Werkt offline',
        fullscreen: 'Volledig scherm zonder browser',
        updates: 'Automatische updates',
      },
    },
  },
};
