import LayoutPage from './Layout_Page';
import './style.css';
import { FiltersTabelaChamadoProvider } from '../../../contexts/Filters_Context_Tabela_Chamado';
import { FiltersTabelaOsProvider } from '../../../contexts/Filters_Context_Tabela_OS';
import { FiltersTabelaTarefaProvider } from '../../../contexts/Filters_Context_Tabela_Tarefa';

export default function TabelaChamadosRecursosPage() {
   return (
      <FiltersTabelaChamadoProvider>
         <FiltersTabelaOsProvider>
            <FiltersTabelaTarefaProvider>
               <LayoutPage />
            </FiltersTabelaTarefaProvider>
         </FiltersTabelaOsProvider>
      </FiltersTabelaChamadoProvider>
   );
}
