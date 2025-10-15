import LayoutPage from './Layout_Page';
import './style.css';
import { FiltersTabelaChamadosProvider } from '../../../contexts/Filters_Context_Tabela_Chamado';
import { FiltersTabelaOsProvider } from '../../../contexts/Filters_Context_Dia';
import { FiltersTabelaTarefaProvider } from '../../../contexts/Filters_Context_Tabela_Tarefa';

export default function TabelaChamadosRecursosPage() {
   return (
      <FiltersTabelaChamadosProvider>
         <FiltersTabelaOsProvider>
            <FiltersTabelaTarefaProvider>
               <LayoutPage />
            </FiltersTabelaTarefaProvider>
         </FiltersTabelaOsProvider>
      </FiltersTabelaChamadosProvider>
   );
}
