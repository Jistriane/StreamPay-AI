# 🔒 AVISO DE SEGURANÇA - API Keys

## ⚠️ IMPORTANTE

Este repositório **NÃO** deve conter chaves API reais commitadas no Git.

## Arquivos Protegidos

Os seguintes arquivos estão no `.gitignore` e **não devem ser commitados**:

- `backend/.env` - Contém todas as chaves API sensíveis
- Qualquer arquivo `.env.local` ou `.env.*.local`

## Chaves API Necessárias

Para executar este projeto localmente, você precisa:

### 1. Google Gemini AI
- Obtenha em: https://makersuite.google.com/app/apikey
- Adicione ao `backend/.env`: `GEMINI_API_KEY=sua_chave_aqui`

### 2. Outras APIs (Opcionais)
- Moralis API Key
- Etherscan API Key
- Infura API Key
- Chainlink RPC URL

## Como Configurar

1. Copie o arquivo de exemplo:
```bash
cp backend/.env.example backend/.env
```

2. Edite `backend/.env` e adicione suas chaves API reais

3. **NUNCA** faça commit do arquivo `.env` no Git

## Verificação de Segurança

Antes de fazer commit, sempre execute:

```bash
# Verificar se .env está no .gitignore
grep -q "^\.env$" .gitignore && echo "✅ .env protegido" || echo "❌ .env NÃO protegido"

# Verificar se não há chaves expostas
git diff --cached | grep -i "api.*key" && echo "⚠️ Possível chave exposta!" || echo "✅ Sem chaves expostas"
```

## O Que Fazer Se Você Expôs uma Chave

Se você acidentalmente commitou uma chave API:

1. **Revogue a chave imediatamente** no console do provedor
2. Gere uma nova chave
3. Remova a chave do histórico Git:
```bash
# Para commits não enviados
git reset HEAD~1

# Para commits já enviados (cuidado!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

4. Force push (apenas se necessário e com cuidado):
```bash
git push origin --force --all
```

## Boas Práticas

✅ **FAÇA:**
- Use variáveis de ambiente (`.env`)
- Adicione `.env` ao `.gitignore`
- Rotacione chaves periodicamente
- Use chaves diferentes para dev/staging/prod
- Documente quais chaves são necessárias

❌ **NÃO FAÇA:**
- Commit de arquivos `.env`
- Hardcode de chaves em código
- Compartilhe chaves publicamente
- Use a mesma chave em múltiplos projetos
- Exponha chaves no frontend

## Ferramentas de Segurança

Considere usar:

- [git-secrets](https://github.com/awslabs/git-secrets) - Previne commits de segredos
- [truffleHog](https://github.com/trufflesecurity/truffleHog) - Detecta segredos no histórico
- [gitleaks](https://github.com/gitleaks/gitleaks) - Scanner de segredos

## Contato

Se você descobrir chaves expostas neste repositório, por favor:

1. **NÃO** use as chaves
2. Abra uma issue PRIVADA
3. Notifique os mantenedores imediatamente

---

**Última atualização:** 11 de dezembro de 2025
