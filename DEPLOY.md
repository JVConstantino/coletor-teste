# 🚀 Guia de Deploy para VPS

Este guia fornece instruções completas para fazer o deploy da aplicação **Predictive Maintenance Collector** em um VPS comum (Ubuntu/Debian).

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ ou Debian 10+
- Acesso SSH root ou sudo
- Domínio apontando para o IP do VPS (opcional, mas recomendado)
- Mínimo 1GB RAM, 1 CPU Core, 20GB Storage

## 🔧 Preparação do VPS

### 1. Atualizar o Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js e NPM

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 4. Instalar Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 📦 Deploy da Aplicação

### 1. Criar Diretório da Aplicação

```bash
sudo mkdir -p /var/www/predictive-maintenance
sudo chown -R $USER:$USER /var/www/predictive-maintenance
cd /var/www/predictive-maintenance
```

### 2. Clonar ou Transferir o Código

**Opção A: Via Git**
```bash
git clone your-repository-url .
```

**Opção B: Via SCP (do seu computador local)**
```bash
# Execute no seu computador local (não no VPS)
scp -r ./predictive-maintenance-collector/* user@your-vps-ip:/var/www/predictive-maintenance/
```

### 3. Instalar Dependências

```bash
cd /var/www/predictive-maintenance
npm install
```

### 4. Configurar Variáveis de Ambiente

```bash
# Copiar template de produção
cp .env.production .env.local

# Editar com suas credenciais
nano .env.local
```

**Adicione suas chaves de API:**
```env
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=sua_chave_api_aqui
```

### 5. Build da Aplicação

```bash
npm run build
```

### 6. Criar Diretório de Logs

```bash
mkdir -p /var/www/predictive-maintenance/logs
```

### 7. Iniciar Aplicação com PM2

```bash
# Iniciar usando o arquivo de configuração
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Verificar status
pm2 status
pm2 logs predictive-maintenance
```

## 🌐 Configurar Nginx como Reverse Proxy

### 1. Criar Configuração do Site

```bash
sudo nano /etc/nginx/sites-available/predictive-maintenance
```

Cole o conteúdo do arquivo `nginx.conf` fornecido, substituindo `your-domain.com` pelo seu domínio.

### 2. Ativar o Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/predictive-maintenance /etc/nginx/sites-enabled/

# Remover site padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 3. Acessar a Aplicação

Acesse: `http://your-domain.com` ou `http://your-vps-ip`

## 🔒 Configurar SSL (HTTPS) com Let's Encrypt

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obter Certificado SSL

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Siga as instruções interativas. O Certbot irá:
- Obter certificado
- Configurar automaticamente o Nginx
- Configurar renovação automática

### 3. Verificar Renovação Automática

```bash
sudo certbot renew --dry-run
```

## 🔄 Deploy Automático (Opcional)

### 1. Tornar Script Executável

```bash
chmod +x /var/www/predictive-maintenance/deploy.sh
```

### 2. Executar Deploy

```bash
cd /var/www/predictive-maintenance
./deploy.sh
```

### 3. Configurar Deploy via Git Hooks (Avançado)

```bash
# No VPS, criar bare repository
mkdir -p /var/repo/predictive-maintenance.git
cd /var/repo/predictive-maintenance.git
git init --bare

# Criar post-receive hook
cat > hooks/post-receive << 'EOF'
#!/bin/bash
TARGET="/var/www/predictive-maintenance"
GIT_DIR="/var/repo/predictive-maintenance.git"
BRANCH="main"

while read oldrev newrev ref
do
    if [[ $ref = refs/heads/$BRANCH ]]; then
        echo "Deploying $BRANCH branch..."
        git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH
        cd $TARGET
        npm ci --only=production
        npm run build
        pm2 restart ecosystem.config.js
        echo "Deploy completed!"
    fi
done
EOF

chmod +x hooks/post-receive
```

**No seu computador local:**
```bash
git remote add production ssh://user@your-vps-ip/var/repo/predictive-maintenance.git
git push production main
```

## 📊 Monitoramento

### Comandos Úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs predictive-maintenance

# Monitorar recursos
pm2 monit

# Reiniciar aplicação
pm2 restart predictive-maintenance

# Ver informações detalhadas
pm2 show predictive-maintenance

# Limpar logs
pm2 flush
```

### Ver Logs do Nginx

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/predictive-maintenance-access.log

# Logs de erro
sudo tail -f /var/log/nginx/predictive-maintenance-error.log
```

### Monitorar Recursos do Sistema

```bash
# Uso de CPU e Memória
htop

# Uso de disco
df -h

# Processos
ps aux | grep node
```

## 🔧 Solução de Problemas

### Aplicação não inicia

```bash
# Verificar logs do PM2
pm2 logs predictive-maintenance --lines 100

# Verificar se a porta 3000 está em uso
sudo lsof -i :3000

# Reiniciar PM2
pm2 restart all
```

### Nginx mostra erro 502

```bash
# Verificar se a aplicação está rodando
pm2 status

# Verificar configuração do Nginx
sudo nginx -t

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Build falha

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Tentar build novamente
npm run build
```

### Memória insuficiente

```bash
# Criar swap file (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 🔐 Segurança

### 1. Configurar SSH com Chave

```bash
# Gerar chave SSH (no seu computador)
ssh-keygen -t rsa -b 4096

# Copiar para VPS
ssh-copy-id user@your-vps-ip

# Desabilitar login com senha no VPS
sudo nano /etc/ssh/sshd_config
# Alterar: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2. Instalar Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Manter Sistema Atualizado

```bash
# Atualizar regularmente
sudo apt update && sudo apt upgrade -y

# Configurar atualizações automáticas de segurança
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 Otimização de Performance

### 1. Ajustar PM2 para Produção

```bash
# Editar ecosystem.config.js se necessário
# Ajustar número de instances baseado nos cores da CPU

# Reiniciar com nova configuração
pm2 reload ecosystem.config.js
```

### 2. Habilitar Cache do Nginx

Já está configurado no `nginx.conf` fornecido.

### 3. Monitorar Performance

```bash
# Instalar ferramentas de monitoramento
sudo apt install -y htop iotop nethogs

# Configurar PM2 Plus (opcional - serviço pago/free tier)
pm2 link <secret_key> <public_key>
```

## 🆘 Backup e Restauração

### Backup Manual

```bash
# Backup completo
cd /var/www
sudo tar -czf predictive-maintenance-backup-$(date +%Y%m%d).tar.gz predictive-maintenance/

# Mover para local seguro
scp predictive-maintenance-backup-*.tar.gz user@backup-server:/backups/
```

### Restauração

```bash
# Extrair backup
cd /var/www
sudo tar -xzf predictive-maintenance-backup-YYYYMMDD.tar.gz

# Reinstalar dependências e rebuild
cd predictive-maintenance
npm install
npm run build
pm2 restart ecosystem.config.js
```

### Backup Automatizado (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar backup diário às 2h da manhã
0 2 * * * cd /var/www && tar -czf /var/backups/predictive-maintenance-$(date +\%Y\%m\%d).tar.gz predictive-maintenance/ && find /var/backups -name "predictive-maintenance-*.tar.gz" -mtime +7 -delete
```

## 📞 Suporte

Para mais informações ou problemas específicos, consulte:
- Documentação do PM2: https://pm2.keymetrics.io/
- Documentação do Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/

---

**Última atualização:** Dezembro 2025
