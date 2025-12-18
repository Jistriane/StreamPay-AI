# 🔒 SECURITY NOTICE - API Keys

## ⚠️ IMPORTANT

This repository must **NOT** contain real API keys committed to Git.

## Protected Files

The following files are in `.gitignore` and **must not be committed**:

- `backend/.env` - Contains all sensitive API keys
- Any `.env.local` or `.env.*.local` file

## Required API Keys

To run this project locally, you need:

### 1. Google Gemini AI
- Obtain at: https://makersuite.google.com/app/apikey
- Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`

### 2. Other APIs (Optional)
- Moralis API Key
- Etherscan API Key
- Infura API Key
- Chainlink RPC URL

## How to Configure

1. Copy the example file:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` and add your real API keys

3. **NEVER** commit the `.env` file to Git

## Security Check

Before committing, always run:

```bash
# Confirm .env is in .gitignore
grep -q "^\.env$" .gitignore && echo "✅ .env protected" || echo "❌ .env NOT protected"

# Ensure no keys are staged
git diff --cached | grep -i "api.*key" && echo "⚠️ Possible exposed key!" || echo "✅ No keys exposed"
```

## What to Do if You Exposed a Key

If you accidentally committed an API key:

1. **Revoke the key immediately** in the provider console
2. Generate a new key
3. Remove the key from Git history:
```bash
# For commits not pushed
git reset HEAD~1

# For already pushed commits (handle with care)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

4. Force push (only if necessary and carefully):
```bash
git push origin --force --all
```

## Best Practices

✅ **DO:**
- Use environment variables (`.env`)
- Add `.env` to `.gitignore`
- Rotate keys periodically
- Use different keys for dev/staging/prod
- Document which keys are required

❌ **DON'T:**
- Commit `.env` files
- Hardcode keys in code
- Share keys publicly
- Use the same key across projects
- Expose keys in the frontend

## Security Tools

Consider using:

- [git-secrets](https://github.com/awslabs/git-secrets) - Prevents committing secrets
- [truffleHog](https://github.com/trufflesecurity/truffleHog) - Detects secrets in history
- [gitleaks](https://github.com/gitleaks/gitleaks) - Secret scanner

## Contact

If you find exposed keys in this repository, please:

1. **DO NOT** use the keys
2. Open a PRIVATE issue
3. Notify the maintainers immediately

---

**Last updated:** December 11, 2025
