# 🚀 Quick Start - Deploy VPS

Este é um guia rápido para deploy. Para instruções detalhadas, consulte [DEPLOY.md](./DEPLOY.md).

## ⚡ Deploy Rápido (5 minutos)

### 1. **No VPS** - Preparar ambiente

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Instalar PM2
sudo npm install -g pm2
```

### 2. **No VPS** - Fazer upload do código

```bash
# Criar diretório
sudo mkdir -p /var/www/predictive-maintenance
sudo chown -R $USER:$USER /var/www/predictive-maintenance
cd /var/www/predictive-maintenance

# Upload via SCP (executar no seu computador)
# scp -r ./* user@your-vps-ip:/var/www/predictive-maintenance/
```

### 3. **No VPS** - Build e iniciar

```bash
cd /var/www/predictive-maintenance

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.production .env.local
nano .env.local  # Adicionar GEMINI_API_KEY

# Build
npm run build

# Criar pasta de logs
mkdir -p logs

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. **No VPS** - Configurar Nginx

```bash
# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/predictive-maintenance

# Ativar site
sudo ln -s /etc/nginx/sites-available/predictive-maintenance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar firewall
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 5. ✅ **Pronto!**

Acesse: `http://seu-vps-ip`

## 🔒 SSL (Opcional mas Recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Comandos Úteis

```bash
pm2 status                    # Ver status
pm2 logs predictive-maintenance    # Ver logs
pm2 restart predictive-maintenance # Reiniciar
pm2 monit                     # Monitorar
```

## 🔄 Atualizar Aplicação

```bash
cd /var/www/predictive-maintenance
./deploy.sh  # Script automático
```

## 🆘 Problemas?

Consulte o guia completo: [DEPLOY.md](./DEPLOY.md)

---

**Estrutura de Arquivos para Deploy:**

```
predictive-maintenance-collector/
├── server.js              # Servidor Express
├── ecosystem.config.js    # Configuração PM2
├── nginx.conf            # Configuração Nginx
├── deploy.sh             # Script de deploy
├── .env.production       # Template de variáveis
├── package.json          # Dependências
├── dist/                 # Build (gerado após npm run build)
└── DEPLOY.md            # Documentação completa
```
