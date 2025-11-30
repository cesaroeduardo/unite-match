// Background Script para a extensão UniteAPI Data Scraper
// Service Worker para gerenciar eventos da extensão

console.log('🔄 Background script iniciado');

// Gerenciar instalação da extensão
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ Extensão UniteAPI Data Scraper instalada');

  // Criar menu de contexto para extração rápida
  chrome.contextMenus.create({
    id: 'extractUniteApiData',
    title: 'Extrair dados com UniteMetrics',
    contexts: ['page'],
    documentUrlPatterns: ['*://uniteapi.dev/*'],
  });
});

// Gerenciar cliques no ícone da extensão (sem popup)
chrome.action.onClicked.addListener(tab => {
  console.log('🖱️ Ícone da extensão clicado, executando scraper...');

  // Verificar se a aba está na URL correta
  if (tab.url && tab.url.includes('uniteapi.dev')) {
    // Enviar mensagem para o content script executar o scraper
    chrome.tabs.sendMessage(tab.id, { action: 'executeScraper' }, response => {
      if (chrome.runtime.lastError) {
        console.log(
          '⚠️ Content script não respondeu, tentando executar diretamente...'
        );
        // Fallback: executar diretamente se o content script não responder
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            if (window.scraper) {
              console.log('🚀 Executando scraper via fallback...');
              window.scraper.startScraping();
            } else {
              console.log('⚠️ Scraper não encontrado, aguardando...');
              // Aguardar um pouco e tentar novamente
              setTimeout(() => {
                if (window.scraper) {
                  window.scraper.startScraping();
                } else {
                  console.error('❌ Scraper não pôde ser criado');
                }
              }, 1000);
            }
          },
        });
      } else {
        console.log('✅ Comando enviado para o content script:', response);
      }
    });
  } else {
    console.log('⚠️ Aba não está no UniteApi, redirecionando...');
    // Redirecionar para o UniteApi se não estiver na página correta
    chrome.tabs.update(tab.id, { url: 'https://uniteapi.dev' });
  }
});

// Gerenciar cliques no menu de contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extractUniteApiData') {
    console.log('🖱️ Menu de contexto clicado, executando scraper...');

    // Executar o content script na aba ativa
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // Verificar se o scraper já existe
        if (window.scraper) {
          console.log('🚀 Executando scraper existente...');
          window.scraper.startScraping();
        } else {
          console.log('⚠️ Scraper não encontrado, criando novo...');
          // Aguardar um pouco para o content script carregar
          setTimeout(() => {
            if (window.scraper) {
              window.scraper.startScraping();
            } else {
              console.error('❌ Scraper não pôde ser criado');
            }
          }, 1000);
        }
      },
    });
  }
});

// Gerenciar mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensagem recebida:', message);

  if (message.type === 'scrapingComplete') {
    console.log('✅ Scraping concluído, dados recebidos');
    // Aqui você pode adicionar lógica adicional se necessário
  }

  // Sempre responder para evitar erros
  sendResponse({ received: true });
});

// Gerenciar erros
chrome.runtime.onSuspend.addListener(() => {
  console.log('🔄 Background script sendo suspenso');
});

// Manter o service worker ativo
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Extensão iniciada');
});
