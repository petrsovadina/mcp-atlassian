# MCP Atlassian Server

MCP server pro integraci Atlassian produktů (Confluence, Jira) s Model Context Protocol. Tento nástroj umožňuje snadný přístup k vašemu Confluence obsahu a Jira ticketům přímo přes MCP rozhraní.

## Funkce

### Confluence
- Vyhledávání obsahu pomocí CQL (Confluence Query Language)
- Přístup ke stránkám, přílohám a komentářům
- Filtrování podle prostoru (space)

### Jira
- Vyhledávání issues pomocí JQL (Jira Query Language)
- Získávání detailů o issues včetně statusu, přiřazení a časových značek

## Instalace

```bash
git clone https://github.com/petrsovadina/mcp-atlassian.git
cd mcp-atlassian
npm install
npm run build
```

## Konfigurace

Nastavte následující proměnné prostředí:

### Confluence
```
CONFLUENCE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_USERNAME=your-email@domain.com
CONFLUENCE_API_TOKEN=your-api-token
```

### Jira
```
JIRA_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your-email@domain.com
JIRA_API_TOKEN=your-api-token
```

## Použití v MCP

Přidejte následující konfiguraci do vašeho MCP settings souboru:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "node",
      "args": ["/path/to/mcp-atlassian/build/index.js"],
      "env": {
        "CONFLUENCE_URL": "your-confluence-url",
        "CONFLUENCE_USERNAME": "your-username",
        "CONFLUENCE_API_TOKEN": "your-api-token",
        "JIRA_URL": "your-jira-url",
        "JIRA_USERNAME": "your-username",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Dostupné nástroje

### confluence_search
Vyhledávání v Confluence obsahu pomocí CQL.

```typescript
{
  "query": "type=page AND space='Engineering'", // CQL dotaz
  "limit": 10 // volitelný limit výsledků (1-50)
}
```

### jira_search
Vyhledávání Jira issues pomocí JQL.

```typescript
{
  "jql": "project = ENG AND status = Open", // JQL dotaz
  "fields": "summary,status,assignee", // volitelné pole
  "limit": 10 // volitelný limit výsledků (1-50)
}
```

## Resource Templates

### Confluence Page
`confluence://{space_key}/pages/{title}`

### Jira Issue
`jira://{project_key}/issues/{issue_key}`

## Příklady použití

### Vyhledávání v Confluence
```typescript
const result = await mcp.use('confluence_search', {
  query: "type=page AND space='Engineering' ORDER BY created DESC",
  limit: 5
});
```

### Vyhledávání v Jira
```typescript
const result = await mcp.use('jira_search', {
  jql: "project = ENG AND status = 'In Progress'",
  fields: "summary,status,assignee,created",
  limit: 5
});
```

## Přispívání

Pokud chcete přispět k vývoji, můžete:
1. Forkovat repozitář
2. Vytvořit feature branch
3. Commitnout vaše změny
4. Pushnout branch
5. Vytvořit Pull Request

## Licence

MIT
