# ✅ Checklist de Deploy - VPS

Use este checklist para garantir que todos os passos foram executados corretamente.

## 📋 Pré-Deploy (No seu computador)

### Preparação do Código
- [ ] Código está commitado e atualizado no Git
- [ ] Todas as dependências estão listadas no `package.json`
- [ ] Build local foi testado com `npm run build`
- [ ] Aplicação foi testada em modo produção localmente
- [ ] Arquivo `.env.production` foi configurado (mas NÃO commitado)
- [ ] Chaves de API sensíveis estão em variáveis de ambiente

### Verificação de Arquivos
- [ ] `server.js` - Servidor Express criado
- [ ] `ecosystem.config.js` - Configuração PM2 criada
- [ ] `nginx.conf` - Configuração Nginx criada
- [ ] `deploy.sh` - Script de deploy criado
- [ ] `Dockerfile` - Dockerfile criado (se usar Docker)
- [ ] `docker-compose.yml` - Docker Compose criado (se usar Docker)
- [ ] `DEPLOY.md` - Documentação completa
- [ ] `QUICKSTART.md` - Guia rápido

## 🖥️ Configuração do VPS

### Acesso e Sistema
- [ ] Acesso SSH ao VPS configurado
- [ ] Sistema atualizado (`sudo apt update && sudo apt upgrade -y`)
- [ ] Swap configurado (se necessário)

### Software Base
- [ ] Node.js 20.x instalado
- [ ] NPM instalado e atualizado
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado
- [ ] Git instalado (se usar deployment via Git)

### Firewall e Segurança
- [ ] UFW configurado
- [ ] Portas 80 e 443 abertas
- [ ] Porta SSH protegida
- [ ] Fail2Ban instalado (opcional mas recomendado)

## 📁 Deploy da Aplicação

### Upload e Instalação
- [ ] Diretório `/var/www/predictive-maintenance` criado
- [ ] Permissões corretas configuradas
- [ ] Código transferido para o VPS
- [ ] Dependências instaladas (`npm install`)

### Configuração
- [ ] Arquivo `.env.local` criado no servidor
- [ ] `GEMINI_API_KEY` configurada
- [ ] Outras variáveis de ambiente configuradas
- [ ] Diretório `logs/` criado

### Build e Execução
- [ ] Build executado com sucesso (`npm run build`)
- [ ] Pasta `dist/` gerada corretamente
- [ ] PM2 iniciado (`pm2 start ecosystem.config.js`)
- [ ] PM2 configurado no boot (`pm2 startup` + `pm2 save`)
- [ ] Aplicação rodando (verificar com `pm2 status`)

## 🌐 Configuração do Nginx

### Nginx Setup
- [ ] Arquivo de configuração copiado para `/etc/nginx/sites-available/`
- [ ] Domínio/IP configurado no arquivo
- [ ] Link simbólico criado em `/etc/nginx/sites-enabled/`
- [ ] Site padrão removido (opcional)
- [ ] Configuração testada (`sudo nginx -t`)
- [ ] Nginx recarregado (`sudo systemctl reload nginx`)

### Teste HTTP
- [ ] Aplicação acessível via HTTP
- [ ] Páginas carregando corretamente
- [ ] Assets estáticos carregando
- [ ] API funcionando

## 🔒 SSL/HTTPS (Recomendado)

### Let's Encrypt
- [ ] Certbot instalado
- [ ] Domínio apontando para o VPS
- [ ] Certificado SSL obtido
- [ ] Nginx configurado para HTTPS
- [ ] Redirecionamento HTTP → HTTPS funcionando
- [ ] Renovação automática testada

## 📊 Monitoramento e Logs

### Verificações Finais
- [ ] PM2 logs funcionando (`pm2 logs`)
- [ ] Nginx logs acessíveis
- [ ] PM2 monit funcionando (`pm2 monit`)
- [ ] Aplicação reinicia automaticamente após crash
- [ ] Aplicação reinicia após reboot do servidor

### Performance
- [ ] Compressão gzip funcionando
- [ ] Cache de assets funcionando
- [ ] Tempo de resposta aceitável
- [ ] Uso de memória normal
- [ ] Uso de CPU normal

## 🔄 Backup e Recuperação

### Backup
- [ ] Script de backup criado
- [ ] Backup manual testado
- [ ] Backup automático configurado (cron)
- [ ] Local de backup definido
- [ ] Retenção de backups configurada

### Procedimento de Rollback
- [ ] Processo de rollback documentado
- [ ] Backup antes do deploy criado
- [ ] Restauração testada

## 📝 Documentação

### Informações Registradas
- [ ] Endereço IP do VPS documentado
- [ ] Credenciais armazenadas com segurança
- [ ] Comandos úteis documentados
- [ ] Contatos de suporte anotados
- [ ] Procedimentos de emergência documentados

## 🎉 Deploy Completo

Se todos os itens acima estão marcados, seu deploy está completo!

### URLs para Test Final
- [ ] HTTP: `http://seu-dominio.com` ou `http://seu-ip`
- [ ] HTTPS: `https://seu-dominio.com` (se SSL configurado)

### Comandos de Verificação Rápida

```bash
# Status geral
pm2 status
sudo systemctl status nginx

# Logs em tempo real
pm2 logs predictive-maintenance --lines 50

# Recursos do sistema
htop
df -h

# Processos Node
ps aux | grep node
```

## 🆘 Em caso de problemas

1. Consulte [DEPLOY.md](./DEPLOY.md) - seção "Solução de Problemas"
2. Verifique os logs: `pm2 logs` e `/var/log/nginx/error.log`
3. Teste a configuração: `sudo nginx -t`
4. Reinicie os serviços:
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   ```

---

**Data do Deploy:** _______________

**Responsável:** _______________

**Notas:** 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
