import type { CountryCode } from '@/types/cooper';

export interface Translations {
  // Navigation
  nav: {
    talk: string;
    log: string;
    report: string;
    settings: string;
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
    
    toast: {
      saved: string;
      reset: string;
      newSession: string;
      returning: string;
    };
  };
  
  // Dictaphone Screen
  dictaphone: {
    cooper: string;
    replay: string;
    type: string;
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
}

export const translations: Record<CountryCode, Translations> = {
  BR: {
    nav: {
      talk: 'Falar',
      log: 'Registro',
      report: 'Relatório',
      settings: 'Configurações',
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
      appName: 'Coopers Law',
      selectJurisdiction: 'Selecione sua jurisdição',
    },
    log: {
      title: 'Registro',
      entries: 'entradas',
      noConversation: 'Ainda não há conversa',
      cooper: 'Cooper',
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
        description: 'Ativar texto para fala nas respostas do Cooper',
      },
      stt: {
        title: 'Fala para Texto',
        description: 'Ativar entrada de voz para suas respostas',
      },
      autoplay: {
        title: 'Reprodução Automática',
        description: 'Ler automaticamente as perguntas do Cooper em voz alta',
      },
      systemPrompt: {
        title: 'Prompt do Sistema',
        description: 'Avançado: Personalize o comportamento do Cooper',
      },
      changeJurisdiction: 'Mudar jurisdição',
      logout: 'Sair',
      reset: 'Redefinir',
      save: 'Salvar',
      toast: {
        saved: 'Configurações salvas',
        reset: 'Configurações redefinidas para padrão',
        newSession: 'Nova sessão iniciada com nova jurisdição',
        returning: 'Retornando à seleção de país...',
      },
    },
    dictaphone: {
      cooper: 'Cooper',
      replay: 'Repetir',
      type: 'Digitar',
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
  },
  
  MX: {
    nav: {
      talk: 'Hablar',
      log: 'Registro',
      report: 'Informe',
      settings: 'Configuración',
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
      appName: 'Coopers Law',
      selectJurisdiction: 'Seleccione su jurisdicción',
    },
    log: {
      title: 'Registro',
      entries: 'entradas',
      noConversation: 'Aún no hay conversación',
      cooper: 'Cooper',
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
        description: 'Activar texto a voz para las respuestas de Cooper',
      },
      stt: {
        title: 'Voz a Texto',
        description: 'Activar entrada de voz para sus respuestas',
      },
      autoplay: {
        title: 'Reproducción Automática',
        description: 'Leer automáticamente las preguntas de Cooper en voz alta',
      },
      systemPrompt: {
        title: 'Prompt del Sistema',
        description: 'Avanzado: Personalice el comportamiento de Cooper',
      },
      changeJurisdiction: 'Cambiar jurisdicción',
      logout: 'Cerrar sesión',
      reset: 'Restablecer',
      save: 'Guardar',
      toast: {
        saved: 'Configuración guardada',
        reset: 'Configuración restablecida a valores predeterminados',
        newSession: 'Nueva sesión iniciada con nueva jurisdicción',
        returning: 'Regresando a la selección de país...',
      },
    },
    dictaphone: {
      cooper: 'Cooper',
      replay: 'Repetir',
      type: 'Escribir',
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
  },
  
  DO: {
    nav: {
      talk: 'Hablar',
      log: 'Registro',
      report: 'Informe',
      settings: 'Configuración',
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
      appName: 'Coopers Law',
      selectJurisdiction: 'Seleccione su jurisdicción',
    },
    log: {
      title: 'Registro',
      entries: 'entradas',
      noConversation: 'Aún no hay conversación',
      cooper: 'Cooper',
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
        description: 'Activar texto a voz para las respuestas de Cooper',
      },
      stt: {
        title: 'Voz a Texto',
        description: 'Activar entrada de voz para sus respuestas',
      },
      autoplay: {
        title: 'Reproducción Automática',
        description: 'Leer automáticamente las preguntas de Cooper en voz alta',
      },
      systemPrompt: {
        title: 'Prompt del Sistema',
        description: 'Avanzado: Personalice el comportamiento de Cooper',
      },
      changeJurisdiction: 'Cambiar jurisdicción',
      logout: 'Cerrar sesión',
      reset: 'Restablecer',
      save: 'Guardar',
      toast: {
        saved: 'Configuración guardada',
        reset: 'Configuración restablecida a valores predeterminados',
        newSession: 'Nueva sesión iniciada con nueva jurisdicción',
        returning: 'Regresando a la selección de país...',
      },
    },
    dictaphone: {
      cooper: 'Cooper',
      replay: 'Repetir',
      type: 'Escribir',
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
  },
  
  SE: {
    nav: {
      talk: 'Prata',
      log: 'Logg',
      report: 'Rapport',
      settings: 'Inställningar',
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
      appName: 'Coopers Law',
      selectJurisdiction: 'Välj din jurisdiktion',
    },
    log: {
      title: 'Logg',
      entries: 'poster',
      noConversation: 'Ingen konversation ännu',
      cooper: 'Cooper',
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
        description: 'Aktivera text-till-tal för Coopers svar',
      },
      stt: {
        title: 'Tal-till-text',
        description: 'Aktivera röstinmatning för dina svar',
      },
      autoplay: {
        title: 'Automatisk uppspelning',
        description: 'Läs automatiskt upp Coopers frågor högt',
      },
      systemPrompt: {
        title: 'Systemprompt',
        description: 'Avancerat: Anpassa Coopers beteende',
      },
      changeJurisdiction: 'Byt jurisdiktion',
      logout: 'Logga ut',
      reset: 'Återställ',
      save: 'Spara',
      toast: {
        saved: 'Inställningar sparade',
        reset: 'Inställningar återställda till standard',
        newSession: 'Ny session startad med ny jurisdiktion',
        returning: 'Återgår till landsval...',
      },
    },
    dictaphone: {
      cooper: 'Cooper',
      replay: 'Spela upp',
      type: 'Skriv',
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
  },
  
  US: {
    nav: {
      talk: 'Talk',
      log: 'Log',
      report: 'Report',
      settings: 'Settings',
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
      appName: 'Coopers Law',
      selectJurisdiction: 'Select your jurisdiction',
    },
    log: {
      title: 'Log',
      entries: 'entries',
      noConversation: 'No conversation yet',
      cooper: 'Cooper',
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
        description: 'Enable text-to-speech for Cooper\'s responses',
      },
      stt: {
        title: 'Speech-to-Text',
        description: 'Enable voice input for your responses',
      },
      autoplay: {
        title: 'Autoplay Responses',
        description: 'Automatically read Cooper\'s questions aloud',
      },
      systemPrompt: {
        title: 'System Prompt',
        description: 'Advanced: Customize Cooper\'s behavior',
      },
      changeJurisdiction: 'Change jurisdiction',
      logout: 'Log out',
      reset: 'Reset',
      save: 'Save',
      toast: {
        saved: 'Settings saved',
        reset: 'Settings reset to defaults',
        newSession: 'New session started with new jurisdiction',
        returning: 'Returning to country selection...',
      },
    },
    dictaphone: {
      cooper: 'Cooper',
      replay: 'Replay',
      type: 'Type',
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
  },
  
  NL: {
    nav: {
      talk: 'Praten',
      log: 'Logboek',
      report: 'Rapport',
      settings: 'Instellingen',
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
      appName: 'Coopers Law',
      selectJurisdiction: 'Selecteer uw jurisdictie',
    },
    log: {
      title: 'Logboek',
      entries: 'items',
      noConversation: 'Nog geen gesprek',
      cooper: 'Cooper',
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
        description: 'Schakel tekst-naar-spraak in voor Cooper\'s antwoorden',
      },
      stt: {
        title: 'Spraak-naar-tekst',
        description: 'Schakel spraakinvoer in voor uw antwoorden',
      },
      autoplay: {
        title: 'Automatisch afspelen',
        description: 'Lees Cooper\'s vragen automatisch hardop voor',
      },
      systemPrompt: {
        title: 'Systeemprompt',
        description: 'Geavanceerd: Pas Cooper\'s gedrag aan',
      },
      changeJurisdiction: 'Wijzig jurisdictie',
      logout: 'Uitloggen',
      reset: 'Resetten',
      save: 'Opslaan',
      toast: {
        saved: 'Instellingen opgeslagen',
        reset: 'Instellingen gereset naar standaard',
        newSession: 'Nieuwe sessie gestart met nieuwe jurisdictie',
        returning: 'Terug naar landselectie...',
      },
    },
    dictaphone: {
      cooper: 'Cooper',
      replay: 'Herhalen',
      type: 'Typen',
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
  },
};
