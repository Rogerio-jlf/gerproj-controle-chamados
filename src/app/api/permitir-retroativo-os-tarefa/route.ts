// app/api/backdated-permissions/route.ts
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// Interface das permissões
interface PermitirRetroativo {
   resourceId: string;
   resourceName: string;
   tarefaId: string;
   enabled: boolean;
   enabledAt: string;
   enabledBy: string;
}

// Caminho do arquivo JSON
const PERMISSIONS_FILE_PATH = path.join(
   process.cwd(),
   'data',
   'permitir-retroativo-os-tarefa.json'
);

// Função para garantir que o diretório existe
const ensureDataDirectory = () => {
   const dataDir = path.dirname(PERMISSIONS_FILE_PATH);
   if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
   }
};

// Função para ler as permissões do arquivo
const readPermissions = (): PermitirRetroativo[] => {
   try {
      ensureDataDirectory();

      if (!fs.existsSync(PERMISSIONS_FILE_PATH)) {
         // Se o arquivo não existe, cria um array vazio
         fs.writeFileSync(PERMISSIONS_FILE_PATH, JSON.stringify([], null, 2));
         return [];
      }

      const data = fs.readFileSync(PERMISSIONS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
   } catch (error) {
      console.error('Erro ao ler permissões:', error);
      return [];
   }
};

// Função para salvar as permissões no arquivo
const writePermissions = (permissions: PermitirRetroativo[]): boolean => {
   try {
      ensureDataDirectory();
      fs.writeFileSync(
         PERMISSIONS_FILE_PATH,
         JSON.stringify(permissions, null, 2)
      );
      return true;
   } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      return false;
   }
};

// Função para verificar autenticação
const checkAuth = (request: NextRequest) => {
   const token = request.headers.get('authorization')?.replace('Bearer ', '');
   if (!token) {
      return NextResponse.json(
         { error: 'Token não fornecido' },
         { status: 401 }
      );
   }
   return null;
};

// ================================================================================
// HANDLERS PARA CADA MÉTODO HTTP
// ================================================================================

// GET - Buscar permissões
export async function GET(request: NextRequest) {
   try {
      // Verificar autenticação
      const authError = checkAuth(request);
      if (authError) return authError;

      const { searchParams } = new URL(request.url);
      const resourceId = searchParams.get('resourceId');
      const tarefaId = searchParams.get('tarefaId');

      let permissions = readPermissions();

      // Filtrar por resourceId se fornecido
      if (resourceId) {
         permissions = permissions.filter(p => p.resourceId === resourceId);
      }

      // Filtrar por tarefaId se fornecido
      if (tarefaId) {
         permissions = permissions.filter(p => p.tarefaId === tarefaId);
      }

      return NextResponse.json(permissions);
   } catch (error) {
      console.error('Erro no GET:', error);
      return NextResponse.json(
         { error: 'Erro interno do servidor' },
         { status: 500 }
      );
   }
}

// POST - Habilitar permissão
export async function POST(request: NextRequest) {
   try {
      // Verificar autenticação
      const authError = checkAuth(request);
      if (authError) return authError;

      const body = await request.json();
      const { resourceId, resourceName, tarefaId, adminId } = body;

      if (!resourceId || !resourceName || !tarefaId || !adminId) {
         return NextResponse.json(
            {
               error: 'Parâmetros obrigatórios: resourceId, resourceName, tarefaId, adminId',
            },
            { status: 400 }
         );
      }

      const permissions = readPermissions();

      // Remove permissão existente para o mesmo recurso/tarefa
      const filteredPermissions = permissions.filter(
         p => !(p.resourceId === resourceId && p.tarefaId === tarefaId)
      );

      // Adiciona nova permissão
      const newPermission: PermitirRetroativo = {
         resourceId,
         resourceName,
         tarefaId,
         enabled: true,
         enabledAt: new Date().toISOString(),
         enabledBy: adminId,
      };

      const updatedPermissions = [...filteredPermissions, newPermission];

      if (writePermissions(updatedPermissions)) {
         return NextResponse.json({
            success: true,
            message: 'Permissão habilitada com sucesso',
            permission: newPermission,
         });
      } else {
         return NextResponse.json(
            { error: 'Erro ao salvar permissão' },
            { status: 500 }
         );
      }
   } catch (error) {
      console.error('Erro no POST:', error);
      return NextResponse.json(
         { error: 'Erro interno do servidor' },
         { status: 500 }
      );
   }
}

// DELETE - Desabilitar permissão
export async function DELETE(request: NextRequest) {
   try {
      // Verificar autenticação
      const authError = checkAuth(request);
      if (authError) return authError;

      const body = await request.json();
      const { resourceId, tarefaId } = body;

      if (!resourceId || !tarefaId) {
         return NextResponse.json(
            { error: 'Parâmetros obrigatórios: resourceId, tarefaId' },
            { status: 400 }
         );
      }

      const permissions = readPermissions();
      const updatedPermissions = permissions.filter(
         p => !(p.resourceId === resourceId && p.tarefaId === tarefaId)
      );

      if (writePermissions(updatedPermissions)) {
         return NextResponse.json({
            success: true,
            message: 'Permissão removida com sucesso',
         });
      } else {
         return NextResponse.json(
            { error: 'Erro ao remover permissão' },
            { status: 500 }
         );
      }
   } catch (error) {
      console.error('Erro no DELETE:', error);
      return NextResponse.json(
         { error: 'Erro interno do servidor' },
         { status: 500 }
      );
   }
}

// PUT - Verificar se tem permissão
export async function PUT(request: NextRequest) {
   try {
      // Verificar autenticação
      const authError = checkAuth(request);
      if (authError) return authError;

      const body = await request.json();
      const { resourceId, tarefaId } = body;

      if (!resourceId || !tarefaId) {
         return NextResponse.json(
            { error: 'Parâmetros obrigatórios: resourceId, tarefaId' },
            { status: 400 }
         );
      }

      const permissions = readPermissions();
      const hasPermission = permissions.some(
         p =>
            p.resourceId === resourceId && p.tarefaId === tarefaId && p.enabled
      );

      return NextResponse.json({
         hasPermission,
         resourceId,
         tarefaId,
      });
   } catch (error) {
      console.error('Erro no PUT:', error);
      return NextResponse.json(
         { error: 'Erro interno do servidor' },
         { status: 500 }
      );
   }
}
