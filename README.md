<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Predictive Maintenance Collector

Sistema de coleta e análise de dados para manutenção preditiva com IA.

View your app in AI Studio: https://ai.studio/apps/drive/1AX9aPJ6swLgQAB44EpaAn_huyB9WfPYA

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## 🌐 Deploy to VPS

Temos três opções de deploy:

### Opção 1: Deploy Tradicional (PM2 + Nginx)

**Quick Start:**
```bash
npm install
npm run build
pm2 start ecosystem.config.js
```

📚 **Guias completos:**
- [QUICKSTART.md](./QUICKSTART.md) - Deploy rápido em 5 minutos
- [DEPLOY.md](./DEPLOY.md) - Guia completo e detalhado

### Opção 2: Deploy com Docker

```bash
# Build da imagem
docker build -t predictive-maintenance .

# Executar container
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  --name predictive-maintenance \
  predictive-maintenance
```

### Opção 3: Deploy com Docker Compose

```bash
# Configurar variável de ambiente
echo "GEMINI_API_KEY=your_key" > .env

# Iniciar todos os serviços
docker-compose up -d
```

## 📁 Estrutura do Projeto

```
predictive-maintenance-collector/
├── App.tsx                 # Componente principal
├── components/             # Componentes React
├── server.js              # Servidor Express (produção)
├── ecosystem.config.js    # Configuração PM2
├── nginx.conf            # Configuração Nginx
├── Dockerfile            # Build Docker
├── docker-compose.yml    # Orquestração Docker
├── deploy.sh             # Script de deploy
├── package.json          # Dependências
├── DEPLOY.md            # Documentação completa de deploy
└── QUICKSTART.md        # Guia rápido de deploy
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build localmente
- `npm start` - Inicia servidor de produção
- `npm run start:prod` - Inicia em modo produção

## 🛠️ Tecnologias

- **Frontend:** React 19, TypeScript
- **Build:** Vite
- **Server:** Express.js
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **Containerização:** Docker

## 📊 Monitoramento

Com PM2:
```bash
pm2 status                          # Status da aplicação
pm2 logs predictive-maintenance     # Ver logs
pm2 monit                           # Dashboard de monitoramento
```

## 🔐 Segurança

- ✅ Variáveis de ambiente para chaves de API
- ✅ HTTPS com Let's Encrypt (via Nginx)
- ✅ Headers de segurança configurados
- ✅ Compressão gzip habilitada
- ✅ Rate limiting (configurável)

## 📝 Licença

Este projeto está sob licença privada.

## 🆘 Suporte

Para problemas ou dúvidas sobre deploy:
- Consulte [DEPLOY.md](./DEPLOY.md) para troubleshooting
- Veja [QUICKSTART.md](./QUICKSTART.md) para início rápido

---

**Última atualização:** Dezembro 2025

