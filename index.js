const QQQIndicator = (context) => {
    const { Close } = context.data;

    // Configurações da API da Finnhub.io
    const API_URL = "https://finnhub.io/api/v1/quote";
    const API_KEY = "ct38d89r01qkff714cp0ct38d89r01qkff714cpg"; // Sua chave de API
    const SYMBOL = "QQQ"; // Símbolo do ETF QQQ

    let lastAPIUpdate = 0; // Timestamp da última atualização
    const UPDATE_INTERVAL = 60 * 60 * 1000; // Intervalo de atualização: 1 hora (em milissegundos)

    // Função para buscar o preço do QQQ na API
    async function fetchQQQPrice() {
        try {
            const now = Date.now();

            // Verifica se já é hora de atualizar
            if (now - lastAPIUpdate < UPDATE_INTERVAL) {
                return null; // Ainda não é hora de atualizar
            }

            // Faz a chamada à API
            const response = await fetch(`${API_URL}?symbol=${SYMBOL}&token=${API_KEY}`);
            const data = await response.json();
            lastAPIUpdate = now; // Atualiza o timestamp da última chamada

            return data.c || null; // Retorna o preço atual (campo "c" para Finnhub)
        } catch (error) {
            console.error("Erro ao buscar preço do QQQ:", error);
            return null; // Retorna null em caso de erro
        }
    }

    return {
        init() {
            this.qqqPrice = 0; // Valor inicial do QQQ
        },
        async map(d) {
            const nqPrice = d[Close]; // Preço atual do NQ

            // Estimativa baseada no NQ
            let qqqEstimate = nqPrice / 40;

            // Atualize o preço do QQQ periodicamente
            const qqqAPIPrice = await fetchQQQPrice();
            if (qqqAPIPrice) {
                this.qqqPrice = qqqAPIPrice; // Atualiza o valor do QQQ
            }

            // Retorna o valor da API (se disponível) ou a estimativa
            return this.qqqPrice || qqqEstimate;
        },
    };
};

export default {
    name: 'Finnhub QQQ Indicator',
    description: 'Displays real-time QQQ price using Finnhub API with periodic updates',
    init: QQQIndicator,
};
