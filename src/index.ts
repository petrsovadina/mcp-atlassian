#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const CONFLUENCE_URL = process.env.CONFLUENCE_URL;
const CONFLUENCE_USERNAME = process.env.CONFLUENCE_USERNAME;
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN;

if (!CONFLUENCE_URL || !CONFLUENCE_USERNAME || !CONFLUENCE_API_TOKEN) {
  throw new Error('Missing required Confluence environment variables');
}

class ConfluenceServer {
  private server: Server;
  private confluenceAxios;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-confluence',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {
            list: true,
            templates: true,
            read: true,
          },
          tools: {
            list: true,
            call: true,
          },
        },
      }
    );

    if (!CONFLUENCE_URL || !CONFLUENCE_USERNAME || !CONFLUENCE_API_TOKEN) {
      throw new Error('Missing required Confluence environment variables');
    }

    // Setup Confluence client with validated env vars
    this.confluenceAxios = axios.create({
      baseURL: `${CONFLUENCE_URL}/rest/api`,
      auth: {
        username: CONFLUENCE_USERNAME,
        password: CONFLUENCE_API_TOKEN,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'confluence_search',
          description: 'Search Confluence content using CQL',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'CQL query string'
              },
              limit: {
                type: 'number',
                description: 'Results limit (1-50)',
                minimum: 1,
                maximum: 50
              }
            },
            required: ['query']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'confluence_search': {
            const { query, limit = 10 } = request.params.arguments as any;
            const response = await this.confluenceAxios.get('/content/search', {
              params: {
                cql: query,
                limit: limit,
                expand: 'space'
              }
            });

            return {
              content: [{
                type: 'text',
                text: JSON.stringify(response.data.results.map((r: any) => ({
                  id: r.id,
                  title: r.title,
                  type: r.type,
                  space: r.space?.name,
                  url: `${CONFLUENCE_URL}${r._links?.webui}`,
                  lastModified: r.history?.lastUpdated?.when
                })), null, 2)
              }]
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `API error: ${error.response?.data?.message || error.message}`
          );
        }
        throw error;
      }
    });

    // List available resource templates
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [
        {
          uriTemplate: 'confluence://{space_key}/pages/{title}',
          name: 'Confluence Page',
          description: 'Access specific Confluence pages'
        }
      ]
    }));

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Confluence MCP server running on stdio');
  }
}

const server = new ConfluenceServer();
server.run().catch(console.error);